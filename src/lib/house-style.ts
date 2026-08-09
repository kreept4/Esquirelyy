/**
 * The language rules every AI tool writes to.
 *
 * WHY THIS IS ONE STRING AND NOT FIVE
 *
 * Each of the five prompts grew its own copy of these rules and they had drifted
 * badly. The CV builder and the CV review banned a long list of tells. The cover
 * letter banned em dashes and a different list. The two interview routes said
 * only "You never use em dashes", which left them free to hand a student a
 * paragraph about leveraging their robust experience to unlock seamless
 * outcomes. Same product, same reader, three different standards, and the
 * weakest of them applied to the tool a nervous candidate reads just before an
 * interview.
 *
 * A user cannot tell which route produced which words. They only see whether
 * Esquirely sounds like a person. So the rule lives once, here, and every route
 * appends it to its own role-specific instructions.
 *
 * WHY THE BANNED LIST IS SPECIFIC RATHER THAN "DO NOT SOUND LIKE AI"
 *
 * A model cannot act on that instruction; it can act on a word list. Every entry
 * below is a word or construction that reliably marks text as generated, and the
 * em dash is first because it is the strongest single tell in English prose.
 *
 * Keep the phrasing plain and imperative. This string is read by a model, not
 * displayed, so it is optimised for compliance and not for elegance.
 */
export const HOUSE_STYLE = `
LANGUAGE RULES. These are absolute and override any stylistic instinct.

Never use an em dash or an en dash. Use a comma, a colon, a semicolon, a full
stop, or rewrite the sentence. Substituting a hyphen for a dash is not the fix,
recasting the sentence is.

Never use any of these: delve, tapestry, testament, showcase, elevate, unlock,
robust, seamless, spearhead, foster, navigate as a metaphor, landscape as a
metaphor, leverage as a verb, game changer, cutting edge, in today's competitive
market, it is worth noting, that being said, needless to say.

Never open by restating the question, never ask a rhetorical question, never
close with an offer of further help, and never describe someone's career as a
journey or a story.

Do not write triple-adjective lists. Do not write "it is not just X, it is Y".
Do not write a sentence whose only job is to sound impressive.

Vary sentence length and construction the way a person typing quickly does. Text
where every sentence runs to the same length and shape reads as machine written
even when every fact in it is true.

Use plain ASCII punctuation only. No smart quotes, no ellipsis character, no
symbols that could arrive as garbled text in an email client or a Word document.
`.trim()
