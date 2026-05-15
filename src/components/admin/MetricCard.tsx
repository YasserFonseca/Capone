import styles from './MetricCard.module.css'
import { ReactNode } from 'react'

interface MetricCardProps {
  label:     string
  value:     string | number
  sub?:      string
  subType?:  'up' | 'down' | 'neutral'
  icon?:     ReactNode
  gradient?: boolean
}

export function MetricCard({ label, value, sub, subType = 'neutral', icon, gradient }: MetricCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {label}
      </div>
      <div className={`${styles.value} ${gradient ? styles.gradient : ''}`}>
        {value}
      </div>
      {sub && (
        <div className={`${styles.sub} ${styles[subType]}`}>
          {sub}
        </div>
      )}
    </div>
  )
}
