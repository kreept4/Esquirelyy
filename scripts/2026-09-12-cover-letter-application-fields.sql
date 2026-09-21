-- Keep the whole application on a saved cover letter, not just the role and the
-- employer.
-- Run in Supabase dashboard -> SQL Editor.
--
-- WHY THESE THREE COLUMNS
--
-- The letter tool now asks for three things it never used to, because the letter
-- itself now has to answer four questions it never used to: why this employer,
-- why this team, why this experience fits, and why the move is right.
--
--   division            which team the candidate is applying to. "Associate" at
--                       a firm with eleven practice areas tells the model
--                       nothing about what the work is; "Dispute Resolution"
--                       tells it everything, and it is what questions 2 and 3
--                       are answered against.
--
--   advert              the listing as published. The only text in the whole
--                       flow the employer wrote themselves, so it is what the
--                       letter answers when it says why this experience fits.
--
--   employer_knowledge  what the candidate already knows about the firm. A
--                       lecturer, an alum, a matter they read about. The only
--                       reason available that no other applicant has.
--
-- ⚠ WHY THEY ARE STORED AT ALL, given none of them is the output. The history
-- drawer restores a past application into the form so it can be regenerated or
-- adapted for another firm. Restoring two of the five inputs meant pressing
-- Write again produced a letter materially different from the one on the
-- screen, silently, because the division and the advert had been dropped on the
-- way in. A history that returns a different answer than it shows is worse than
-- no history.
--
-- ⚠ THE CV IS STILL NOT STORED, here or anywhere, and this migration does not
-- change that. It is read in memory, parsed, and dropped when the request ends.
-- That is the promise the tool makes on the upload box and it is kept. The
-- advert is a public job listing and the knowledge box is a sentence the
-- candidate typed about a firm; neither is personal data of the kind a CV is.
--
-- All three are nullable, and every one of them is optional in the form. Old
-- rows get NULL, which is exactly right: those letters were written without
-- them.

alter table public.cover_letters add column if not exists division text;
alter table public.cover_letters add column if not exists advert text;
alter table public.cover_letters add column if not exists employer_knowledge text;

-- No policy changes. cover_letters is already RLS on, own-row only, and these
-- columns inherit that: a policy grants access to a row, not to a column.
