'use client'

import { useState, useEffect } from 'react'
import { JobPlatform } from '@/lib/types'

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<JobPlatform[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/platforms')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPlatforms(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const active = platforms.filter((p) => p.is_active)

  return { platforms, active, loading }
}
