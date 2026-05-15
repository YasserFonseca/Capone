'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LiveRefresh({ intervalSec = 30 }: { intervalSec?: number }) {
  const router    = useRouter()
  const [sec, setSec] = useState(intervalSec)

  useEffect(() => {
    const tick = setInterval(() => {
      setSec(prev => {
        if (prev <= 1) {
          router.refresh()
          return intervalSec
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [router, intervalSec])

  return (
    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
      Atualiza em {sec}s
    </span>
  )
}
