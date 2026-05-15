import styles from './StatusBadge.module.css'

type StatusType =
  | 'active' | 'pending' | 'suspended'
  | 'connected' | 'connecting' | 'disconnected'
  | 'approved' | 'rejected' | 'refunded'

const CONFIG: Record<StatusType, { label: string; className: string }> = {
  active:       { label: 'Ativo',        className: 'success' },
  pending:      { label: 'Pendente',     className: 'warning' },
  suspended:    { label: 'Suspenso',     className: 'danger'  },
  connected:    { label: 'Conectado',    className: 'success' },
  connecting:   { label: 'Conectando',   className: 'warning' },
  disconnected: { label: 'Desconectado', className: 'danger'  },
  approved:     { label: 'Aprovado',     className: 'success' },
  rejected:     { label: 'Recusado',     className: 'danger'  },
  refunded:     { label: 'Estornado',    className: 'neutral' },
}

export function StatusBadge({ status }: { status: StatusType }) {
  const { label, className } = CONFIG[status] ?? { label: status, className: 'neutral' }
  return (
    <span className={`${styles.badge} ${styles[className]}`}>
      <span className={styles.dot} />
      {label}
    </span>
  )
}
