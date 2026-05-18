'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Loader2, CheckCircle } from 'lucide-react'
import styles from '@/app/styles/Dashboard.module.css'
import { getTenantStatus, refreshQrCode } from '@/lib/api'

interface Props {
  tenantId:      string
  initialQrCode: string | null
}

export function QrCodePanel({ tenantId, initialQrCode }: Props) {
  const [qrCode,    setQrCode]    = useState<string | null>(initialQrCode)
  const [connected, setConnected] = useState(false)
  const [loadingQr, setLoadingQr] = useState(false)

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const status = await getTenantStatus(tenantId)
        if (status.whatsapp === 'connected') {
          setConnected(true)
          clearInterval(interval)
        }
        if (status.qrCode) setQrCode(status.qrCode)
      } catch {}
    }, 4000)

    return () => clearInterval(interval)
  }, [tenantId])

  const handleRefresh = async () => {
    setLoadingQr(true)
    try {
      const { qrCode: newQr } = await refreshQrCode(tenantId)
      setQrCode(newQr)
    } catch {
      alert('Erro ao gerar novo QR Code. Tente novamente.')
    } finally {
      setLoadingQr(false)
    }
  }

  if (connected) {
    return (
      <div className={styles.card} style={{ textAlign: 'center', padding: '2rem' }}>
        <CheckCircle size={40} color="#4ade80" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '15px' }}>
          WhatsApp conectado com sucesso!
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '6px' }}>
          Recarregue a página para ver o painel atualizado.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Conecte seu WhatsApp</h2>
        <span className={`${styles.badge} ${styles.badgeWait}`}>
          <span className={`${styles.dot} ${styles.dotWait}`} />
          Aguardando
        </span>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.6 }}>
        Abra o WhatsApp do número de atendimento da sua empresa →{' '}
        <strong style={{ color: '#fff' }}>Aparelhos conectados → Conectar aparelho</strong>{' '}
        → Escaneie o QR Code abaixo.
      </p>

      <div style={{ textAlign: 'center' }}>
        {qrCode ? (
          <div className={styles.qrWrapper}>
            <img
              src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
              alt="QR Code WhatsApp"
              width={180}
              height={180}
              style={{ display: 'block' }}
            />
          </div>
        ) : (
          <div className={styles.qrPlaceholder}>
            <Loader2 size={28} color="#9d4edd" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '12px' }}>
          O QR Code expira em 60 segundos.
        </p>

        <button className={styles.btn} onClick={handleRefresh} disabled={loadingQr}>
          {loadingQr ? <Loader2 size={14} /> : <RefreshCw size={14} />}
          Gerar novo QR Code
        </button>
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
