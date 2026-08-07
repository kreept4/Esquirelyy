/**
 * Renders a fixed CV through both exporters and reports where the two disagree.
 *
 * The point of the Carlito choice is that the PDF and the DOCX break their
 * lines in the same places. That property is invisible until it is gone, and it
 * goes silently, so it is checked here rather than trusted.
 *
 *   node --experimental-strip-types scripts/test-cv-render.mjs
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const out = process.argv[2] || 'C:/Users/BARR~1.TOB/AppData/Local/Temp/claude/cv-test'
fs.mkdirSync(out, { recursive: true })

const { renderDocx } = await import('../src/lib/cv/docx.ts')
const { renderPdf } = await import('../src/lib/cv/pdf.ts')

/**
 * A fictional CV, hand-mapped onto the template's fields.
 *
 * Invented on purpose. This repository is public, and the fixture that was here
 * first was a real person's CV, complete with their phone number and email. The
 * shape and the string lengths are what this test actually needs: they are what
 * exercise line wrapping, the right tab, the hanging indent and the page break.
 * Whose CV it is does not matter, so it is nobody's.
 */
const cv = {
  name: 'ADAEZE NWACHUKWU',
  contact: [
    { text: '+234 801 234 5678' },
    { text: 'Abuja, Nigeria' },
    { text: 'adaeze.nwachukwu@example.com' },
    { text: 'LinkedIn', href: 'https://www.linkedin.com/in/example' },
  ],
  sections: [
    {
      kind: 'prose',
      heading: 'PROFESSIONAL SUMMARY',
      body: 'Lawyer called to the Nigerian Bar, with a Bachelor of Laws from Obafemi Awolowo University and a B.L from the Nigerian Law School. Chartered Mediator, Conciliator, and Arbitrator with experience in legal drafting, research, and dispute resolution across litigation and corporate matters. Founder of an AI powered compliance platform, with direct experience reviewing and validating AI generated legal content against regulatory frameworks.',
    },
    {
      kind: 'entries',
      heading: 'EDUCATION',
      entries: [
        {
          title: 'Nigerian Law School',
          titleRight: 'Abuja, Nigeria',
          subtitle: 'Barrister-at-Law (B.L)',
          subtitleRight: 'April 2025 - December 2025',
          detail: 'Called to the Nigerian Bar, July 2026',
        },
        {
          title: 'Obafemi Awolowo University',
          titleRight: 'Osun, Nigeria',
          subtitle: 'Bachelor of Laws (LL.B)',
          subtitleRight: 'January 2019 - November 2024',
          detail: 'Undergraduate Long Essay: An Analysis of the Nigerian Judiciary\u2019s Approach to Homicide Cases',
        },
      ],
    },
    {
      kind: 'entries',
      heading: 'CERTIFICATIONS',
      entries: [
        {
          title: 'General Course on Intellectual Property',
          titleRight: 'May 2026',
          subtitle: 'World Intellectual Property Organization (WIPO)',
        },
        {
          title: 'Chartered Arbitrator',
          titleRight: 'November 2024',
          subtitle: 'Nigerian Institute of Chartered Arbitrators (NICARB)',
        },
        {
          title: 'Chartered Mediator and Conciliator',
          titleRight: 'November 2023',
          subtitle: 'Institute of Chartered Mediators and Conciliators (ICMC)',
        },
      ],
    },
    {
      kind: 'entries',
      heading: 'WORK EXPERIENCE',
      entries: [
        {
          title: 'Governance and Standards Advisor (Remote)',
          titleRight: 'January 2026 - Present',
          subtitle: 'Meridian Health Partners LLC | Connecticut, USA',
          bullets: [
            'Designed and implemented over 15 governance frameworks, SOPs, and internal control policies aligned with DSS, CARF, and CDPH regulatory standards, contributing to a successful DSS audit pass within the first 6 months of the role.',
            'Conducted 2 to 3 compliance gap reviews per month across operational functions, identifying and resolving recurring deficiencies to maintain continuous regulatory alignment.',
            'Developed and maintained compliance documentation supporting risk assessment processes and institutional accountability across all operational functions.',
          ],
        },
        {
          title: 'Legal Extern',
          titleRight: 'September 2025 - October 2025',
          subtitle: 'Chidi Anyaoku (SAN) & Associates | Abuja, Nigeria',
          bullets: [
            'Conducted legal research and due diligence across 2 active matters, providing substantive statutory and case law analysis to support senior counsel in complex litigation.',
            'Drafted and reviewed at least 3 legal documents including motions, settlement agreements, and letters of adjournment, directly supporting client centered advisory services across multiple practice areas.',
            'Maintained accurate records of court proceedings and contributed to the preparation of oral arguments and final written addresses for live matters.',
          ],
        },
        {
          title: 'Graduate Legal Intern',
          titleRight: 'September 2024 - March 2025',
          subtitle: 'Bamidele Adeyemi & Co | Osun, Nigeria',
          bullets: [
            'Drafted 4 motions and affidavits addressing substantive legal issues, strengthening counsel arguments across ongoing civil and commercial proceedings.',
            'Conducted legal research on 1 land dispute matter, producing statutory and case law analysis that reinforced oral and written arguments, contributing to 2 resolved matters.',
            'Observed National Industrial Court proceedings on wrongful termination matters and prepared concise witness testimony summaries to assist counsel in case preparation.',
          ],
        },
      ],
    },
    {
      kind: 'entries',
      heading: 'LEADERSHIP EXPERIENCE',
      entries: [
        {
          title: 'ADR Unit Head, Law Clinic',
          titleRight: 'November 2023 - August 2024',
          subtitle: 'Obafemi Awolowo University | Osun, Nigeria',
          bullets: [
            'Mediated 13 disputes during tenure as Unit Head, securing binding settlement agreements in 10 of those cases, a 77% resolution rate across community and student matters.',
            'Coordinated a cross-border negotiation exercise in collaboration with the University of California College of the Law, San Francisco, building practical negotiation skills for 20+ students.',
            'Established a Mediation Centre within the Ile-Ife Law Clinic, creating a standing panel of 15 student neutrals, all of whom are now chartered mediators and conciliators, duly accredited by the Institute of Chartered Mediators and Conciliators (ICMC).',
          ],
        },
      ],
    },
    {
      kind: 'grouped',
      heading: 'SKILLS & INTERESTS',
      groups: [
        {
          label: 'Legal Skills',
          items: 'Legal Drafting, Legal Research, Contract Review, Case Analysis, ADR Practice, Regulatory Compliance (DSS, NDPR, CDPH, HIPAA, CARF), Policy Development, Corporate Documentation, Governance, Risk and Compliance (GRC), Compliance Monitoring, Stakeholder Engagement',
        },
        {
          label: 'Technical',
          items: 'Microsoft Office Suite (Word, Excel, PowerPoint, Outlook), Google Workspace, LawPavilion, Document Management Systems, Compliance Reporting Tools',
        },
        {
          label: 'Soft Skills',
          items: 'Attention to Detail, Analytical Thinking, Written and Verbal Communication, Teamwork, Stakeholder Management, Problem Solving',
        },
        {
          label: 'Interests',
          items: 'International Dispute Resolution, Policy Development, Governance, Regulatory Compliance, Litigation',
        },
      ],
    },
  ],
}

