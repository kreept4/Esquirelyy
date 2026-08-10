-- Ambassador invite links: who sent each new member.
--
-- Run each block in the Supabase SQL editor, in order.

-- ---------------------------------------------------------------
-- STEP 1 -- the column.
-- Plain text, holding the ambassador's code, e.g. 'unilag-tomi'. Not a foreign
-- key: an ambassador is a person we agreed something with by email, not a row,
-- and codes have to be issuable before any such table exists.
-- ---------------------------------------------------------------
alter table public.profiles
  add column if not exists referred_by text;

create index if not exists profiles_referred_by_idx
  on public.profiles (referred_by)
  where referred_by is not null;

-- ---------------------------------------------------------------
-- STEP 2 -- carry the code through signup.
--
-- The profile row is created by this trigger the instant the auth user exists,
-- so the code has to be read here. The browser passes it in the signup metadata
-- and this is the only thing that writes it.
--
-- WHY IT IS WRITTEN ONCE, AT CREATION, AND NEVER UPDATED. Attribution decided
-- at the moment of signup cannot be edited afterwards by the account holder,
-- which is what keeps a count worth paying against. The client can influence
-- the value it sends, so this is not proof against a determined person crediting
-- a friend; it is proof against the ordinary case, and the ordinary case is what
-- a leaderboard is made of.
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, referred_by)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    -- Same shape the browser validates against, enforced again here so a
    -- hand-made signup cannot write an arbitrary string into this column.
    nullif(regexp_replace(lower(coalesce(new.raw_user_meta_data->>'referred_by', '')),
                          '[^a-z0-9-]', '', 'g'), '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------
-- STEP 3 -- the standings. Run this whenever you want the count.
-- ---------------------------------------------------------------
-- select referred_by as ambassador,
--        count(*) as signups,
--        min(created_at) as first_signup,
--        max(created_at) as latest_signup
-- from public.profiles
-- where referred_by is not null
-- group by referred_by
-- order by signups desc;
