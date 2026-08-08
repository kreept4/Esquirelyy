'use client'

import { Clock } from 'lucide-react'
import Footer from '@/components/layout/Footer'

/**
 * Shared frame for the three AI tools.
 *
 * All three were ~400 lines of inline styles with their own private colour
 * constants, which is how they ended up with three different greys for the same
 * label and none of the amber-header, carton-card language the rest of the site
 * settled on. The frame is here, the vocabulary is in globals.css under TOOLS,
 * and each page keeps only the parts that differ.
 *
 * `onHistory` is optional: interview prep has no saved history to open.
 */
export default function ToolShell({
  title,
  lede,
  onHistory,
  children,
}: {
  title: string
  lede: string
  onHistory?: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <main className="page-main doc-page tool-page">
        <header className="doc-masthead">
          <div className="shell doc-masthead-inner tool-masthead-inner">
            <div className="tool-masthead-row">
              <h1 className="display-black doc-title">{title}</h1>
              {onHistory && (
                <button type="button" onClick={onHistory} className="grotesk-bold tool-history-btn">
                  <Clock size={14} aria-hidden /> History
                </button>
              )}
            </div>
            <p className="grotesk-regular doc-lede">{lede}</p>
          </div>
        </header>

        <div className="shell tool-body">{children}</div>
      </main>
      <Footer />
    </>
  )
}
