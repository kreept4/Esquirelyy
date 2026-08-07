'use client'

import type { CVSection, GeneratedCV } from '@/lib/cv/types'
import { sortSections } from '@/lib/cv/template'

/**
 * The generated CV, on screen.
 *
 * Worth having rather than sending people straight to a download. A rebuilt CV
 * is a document someone is about to attach to an application, and asking them
 * to open a file to find out what it says is the wrong order. They should be
 * able to read it, decide it is right, and only then download it.
 *
 * This is a preview, not a renderer. The DOCX and the PDF are drawn from the
 * measurements in lib/cv/template.ts and are the real output; this is the same
 * content in the browser's own text engine at a size that reads on a phone. It
 * follows the template's hierarchy closely enough to be recognisable and does
 * not pretend to be pixel accurate, because a preview that claims to be exact
 * and is off by a line is worse than one that plainly is not.
 *
 * The styling lives in globals.css under CV PREVIEW, next to the rest of the
 * tool vocabulary.
 */

function Entries({ section }: { section: Extract<CVSection, { kind: 'entries' }> }) {
  return (
    <>
      {section.entries.map((entry, i) => (
        <div key={i} className="cvp-entry">
          <div className="cvp-line">
            <span className="cvp-title">{entry.title}</span>
            {entry.titleRight && <span className="cvp-title cvp-right">{entry.titleRight}</span>}
          </div>

          {entry.subtitle && (
            <div className="cvp-line">
              <span className="cvp-subtitle">{entry.subtitle}</span>
              {entry.subtitleRight && (
                <span className="cvp-subtitle cvp-right">{entry.subtitleRight}</span>
              )}
            </div>
          )}

          {entry.detail && <p className="cvp-detail">{entry.detail}</p>}

          {entry.bullets && entry.bullets.length > 0 && (
            <ul className="cvp-bullets">
              {entry.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  )
}

export default function CVPreview({ cv }: { cv: GeneratedCV }) {
  return (
    // A document, so a screen reader announces it as one rather than as a run
    // of headings loose in the page.
    <article className="cvp" aria-label={`${cv.name} CV preview`}>
      <h2 className="cvp-name">{cv.name}</h2>

      <p className="cvp-contact">
        {cv.contact.map((c, i) => (
          <span key={i}>
            {i > 0 && <span className="cvp-sep"> | </span>}
            {c.href ? (
              <a href={c.href} target="_blank" rel="noopener noreferrer">
                {c.text}
              </a>
            ) : (
              c.text
            )}
          </span>
        ))}
      </p>

      {/* Sorted here as well as in the renderers, not instead of them.
          Ordering is applied at render time rather than baked into the stored
          document, so a CV saved before an ordering fix still comes out right.
          That only holds if every renderer agrees, and this is one: without it
          a document opened from history previews in one order and downloads in
          another, which reads as the download being wrong. */}
      {sortSections(cv.sections).map((section, i) => (
        <section key={i} className="cvp-section">
          <h3 className="cvp-heading">{section.heading}</h3>

          {section.kind === 'prose' && <p className="cvp-prose">{section.body}</p>}

          {section.kind === 'entries' && <Entries section={section} />}

          {section.kind === 'grouped' &&
            section.groups.map((g, j) => (
              <p key={j} className="cvp-group">
                <span className="cvp-group-label">{g.label}: </span>
                {g.items}
              </p>
            ))}
        </section>
      ))}
    </article>
  )
}
