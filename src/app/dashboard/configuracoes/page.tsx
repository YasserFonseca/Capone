'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { Save, Loader2 }       from 'lucide-react'
import styles from '@/app/styles/Dashboard.module.css'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)
  const [form, setForm] = useState({
    contact_phone:  '',
    address:        '',
    business_hours: '',
    services:       '',
  })

  useEffect(() => {
    fetch('/api/dashboard/config')
      .then(r => r.json())
      .then(({ tenantId: tid, config }) => {
        if (!tid) { router.push('/dashboard'); return }
        setTenantId(tid)
        if (config) {
          setForm({
            contact_phone:  config.contact_phone ?? '',
            address:        config.address        ?? '',
            business_hours: typeof config.business_hours === 'object' && config.business_hours?.geral
              ? config.business_hours.geral
              : typeof config.business_hours === 'string'
                ? config.business_hours
                : '',
            services: Array.isArray(config.services)
              ? config.services.map((s: { name: string; price: number }) => `${s.name} R$${s.price}`).join('\n')
              : '',
          })
        }
        setLoading(false)
      })
      .catch(() => router.push('/login'))
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) return
    setSaving(true)
    try {
      const services = form.services
        .split('\n')
        .filter(l => l.trim())
        .map(line => {
          const match = line.match(/^(.+?)\s+R?\$?(\d+(?:[.,]\d+)?)/)
          return match
            ? { name: match[1].trim(), price: parseFloat(match[2].replace(',', '.')) }
            : { name: line.trim(), price: 0 }
        })

      const res = await fetch('/api/dashboard/config', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, services }),
      })

      if (!res.ok) throw new Error()

      // Pede ao backend para regenerar o prompt
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/provisioning/regenerate-prompt`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tenantId }),
      }).catch(() => {}) // ignora erro se backend offline

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Loader2 size={32} color="#9d4edd" style={{ animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.topbar}>
        <h1 className={styles.topbarTitle}>Configurações</h1>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Dados da empresa</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>
            Essas informações são usadas para parametrizar o bot. Após salvar, o prompt é atualizado automaticamente.
          </p>

          {success && (
            <div style={{ background: 'rgba(45,106,79,.2)', border: '1px solid rgba(74,222,128,.3)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#4ade80', fontSize: '13px' }}>
              ✓ Configurações salvas com sucesso!
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'contact_phone',  label: 'Telefone de contato',     placeholder: '(51) 99999-9999' },
              { id: 'address',        label: 'Endereço',                 placeholder: 'Rua das Flores, 123 — Porto Alegre, RS' },
              { id: 'business_hours', label: 'Horário de funcionamento', placeholder: 'Seg a Sex das 08h às 18h, Sáb das 08h às 13h' },
            ].map(f => (
              <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>{f.label}</label>
                <input
                  type="text"
                  value={form[f.id as keyof typeof form]}
                  onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ background: 'rgba(0,0,0,.4)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', outline: 'none', transition: 'border .2s' }}
                  onFocus={e => e.target.style.borderColor = '#9d4edd'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>Serviços e preços</label>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Um serviço por linha. Formato: Nome R$Valor (ex: Corte R$35)
              </p>
              <textarea
                value={form.services}
                onChange={e => setForm({ ...form, services: e.target.value })}
                placeholder={'Corte R$35\nBarba R$25\nCorte + Barba R$50'}
                rows={6}
                style={{ background: 'rgba(0,0,0,.4)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', fontFamily: 'inherit', outline: 'none', resize: 'vertical', transition: 'border .2s' }}
                onFocus={e => e.target.style.borderColor = '#9d4edd'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving} style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
              {saving ? <Loader2 size={16} /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
          </form>
        </div>
      </div>
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
