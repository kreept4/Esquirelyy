-- Let an opportunity be a competition.
-- Run in Supabase dashboard -> SQL Editor.
--
-- WHY
--
-- The LGIC row added on 2026-09-21 is a competition whose prize is an
-- internship. opportunities_type_check, set in
-- 2026-08-17-opportunities-phase0-fix.sql, admits seven words and that is not
-- one of them, so the row went in as 'internship' and the detail page prints
-- "Internship" where it should print "Competition".
--
-- That is a small loss and it is worth fixing rather than living with, because
-- the type is the one word on the page that tells a reader what KIND of thing
-- they are looking at. A competition with an entry window, a form and a prize
-- is not an internship advert, and a student who reads it as one will expect to
-- be applying for a seat.
--
-- ⚠ THE CODE HALF IS ALREADY SHIPPED AND IS INERT UNTIL THIS RUNS.
-- lib/opportunities.ts carries 'competition' in INTERNSHIP_KINDS, so the board
-- will keep filing it under Internship rather than Full-time, and in
-- OPPORTUNITY_TYPE_LABELS, so the detail page has the word to print. Neither
-- does anything until a row actually holds the value.
--
-- ⚠ DROP AND RECREATE RATHER THAN ALTER, because a CHECK constraint cannot be
-- amended in place. The list below is the original seven plus one: if you are
-- reading this after some later migration added an eighth, take the current
-- definition from the database rather than trusting this file, or you will
-- silently revoke whatever was added in between.
--
--   select pg_get_constraintdef(oid) from pg_constraint
--    where conname = 'opportunities_type_check';
--
-- ⚠ AND THE ROW IS NOT SWITCHED BY THIS FILE. The UPDATE at the bottom is
-- commented out on purpose. Run the constraint change, deploy the one line
-- change in scripts/2026-09-21-add-lgic.mjs, and only then switch the row, or
-- the live site will hold a value the deployed code has no label for and the
-- detail page will print a raw 'competition' where a word should be.

ALTER TABLE public.opportunities DROP CONSTRAINT IF EXISTS opportunities_type_check;

ALTER TABLE public.opportunities
  ADD CONSTRAINT opportunities_type_check
  CHECK (type IN ('internship','job','scholarship',
                  'virtual_internship','webinar','workshop','event',
                  'competition'));

-- Then, after the code change is deployed:
--
-- update public.opportunities
--    set type = 'competition'
--  where title = '6th Annual Professor J.O. Fabunmi Internship Competition (LGIC)';
