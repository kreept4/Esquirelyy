import { extractText as extractPdfText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'

/**
 * Reading an uploaded CV.
 *
 * Lifted out of the review route because the generator needs exactly the same
 * thing, and two copies of file parsing is how one of them ends up accepting a
 * file type the other rejects.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

/** Below this, whatever came out of the file is not a CV. */
const MIN_USABLE_CHARS = 50

export async function extractCvText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) {
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractPdfText(pdf, { mergePages: true })
    return text
  }

  if (name.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (name.endsWith('.txt')) {
    return buffer.toString('utf-8')
  }

  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')
}

/**
 * Validate an upload and read it, returning either the text or the sentence to
 * show the user. Both routes made the same three checks in the same order and
 * worded the third one differently.
 */
export async function readUpload(
  file: File | null
): Promise<{ text: string } | { error: string; status: number }> {
  if (!file) return { error: 'No file uploaded', status: 400 }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: 'File too large. Maximum size is 5MB.', status: 400 }
  }

  const text = await extractCvText(file)

  if (!text || text.trim().length < MIN_USABLE_CHARS) {
    // Almost always a scanned or photographed CV. Saying so is more useful than
    // saying the file could not be read, because the fix is different.
    return {
      error:
        'Could not read any text from this file. If it is a scan or a photograph, export a text version from Word or Google Docs and try that.',
      status: 400,
    }
  }

  return { text }
}
