-- =============================================================================
-- 0009_remove_domain_restriction.sql
--
-- REMOVES the company-domain rule entirely. After this runs, an account can be
-- created for ANY valid email address — gmail.com, outlook.com, anything — and
-- can sign in. This reverses 0004_company_domain.sql and 0006_signup_domain_only.sql.
--
-- HOW TO RUN IT (once): Supabase dashboard -> SQL Editor -> paste this whole
-- file -> Run. It must run as the project owner (`postgres`): dropping a trigger
-- on `auth.users` requires ownership of that table, which no browser session and
-- no API key has. Idempotent — re-running it is a no-op.
--
-- =============================================================================
-- 🔴 THE TRIGGER IS NOT CALLED `enforce_company_domain`. THAT IS THE FUNCTION.
--
-- The trigger created by 0004 and recreated by 0006 is:
--
--     trigger  on_auth_user_domain_check   on auth.users
--     function public.enforce_company_domain()
--
-- `DROP TRIGGER IF EXISTS enforce_company_domain ON auth.users` — the obvious
-- guess — succeeds, reports success, and REMOVES NOTHING, because `IF EXISTS`
-- turns a wrong name into a silent no-op. You would then create a gmail account,
-- watch it be rejected, and have a migration in the repo claiming the rule was
-- dropped. Section 1 therefore does not hard-code a name at all: it finds every
-- trigger on `auth.users` that calls the function and drops each by its real
-- name, so a differently-named copy from any past migration goes too.
--
-- =============================================================================
-- 🔴 WHAT PROTECTION REMAINS AFTER THIS. Stated plainly, because the domain rule
-- was one of several layers and it is worth knowing which ones are load-bearing.
--
--   STILL IN FORCE
--   · NO PUBLIC SIGNUP. There is no signup route, no signUp() call anywhere in
--     the repo, and no OAuth/OTP entry point. `scripts/test-auth-domain.mjs`
--     fails if one reappears. Accounts come into existence ONLY through an
--     authenticated admin, the Supabase dashboard, or the Admin API. THIS IS THE
--     CONTROL THAT ACTUALLY KEEPS STRANGERS OUT, and it is untouched.
--   · Sign-in still requires a CONFIRMED email address.
--   · profiles.status must be 'active'; every RLS policy turns on that word.
--   · role is immutable through the API (enforce_profile_transition, 0005), so
--     no account can promote itself to admin.
--   · Row Level Security on every table.
--
--   LOST, DELIBERATELY, ON INSTRUCTION (2026-08-14)
--   · A typo'd or wrong-company address is no longer refused at creation. An
--     admin who mistypes an address now creates a real account at the wrong
--     address rather than seeing an error. That is the trade being made.
--   · An account created by some other route (a future invite flow, a mistake in
--     the dashboard) is no longer domain-filtered at sign-in.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. DROP EVERY TRIGGER ON auth.users THAT CALLS enforce_company_domain().
--    By function, not by name — see the box above.
-- -----------------------------------------------------------------------------
do $$
declare
  t record;
  dropped int := 0;
begin
  for t in
    select tg.tgname
      from pg_trigger tg
      join pg_class     c on c.oid = tg.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      join pg_proc      p on p.oid = tg.tgfoid
     where n.nspname = 'auth'
       and c.relname = 'users'
       and p.proname = 'enforce_company_domain'
       and not tg.tgisinternal
  loop
    execute format('drop trigger if exists %I on auth.users', t.tgname);
    /* 🔴 ONE `%`, NOT `%%`. In a RAISE format string `%%` is an ESCAPED LITERAL
       percent sign, not a placeholder — so `'... %% ...', t.tgname` declares
       zero substitutions and supplies one argument, and PL/pgSQL rejects the
       whole block at COMPILE time:

           ERROR: 42601: too many parameters specified for RAISE

       Compile-time, so it fails before a single statement runs: the migration
       does nothing at all rather than half-applying. The `%%` came from
       confusing RAISE with `format()`, where `%%` is also a literal percent but
       the placeholders are `%s`/`%I`/`%L` — in RAISE the placeholder is a bare
       `%`, and there is no type letter. */
    raise notice '0009: dropped trigger % on auth.users', t.tgname;
    dropped := dropped + 1;
  end loop;

  -- Belt and braces: the two names any past migration in this repo used.
  drop trigger if exists on_auth_user_domain_check on auth.users;
  drop trigger if exists enforce_company_domain    on auth.users;

  if dropped = 0 then
    raise notice '0009: no enforce_company_domain trigger found on auth.users (already removed?)';
  end if;
