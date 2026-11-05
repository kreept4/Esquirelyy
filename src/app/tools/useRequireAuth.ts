'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useRequireAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        /* The query string goes along too. A link from the roles email or a
           tracker row carries the role it was opened for, and dropping it at
           the login wall would hand a signed-out reader a blank form after
           they had signed in. */
        router.push('/auth/login?redirect=' + encodeURIComponent(pathname + window.location.search))
        return
      }
      setUserId(data.user.id)
      setChecking(false)
    })
  }, [router, pathname])

  return { checking, userId }
}
