-- Remove stale job rows — run in Supabase dashboard → SQL Editor.
-- Written 2026-08-05. All four deadlines had passed; each was checked before listing.
--
--   manual-004  Ardova Plc            2026 Graduate Trainee Programme     deadline 2026-06-30
--   manual-005  Access Bank           2026 Entry Level Training Program   deadline 2026-06-30
--   manual-008  Boston Consulting Grp 2026 Business Analyst Program       deadline 2026-06-30
--   manual-011  UNOPS / SEforALL      STEM Trainee Program 2026           deadline 2026-06-12
--
-- Access Bank was the doubtful one — you thought the ELTP was still live. It is
-- not: applications closed 2 June 2026. The bank does hire on a rolling basis
-- through careers.accessbankplc.com, so a fresh row is worth adding when a real
-- opening appears, but this one is spent.

-- Look before you delete: run this first and confirm you get exactly 4 rows.
SELECT id, employer, title, deadline
FROM jobs
WHERE id IN ('manual-004', 'manual-005', 'manual-008', 'manual-011');

-- Then delete.
DELETE FROM jobs
WHERE id IN ('manual-004', 'manual-005', 'manual-008', 'manual-011');

-- Catch-all for the future: anything already past its deadline, excluding
-- rolling roles and roles that never stated one. Review the SELECT before
-- running the DELETE — this one is not pinned to known ids.
--
-- SELECT id, employer, title, deadline FROM jobs
-- WHERE deadline IS NOT NULL AND is_rolling = false AND deadline < CURRENT_DATE;