end
$$;


-- -----------------------------------------------------------------------------
-- 2. DROP THE TRIGGER FUNCTION.
--
--    Plain `drop function if exists`, NOT `cascade`: if something unexpected
--    still depends on it, this raises and tells you, rather than quietly
--    deleting whatever that was. Nothing in this repo references it apart from
--    the trigger dropped above.
-- -----------------------------------------------------------------------------
drop function if exists public.enforce_company_domain();


-- -----------------------------------------------------------------------------
-- 3. THE TWO PREDICATES — dropped only if genuinely unreferenced.
--
--    `public.is_company_email(text)` and `public.is_allowlisted_email(text)`
--    were 0004's building blocks. With the trigger gone they answer a question
--    nobody asks. They are dropped so that a future reader cannot mistake a live
--    function for a live rule — but guardedly: if an RLS policy, a constraint or
--    another function still references one, the drop is skipped and the reason
--    is printed instead of the object being taken out from under its user.
-- -----------------------------------------------------------------------------
do $$
declare
  fn text;
begin
  foreach fn in array array['is_company_email', 'is_allowlisted_email'] loop
    begin
      execute format('drop function if exists public.%I(text)', fn);
      raise notice '0009: dropped public.%(text)', fn;
    exception
      when dependent_objects_still_exist then
        raise notice '0009: KEPT public.%(text) — something still depends on it: %', fn, sqlerrm;
      when others then
        raise notice '0009: could not drop public.%(text): %', fn, sqlerrm;
    end;
  end loop;
end
$$;


-- =============================================================================
-- 4. VERIFICATION. Every column must read as its name says.
-- =============================================================================
select
  -- The rule is gone when all of these are 0 / false.
  (select count(*)
     from pg_trigger tg
     join pg_class     c on c.oid = tg.tgrelid
     join pg_namespace n on n.oid = c.relnamespace
     join pg_proc      p on p.oid = tg.tgfoid
    where n.nspname = 'auth' and c.relname = 'users'
      and p.proname = 'enforce_company_domain'
      and not tg.tgisinternal)                                as domain_triggers_MUST_BE_0,

  (to_regprocedure('public.enforce_company_domain()') is not null)
                                                              as fn_enforce_still_exists_MUST_BE_false,
  (to_regprocedure('public.is_company_email(text)') is not null)
                                                              as fn_is_company_still_exists_expect_false,
  (to_regprocedure('public.is_allowlisted_email(text)') is not null)
                                                              as fn_allowlist_still_exists_expect_false,

  -- 🔴 THESE MUST STILL BE TRUE. Removing the domain rule must not have touched
  -- anything else on the auth path: the profile trigger still provisions a
  -- least-privilege row, and the transition trigger still makes role immutable.
  (select count(*)
     from pg_trigger tg
     join pg_class c on c.oid = tg.tgrelid
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'auth' and c.relname = 'users'
      and tg.tgname = 'on_auth_user_created')                 as profile_trigger_MUST_BE_1,

  (select count(*) from pg_trigger
    where tgname = 'profiles_enforce_transition')             as role_immutability_MUST_BE_1;


-- =============================================================================
-- 5. AFTER RUNNING THIS, UPDATE THE APP TOO — or the database will allow what
--    the app still refuses.
--
--    Already done in the same change as this migration (listed so a future
--    reader running this file alone knows what else moved):
--      lib/auth-domain.ts                     domain predicates removed
--      (portal)/login/actions.ts              sign-in domain gate removed
--      (portal)/admin/actions.ts              three creation-path checks removed
--      scripts/test-auth-domain.mjs           now asserts the lock stays OFF
--      supabase/FIRST_ADMIN.sql               domain note removed
-- =============================================================================
