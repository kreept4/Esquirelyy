'use client'

import { Search, Trello, GraduationCap, Landmark, Bell, Sparkles, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  search: Search,
  tracker: Trello,
  scholarship: GraduationCap,
  firm: Landmark,
  alert: Bell,
  ai: Sparkles,
}

export default function HomeIcons({ type }: { type: string }) {
  if (type === 'hero') return (
    <img src='/job-hunt-hero.svg' alt='Legal career illustration' className='w-full max-w-lg' />
  )

  const Icon = ICONS[type]
  if (!Icon) return null
  return <Icon size={22} strokeWidth={1.75} />
}
