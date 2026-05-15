'use client'

import { useState } from 'react'
import { Tenant } from '@/types/admin'
import { StatusBadge } from './StatusBadge'
import styles from './TenantsTable.module.css'
import { Wifi, WifiOff } from 'lucide-react'

export function TenantsTable({ tenants }: { tenants: Tenant[] }) {
  const [list, setList]       = useState<Tenant[]>(tenants)
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggle = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active'
    setLoading(tenant.id)
    try {
      const res = await fetch('/api/admin/tenant-status', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ tenantId: tenant.id, status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setList(prev => prev.map(t => t.id === tenant.id ? { ...t, status: newStatus } : t))
    } catch {
      alert('Erro ao atualizar status. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Segmento</th>
            <th>WhatsApp</th>
            <th>Status</th>
            <th>Próx. cobrança</th>
            <th>Criado em</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map(tenant => (
            <tr key={tenant.id}>
              <td>
                <div className={styles.companyName}>{tenant.company_name}</div>
                <div className={styles.companyEmail}>{tenant.owner_email}</div>
              </td>
              <td>
                <span className={styles.segPill}>{tenant.segments?.name ?? '—'}</span>
              </td>
              <td>
                {tenant.whatsapp_instances?.status === 'connected'
                  ? <Wifi size={16} color="#4ade80" />
                  : tenant.whatsapp_instances?.status === 'connecting'
                    ? <Wifi size={16} color="#fbbf24" />
                    : <WifiOff size={16} color="#f87171" />}
              </td>
              <td><StatusBadge status={tenant.status} /></td>
              <td className={styles.billing}>
                {tenant.next_billing_at
                  ? new Date(tenant.next_billing_at).toLocaleDateString('pt-BR')
                  : '—'}
              </td>
              <td className={styles.date}>
                {new Date(tenant.created_at).toLocaleDateString('pt-BR')}
              </td>
              <td>
                <button
                  className={`${styles.actionBtn} ${tenant.status === 'active' ? styles.danger : styles.success}`}
                  onClick={() => handleToggle(tenant)}
                  disabled={loading === tenant.id}
                >
                  {loading === tenant.id ? '...' : tenant.status === 'active' ? 'Suspender' : 'Ativar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p className={styles.empty}>Nenhum cliente encontrado.</p>}
    </div>
  )
}
