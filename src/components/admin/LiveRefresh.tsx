'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

export function LiveRefresh({ intervalSec = 30 }: { intervalSec?: number }) {
  const router              = useRouter()
  const [sec, setSec]       = useState(intervalSec)
  const [isPending, startTransition] = useTransition()
  const secRef              = useRef(intervalSec)
  secRef.current            = sec

  useEffect(() => {
    const tick = setInterval(() => {
      setSec(prev => {
        if (prev <= 1) {
          // startTransition marks the refresh as non-urgent — won't block user interactions
          startTransition(() => router.refresh())
          return intervalSec
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [router, intervalSec, startTransition])

  return (
    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
      {isPending ? 'Atualizando…' : `Atualiza em ${sec}s`}
    </span>
  )
}
