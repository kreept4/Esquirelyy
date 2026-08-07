-- Store generated CVs.
-- Run in Supabase dashboard -> SQL Editor.
--
-- WHY THIS TABLE
--
-- The CV review tool now has a second half: after reading the review, a user can
-- ask for the CV to be rebuilt against it. That produces a document, not a
-- critique, and a document someone intends to send to a firm should still be
-- there tomorrow.
--
-- It is deliberately NOT a column on cv_reviews. The two are independent:
--
--   review only              a user who wants the feedback and will edit their
--                            own file
--   generate only            a user who skips the review and wants the rebuild
--   review, then generate    the common path, and the only one where the two
--                            rows are related
--
-- Hence review_id is nullable. A generation that came from a review points at
-- it; one that did not, does not.
--
-- WHAT IS AND IS NOT STORED
--
-- `document` is the structured CV: the JSON the generator returns, from which
-- both the DOCX and the PDF are drawn. Storing that rather than the rendered
-- files means a user can come back and download either format without paying
-- for a second trip to the model, and it keeps the row small.
--
-- The uploaded file is NOT stored, here or anywhere. It is read in memory,
-- parsed, and dropped when the request ends. That is the promise the tool makes
-- on the page and this table does not weaken it. What is stored is what the
-- tool wrote, which is the thing the user asked to keep.

-- ---------------------------------------------------------------
-- STEP 1 -- look first. Changes nothing.
-- Confirms cv_reviews is where this expects it, so the foreign key below
-- resolves, and shows whether this script has already been run.
-- ---------------------------------------------------------------
SELECT
  c.relname                   AS table_name,
  pg_get_userbyid(c.relowner) AS owner,
  c.relrowsecurity            AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('cv_reviews', 'cv_generations');


-- ---------------------------------------------------------------
-- STEP 2 -- the table.
--
-- ON DELETE SET NULL on review_id, not CASCADE. Deleting a review should not
-- silently destroy the CV that was built from it; the generation outlives its
-- parent and simply stops pointing at one.
--
-- ON DELETE CASCADE on user_id, because a deleted account should take its
-- documents with it. That is the NDPA position and the one users expect.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cv_generations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id    uuid     REFERENCES public.cv_reviews(id) ON DELETE SET NULL,

  -- Carried forward so the history drawer can label a row without opening the
  -- document, and so a user can see what each version was aimed at.
  first_name   text,
  target_role  text,
  career_stage text,
  source_file  text,

  -- The structured CV. See src/lib/cv/types.ts for the shape.
  document     jsonb NOT NULL,

  -- What the generator changed, and what it could not add for lack of evidence.
  changes      jsonb NOT NULL DEFAULT '[]'::jsonb,
  gaps         jsonb NOT NULL DEFAULT '[]'::jsonb,

  created_at   timestamptz NOT NULL DEFAULT now()
);

-- The history drawer's only query: this user's rows, newest first.
CREATE INDEX IF NOT EXISTS cv_generations_user_created_idx
  ON public.cv_generations (user_id, created_at DESC);


-- ---------------------------------------------------------------
-- STEP 3 -- grants.
--
-- Same shape as the other user-owned tables. `anon` gets nothing at all: an
-- unauthenticated visitor has no generated CVs and no business reading anyone
-- else's, so unlike profiles there is no read to grant.
-- ---------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, DELETE          ON public.cv_generations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.cv_generations TO service_role;


-- ---------------------------------------------------------------
-- STEP 4 -- row-level security.
--
-- GRANTs decide whether the role may touch the table; RLS decides which rows.
-- Both are needed. Without step 3 this returns 42501; without step 4 every
-- authenticated user can read every other user's CV.
--
-- WITH CHECK on INSERT is the part most often left out, and it is the one that
-- stops a user writing a row under someone else's user_id.
--
-- No UPDATE policy, on purpose. A generated CV is a record of what the tool
-- produced at a point in time. Editing happens in Word, after download.
-- ---------------------------------------------------------------
ALTER TABLE public.cv_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own generated CVs"   ON public.cv_generations;
DROP POLICY IF EXISTS "Users insert own generated CVs" ON public.cv_generations;
DROP POLICY IF EXISTS "Users delete own generated CVs" ON public.cv_generations;

CREATE POLICY "Users read own generated CVs" ON public.cv_generations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own generated CVs" ON public.cv_generations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own generated CVs" ON public.cv_generations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- ---------------------------------------------------------------
-- STEP 5 -- verify. Expect true on every privilege and three policies back.
-- ---------------------------------------------------------------
SELECT
  has_table_privilege('authenticated', 'public.cv_generations', 'SELECT') AS auth_select,
  has_table_privilege('authenticated', 'public.cv_generations', 'INSERT') AS auth_insert,
  has_table_privilege('authenticated', 'public.cv_generations', 'DELETE') AS auth_delete,
  has_table_privilege('service_role',  'public.cv_generations', 'SELECT') AS svc_select,
  NOT has_table_privilege('anon',      'public.cv_generations', 'SELECT') AS anon_blocked;

SELECT p.polname,
       CASE p.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT'
                     WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE'
                     ELSE 'ALL' END                    AS cmd,
       pg_get_expr(p.polqual,      p.polrelid)         AS using_clause,
       pg_get_expr(p.polwithcheck, p.polrelid)         AS with_check
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'cv_generations';
