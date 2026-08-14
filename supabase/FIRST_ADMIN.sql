-- =============================================================================
-- FIRST_ADMIN.sql — ONE-OFF, RUN BY HAND. NOT A MIGRATION.
--
-- This file promotes ONE existing account to `admin`. It is deliberately not in
-- `supabase/migrations/` and deliberately not automated: minting an administrator
-- is the single most consequential write in this database, and it should require
-- a human being to open a SQL editor, type an address they recognise, and read
-- the result.
--
-- 🔴 IT CONTAINS NO CREDENTIALS AND MUST NEVER BE EDITED TO CONTAIN ANY. It
-- takes an EMAIL of an account that already exists. The password was set by the
-- person themselves, through the setup link, and is not knowable from here.
--
-- =============================================================================
-- BEFORE YOU RUN IT
--
-- 1. The account must already exist. Create it first — Supabase dashboard ->
--    Authentication -> Users -> "Add user", with "Auto Confirm User" ON.
--
--    🔴 ANY EMAIL DOMAIN WORKS. The company-domain restriction that used to
--    apply here — 0004's `enforce_company_domain` trigger on auth.users — was
--    removed on 2026-08-14 by 0009_remove_domain_restriction.sql. Gmail,
--    Outlook, anything.
--
--    🟡 SO TYPE THE ADDRESS CAREFULLY. Nothing validates the domain any more.
--    This script promotes whatever address you name to ADMINISTRATOR; a typo
--    either finds no account (safe, it raises) or — if that address happens to
--    exist — promotes the wrong person silently.
-- 2. Replace the address on the `v_email` line below. Nothing else changes.
-- 3. Paste the whole file into the Supabase SQL Editor and run it.
--
-- =============================================================================
-- 🔴 WHY THE TRIGGER HAS TO BE DISABLED, AND WHY THAT IS SAFE HERE.
--
-- 0005 added `profiles_enforce_transition`, whose first rule is that
-- `profiles.role` is IMMUTABLE — any statement that changes it raises. That is
-- the control which makes self-elevation impossible: there is no API path, no
-- policy, and no metadata field that can turn an agent into an admin.
--
-- It also blocks this legitimate promotion, because the trigger does not care
-- who is calling. So the promotion below switches it off for the length of one
-- transaction and back on again. That is safe for exactly two reasons:
--
--   · `alter table ... disable trigger` requires table ownership. Only the
--     `postgres` role in the SQL editor has it. `anon`, `authenticated` and
--     every browser session are refused — they cannot run this file.
--   · It is inside a transaction with the re-enable in the same block, so the
--     trigger cannot be left off by a half-finished run.
--
-- If this raises "must be owner of table profiles", you are not running it as
-- the project owner. That is the control working. Use the dashboard SQL editor.
-- =============================================================================

do $$
declare
  -- 🔴 CHANGE THIS ONE LINE. The address of the account to promote. Any domain.
  v_email text := 'REPLACE_ME@example.com';
  v_id    uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(v_email);

  if v_id is null then
    raise exception
      'No auth user exists for %. Create the account first (Authentication -> Users -> Add user, Auto Confirm ON), then re-run.',
      v_email;
  end if;

  -- The trigger blocks the role change; see the box above.
  alter table public.profiles disable trigger profiles_enforce_transition;

  update public.profiles
     set role   = 'admin',
         -- An admin whose status is not 'active' is locked out of their own
         -- panel: every policy reads `is_active_admin()`, which requires both.
         status = 'active'
   where id = v_id;

  alter table public.profiles enable trigger profiles_enforce_transition;

  -- A record of the promotion, in the same log the admin panel reads.
  insert into public.activity_logs (user_id, action, target, metadata)
  values (v_id, 'account_promoted', v_email,
          jsonb_build_object('role', 'admin', 'by', 'FIRST_ADMIN.sql'));

  raise notice 'Promoted % (%) to admin.', v_email, v_id;
end
$$;

-- Confirm it. `admins_MUST_BE_AT_LEAST_1`, and the row should be yours.
select p.id, p.email, p.role, p.status
  from public.profiles p
 where p.role = 'admin'
 order by p.created_at;
