'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, MessageSquare, CreditCard, CheckCircle } from 'lucide-react'
import styles from '@/app/styles/Dashboard.module.css'

interface Props {
  tenantId:    string
  initialAppt: number
  initialMsg:  number
  mpConnected: boolean
  nextBilling: string | null
}

export function DashboardLiveMetrics({ tenantId, initialAppt, initialMsg, mpConnected, nextBilling }: Props) {
  const [apptToday, setApptToday] = useState(initialAppt)
  const [msgToday,  setMsgToday]  = useState(initialMsg)
  const [pulsing,   setPulsing]   = useState<{ appt: boolean; msg: boolean }>({ appt: false, msg: false })

  const fetchMetrics = useCallback(async () => {
    try {
      const res  = await fetch(`/api/dashboard/metrics?tenantId=${tenantId}`)
      if (!res.ok) return
      const data = await res.json()

      const changed = { appt: false, msg: false }

      if (data.apptToday !== apptToday) {
        setApptToday(data.apptToday)
        changed.appt = true
      }
      if (data.msgToday !== msgToday) {
        setMsgToday(data.msgToday)
        changed.msg = true
      }

      if (changed.appt || changed.msg) {
        setPulsing(changed)
        setTimeout(() => setPulsing({ appt: false, msg: false }), 2000)
      }
    } catch {
      // silencia erros de rede
    }
  }, [tenantId, apptToday, msgToday])

  useEffect(() => {
    const interval = setInterval(fetchMetrics, 30_000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchMetrics()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchMetrics])

  return (
    <div className={styles.metricsGrid}>
      {/* Agendamentos hoje */}
      <div className={styles.metricCard} style={{ position: 'relative' }}>
        {pulsing.appt && <PulsingDot />}
        <div className={styles.metricLabel}><Calendar size={13} /> Agendamentos hoje</div>
        <div className={styles.metricValue}>{apptToday}</div>
        <div className={styles.metricSub}>via bot</div>
      </div>

      {/* Mensagens hoje */}
      <div className={styles.metricCard} style={{ position: 'relative' }}>
        {pulsing.msg && <PulsingDot />}
        <div className={styles.metricLabel}><MessageSquare size={13} /> Mensagens hoje</div>
        <div className={styles.metricValue}>{msgToday}</div>
        <div className={styles.metricSub}>via WhatsApp</div>
      </div>

      {/* Mercado Pago */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}><CreditCard size={13} /> Mercado Pago</div>
        <div className={styles.metricValue} style={{ fontSize: '14px', marginTop: '4px', fontWeight: 700 }}>
          {mpConnected
            ? <span style={{ color: '#4ade80' }}>✓ Conectado</span>
            : <span style={{ color: '#a496b8' }}>Não configurado</span>
          }
        </div>
      </div>

      {/* Próx. cobrança */}
      <div className={styles.metricCard}>
        <div className={styles.metricLabel}><CheckCircle size={13} /> Próx. cobrança</div>
        <div className={styles.metricValue} style={{ fontSize: '18px' }}>{nextBilling ?? '—'}</div>
        <div className={styles.metricSub}>R$150/mês</div>
      </div>
    </div>
  )
}

function PulsingDot() {
  return (
    <span style={{
      position:     'absolute',
      top:          '10px',
      right:        '10px',
      width:        '8px',
      height:       '8px',
      borderRadius: '50%',
      background:   '#4ade80',
      display:      'block',
      animation:    'capone-pulse 1s ease-in-out infinite',
    }} />
  )
}
