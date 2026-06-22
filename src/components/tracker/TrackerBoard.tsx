'use client'

import { useMemo, useState } from 'react'
import { Application, Status } from '@/lib/tracker/types'
import { mockApplications } from '@/lib/tracker/mock'

const STATUSES: Status[] = [
  'Applied',
  'Assessment',
  'Interview I',
  'Interview II',
  'Offer',
  'Rejected',
]

export default function TrackerBoard() {
  const [apps] = useState<Application[]>(mockApplications)

  const grouped = useMemo(() => {
    const map: Record<string, Application[]> = {}

    STATUSES.forEach(s => (map[s] = []))

    apps.forEach(app => {
      map[app.status].push(app)
    })

    return map
  }, [apps])

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '24px',
      overflowX: 'auto',
    }}>
      {STATUSES.map(status => (
        <div key={status} style={{
          minWidth: '260px',
          background: '#FAF7F2',
          border: '1px solid #E7DED3',
          borderRadius: '8px',
          padding: '12px',
        }}>
          <h3 style={{ fontSize: '14px', marginBottom: '12px' }}>
            {status} ({grouped[status].length})
          </h3>

          {grouped[status].map(app => (
            <div
              key={app.id}
              style={{
                padding: '10px',
                marginBottom: '8px',
                borderRadius: '6px',
                background: 'white',
                border: '1px solid #eee',
              }}
            >
              <div style={{ fontWeight: 600 }}>{app.firm}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                {app.role}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}