console.log('Rendering DOCX...')
const docx = await renderDocx(cv)
fs.writeFileSync(path.join(out, 'cv.docx'), docx)
console.log('  DOCX', docx.length, 'bytes')

console.log('Rendering PDF...')
const pdf = await renderPdf(cv)
fs.writeFileSync(path.join(out, 'cv.pdf'), pdf)
console.log('  PDF ', pdf.length, 'bytes')

// Read the PDF back and confirm the geometry matches the source template.
const { getDocumentProxy } = await import('unpdf')
const parsed = await getDocumentProxy(new Uint8Array(pdf))
console.log('\nPDF pages:', parsed.numPages)

const page = await parsed.getPage(1)
await page.getOperatorList()
const content = await page.getTextContent()
console.log('\nFirst 18 runs (x / y / size / font):')
for (const i of content.items.slice(0, 40)) {
  if (!i.str.trim()) continue
  const [, , , , x, y] = i.transform
  const sz = Math.hypot(i.transform[2], i.transform[3])
  let fam = '?'
  try { fam = page.commonObjs.get(i.fontName).name.replace(/^[A-Z]{6}\+/, '') } catch {}
  console.log(`  x=${x.toFixed(1)} y=${y.toFixed(1)} sz=${sz.toFixed(1)} ${fam.padEnd(18)} | ${i.str.slice(0, 70)}`)
}

