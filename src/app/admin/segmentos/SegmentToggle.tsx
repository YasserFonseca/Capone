'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import tableStyles from '../../../components/admin/TenantsTable.module.css'

export function SegmentToggle({ segmentId, active }: { segmentId: string; active: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/segment-status', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ segmentId, active: !active }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
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
