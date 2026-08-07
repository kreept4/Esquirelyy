/**
 * Lets the render test import the app's .ts modules directly.
 *
 * Node can strip types on its own but will not guess a missing extension, and
 * the app's source uses extensionless relative imports because that is what
 * Next.js and tsc expect. This adds the `.ts` back at resolve time and maps the
 * `@/` alias onto src/, which is the only reason a plain `node` run differs
 * from what the route handlers see.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export async function resolve(specifier, context, next) {
  let spec = specifier

  if (spec.startsWith('@/')) {
    spec = pathToFileURL(path.join(ROOT, 'src', spec.slice(2))).href
  }

  const isRelative = spec.startsWith('./') || spec.startsWith('../')
  const isFileUrl = spec.startsWith('file:')

  if ((isRelative || isFileUrl) && !/\.[a-z]+$/i.test(spec)) {
    const base = isFileUrl
      ? fileURLToPath(spec)
      : path.resolve(path.dirname(fileURLToPath(context.parentURL)), spec)

    for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
      if (fs.existsSync(candidate)) return next(pathToFileURL(candidate).href, context)
    }
  }

  return next(spec, context)
}
