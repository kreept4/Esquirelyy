import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

/**
 * Hashing for the password reuse check.
 *
 * THIS IS NOT AN AUTHENTICATION STORE. Supabase owns the credential a user
 * actually signs in with. These hashes answer one question, asked once, at the
 * moment somebody sets a new password: have you used this exact string on this
 * account before. Nothing reads them to let anyone in.
 *
 * scrypt, from node:crypto, rather than bcrypt or argon2. Both of those are
 * native modules that have to compile, and this runs on a serverless function
 * where a postinstall build step is the thing most likely to break a deploy for
 * a feature this small. scrypt is in the standard library, is memory hard, and
 * is what Node ships for exactly this purpose.
 *
 * N=16384 is the Node default and takes roughly 100ms here. That is a deliberate
 * cost: it is paid once per password change and once per stored hash during the
 * comparison, and it is what makes a stolen table expensive to attack. The
 * comparison loop is bounded by HISTORY_DEPTH for the same reason, so the work
 * cannot grow without limit as an account ages.
 */

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>

const KEY_LENGTH = 64
const SALT_BYTES = 16

/**
 * How many past passwords are remembered.
 *
 * Not unlimited. Every stored hash costs a full scrypt derivation on every
 * future change, so an account that has changed its password fifty times would
 * spend five seconds in this check. Ten is the depth most password policies
 * settle on, and beyond that the rule stops being "do not cycle back to the old
 * one" and starts being a memory test that pushes people toward writing it down.
 */
export const HISTORY_DEPTH = 10

/** "scrypt$<salt-hex>$<hash-hex>". The prefix names the algorithm so a later
 *  migration can tell stored formats apart instead of guessing. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES)
  const derived = await scrypt(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

/**
 * Constant time comparison against one stored hash.
 *
 * `timingSafeEqual` throws on a length mismatch, so the lengths are checked
 * first and a mismatch returns false rather than being allowed to throw: a
 * malformed or truncated row must not be able to take down a password change.
 */
export async function matchesHash(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false

  const [, saltHex, hashHex] = parts
  try {
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    if (expected.length !== KEY_LENGTH) return false

    const derived = await scrypt(password, salt, KEY_LENGTH)
    return timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

/** True when the password matches any hash in the list. */
export async function isReused(password: string, stored: string[]): Promise<boolean> {
  for (const hash of stored.slice(0, HISTORY_DEPTH)) {
    if (await matchesHash(password, hash)) return true
  }
  return false
}
