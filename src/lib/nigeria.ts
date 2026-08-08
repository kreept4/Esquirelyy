/**
 * The 36 states and the Federal Capital Territory.
 *
 * One list, imported everywhere a location is asked for or filtered on, so the
 * jobs board, the tracker and the account page cannot drift into offering
 * different answers to the same question. Free text was the alternative and it
 * fails quietly: "Lagos", "lagos", "Lagos State" and "Ikeja" are four values
 * that mean one place, and no filter written against them can be right.
 *
 * Alphabetical, with Abuja lifted to the top beside Lagos. Those two carry most
 * of the legal market between them, and burying Lagos between Kwara and Nasarawa
 * would make the common case the slowest one to find. Everything else sorts
 * normally, because past the first two there is no defensible ranking.
 *
 * "Abuja (FCT)" rather than "Federal Capital Territory": nobody says the latter,
 * and a listing written by a firm will say Abuja.
 */

export const NIGERIAN_STATES = [
  'Lagos',
  'Abuja (FCT)',
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const

export type NigerianState = (typeof NIGERIAN_STATES)[number]

/**
 * Options for a <select>, with a leading "any" entry.
 *
 * The empty value is the unset one everywhere, which is what lets a filter test
 * `!!location` and an account field store null without either needing to know
 * about the other.
 */
export function stateOptions(anyLabel: string) {
  return [{ value: '', label: anyLabel }, ...NIGERIAN_STATES.map(s => ({ value: s, label: s }))]
}

/**
 * Does a free-text location fall in the given state?
 *
 * Listings are written by people, not chosen from this list, so a role in
 * "Victoria Island, Lagos" has to be found by Lagos. Substring, case
 * insensitive, and the "(FCT)" suffix is dropped before matching so the option
 * label does not have to appear verbatim in a listing that just says Abuja.
 */
export function matchesState(location: string | null | undefined, state: string): boolean {
  if (!state) return true
  if (!location) return false
  const needle = state.replace(/\s*\(FCT\)\s*/i, '').trim().toLowerCase()
  return location.toLowerCase().includes(needle)
}
