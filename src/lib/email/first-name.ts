/**
 * A member's first name, safe to put in an email's HTML, subject and text.
 *
 * The name is whatever the member typed at sign-up, and the templates drop it
 * straight into HTML ("Welcome, Ada."). Unescaped, a name like
 * `<a href="...">Ada</a>` would render as markup in that member's own email.
 * Each email only goes to the person whose name it is, so the reach is small,
 * but a name is never meant to carry markup, and the characters that start it
 * have no place in a first name. They are removed rather than escaped because
 * the same string goes into the subject and the plain-text part, where an
 * entity like &amp; would show as written.
 */
export function firstNameOf(name?: string | null): string {
  return (name || '')
    .replace(/[<>&"`]/g, '')
    .trim()
    .split(/\s+/)[0]
    .slice(0, 40)
}
