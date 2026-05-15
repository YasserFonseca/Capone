'use client'

import { useState } from 'react'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export function SegmentToggle({ segmentId, active: initialActive }: { segmentId: string; active: boolean }) {
  const [active, setActive]   = useState(initialActive)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const next = !active
    setActive(next) // optimistic
    try {
      const res = await fetch('/api/admin/segment-status', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ segmentId, active: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setActive(!next) // reverter se falhar
      alert('Erro ao atualizar segmento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`${tableStyles.actionBtn} ${active ? tableStyles.danger : tableStyles.success}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '...' : active ? 'Desativar' : 'Ativar'}
    </button>
  )
}
