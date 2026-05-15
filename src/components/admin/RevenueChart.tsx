'use client'

import { RevenuePoint } from '@/types/admin'
import styles from './RevenueChart.module.css'

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const max    = Math.max(...data.map(d => d.amount), 1)
  const isLast = (i: number) => i === data.length - 1

  return (
    <div className={styles.wrapper}>
      <div className={styles.bars}>
        {data.map((point, i) => {
          const heightPct = Math.max((point.amount / max) * 100, 4)
          return (
            <div key={point.month} className={styles.barWrap}>
              <span className={styles.tooltip}>
                R${point.amount.toLocaleString('pt-BR')}
              </span>
              <div
                className={`${styles.bar} ${isLast(i) ? styles.highlight : ''}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className={`${styles.label} ${isLast(i) ? styles.labelActive : ''}`}>
                {point.month}
              </span>
            </div>
          )
        })}
      </div>
      <div className={styles.footer}>
        <span>R$0</span>
        <span>
          Atual:{' '}
          <strong style={{ color: '#c77dff' }}>
            R${(data[data.length - 1]?.amount ?? 0).toLocaleString('pt-BR')}
          </strong>
        </span>
        <span>Máximo: R${max.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  )
}