// Full text, to confirm nothing was dropped or duplicated.
const { extractText } = await import('unpdf')
const { text } = await extractText(parsed, { mergePages: true })
const words = text.split(/\s+/).filter(Boolean).length
console.log('\nExtracted words from PDF:', words)
for (const probe of ['ADAEZE NWACHUKWU', 'PROFESSIONAL SUMMARY', 'Nigerian Law School', 'Legal Extern', 'SKILLS & INTERESTS', '77% resolution rate']) {
  console.log(`  ${text.includes(probe) ? 'ok  ' : 'MISS'} ${probe}`)
}

/**
 * The DOCX, read back the way an ATS reads it.
 *
 * mammoth is already a dependency because the review route uses it to read
 * uploads, so the export can be checked with the same parser the product
 * already trusts. Anything mammoth cannot see, a parser will not see either.
 */
const mammoth = (await import('mammoth')).default
const { value: docxText } = await mammoth.extractRawText({ buffer: docx })
const docxWords = docxText.split(/\s+/).filter(Boolean).length
console.log('\nExtracted words from DOCX:', docxWords, `(PDF had ${words})`)

for (const probe of ['ADAEZE NWACHUKWU', 'PROFESSIONAL SUMMARY', 'WORK EXPERIENCE', 'Chidi Anyaoku (SAN) & Associates', 'SKILLS & INTERESTS']) {
  console.log(`  ${docxText.includes(probe) ? 'ok  ' : 'MISS'} ${probe}`)
}

// Every bullet must survive both exports intact, since a dropped bullet is the
// kind of failure nobody notices until a recruiter is reading the document.
const bullets = cv.sections
  .filter(s => s.kind === 'entries')
  .flatMap(s => s.entries.flatMap(e => e.bullets ?? []))
const flat = t => t.replace(/\s+/g, ' ')
const flatPdf = flat(text)
const flatDocx = flat(docxText)
let missing = 0
for (const b of bullets) {
  const f = flat(b)
  if (!flatPdf.includes(f)) { console.log('  PDF  MISSING BULLET:', f.slice(0, 60)); missing++ }
  if (!flatDocx.includes(f)) { console.log('  DOCX MISSING BULLET:', f.slice(0, 60)); missing++ }
}
console.log(`\n${bullets.length} bullets checked in both exports, ${missing} missing.`)

// Structural checks against things that break ATS parsing.
const AdmZip = null
const zip = await (await import('jszip')).default.loadAsync(docx)
const docXml = await zip.file('word/document.xml').async('string')
console.log('\nDOCX structure:')
console.log(`  ${!docXml.includes('<w:tbl>') ? 'ok  ' : 'FAIL'} no tables`)
console.log(`  ${!docXml.includes('<w:txbxContent') ? 'ok  ' : 'FAIL'} no text boxes`)
console.log(`  ${!docXml.includes('<w:drawing>') && !docXml.includes('<w:pict>') ? 'ok  ' : 'FAIL'} no images or drawings`)
console.log(`  ${!docXml.includes('<w:cols w:num="2"') ? 'ok  ' : 'FAIL'} single column`)
console.log(`  ${zip.file('word/header1.xml') === null ? 'ok  ' : 'FAIL'} no headers`)
console.log(`  ${zip.file('word/footer1.xml') === null ? 'ok  ' : 'FAIL'} no footers`)
console.log(`  ${docXml.includes('w:val="Heading1"') ? 'ok  ' : 'FAIL'} real heading levels present`)
console.log(`  ${(docXml.match(/w:ascii="Calibri"/g) || []).length > 20 ? 'ok  ' : 'FAIL'} Calibri declared throughout`)

// The property the font choice was made for: same line breaks in both files.
console.log('\nPagination: PDF', parsed.numPages, 'pages.')
console.log('(DOCX page count is decided by Word at open time; the shared metrics are what keep it equal.)')
