-- =============================================================================
-- CATCHUP_0002_to_0004.sql
--
-- ONE SCRIPT that brings this Supabase project from "only 0001 applied" to
-- fully up to date. Paste the whole thing into the SQL Editor and Run once.
--
-- -----------------------------------------------------------------------------
-- WHY THIS EXISTS
--
-- Probed live on 2026-08-03 against project `zmgifinadaighiggpieu`:
--
--     0001_auth_profiles   APPLIED     (public.profiles present, 1 row)
--     0002_crm             NOT APPLIED (public.leads, public.agents absent)
--     0003_applications    NOT APPLIED (public.applications absent)
--     0004_company_domain  NOT APPLIED
--
-- The reported error — `42704: type "public.agent_heard" does not exist` at
-- 0003 line 50 — is exactly that gap: `agent_heard` is created by **0002**, and
-- 0002 was never run. 0003 was being applied on top of a missing dependency.
-- Nothing is corrupted and nothing needs resetting; a migration was skipped.
--
-- -----------------------------------------------------------------------------
-- 🔴 IT IS IDEMPOTENT. Safe to run on a partially-applied database, and safe to
-- run twice. Every statement is guarded:
--     types      wrapped in a duplicate_object exception block
--     tables     `create table if not exists`
--     policies   `drop policy if exists` immediately before each `create`
--                (Postgres has no `create policy if not exists`)
--     triggers   `drop trigger if exists` before each `create`
--     functions  `create or replace`
--     RLS enable is already idempotent
-- If a previous partial run left some objects behind, this will adopt them
-- rather than error.
--
-- 🔴 DO NOT RESET ANYTHING. Your single admin account
-- (mohamed204430@gmail.com) and its `profiles` row live in 0001's objects,
-- which this script does not touch. A reset would destroy that account.
-- =============================================================================


-- =============================================================================
-- PART 1 — 0002_crm.sql   (the missing dependency)
-- =============================================================================

do $$ begin
  create type public.lead_source as enum ('contact', 'calculator');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.lead_status as enum ('new', 'contacted', 'qualified', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.agent_stage as enum ('touch', 'meet', 'licensed', 'appointed');
exception when duplicate_object then null; end $$;

-- 🔴 THIS is the type 0003 was failing on.
do $$ begin
  create type public.agent_heard as enum ('search', 'social', 'referral', 'event', 'other');
exception when duplicate_object then null; end $$;


create table if not exists public.leads (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  email        text        not null,
  phone        text,
  source       public.lead_source not null,
  interest     text,
  sms_consent  boolean     not null default false,
  email_optin  boolean     not null default false,
  status       public.lead_status not null default 'new',
  received_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads_select_admin" on public.leads;
create policy "leads_select_admin"
  on public.leads for select to authenticated
  using ( public.current_app_role() = 'admin' );


create table if not exists public.agents (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  phone       text,
  state       text,
  licensed    boolean     not null default false,
  heard       public.agent_heard,
  stage       public.agent_stage not null default 'touch',
  active      boolean     not null default true,
  applied_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.agents enable row level security;

drop policy if exists "agents_select_admin" on public.agents;
create policy "agents_select_admin"
  on public.agents for select to authenticated
  using ( public.current_app_role() = 'admin' );

drop policy if exists "agents_insert_admin" on public.agents;
create policy "agents_insert_admin"
  on public.agents for insert to authenticated
  with check ( public.current_app_role() = 'admin' );

drop policy if exists "agents_update_admin" on public.agents;
create policy "agents_update_admin"
  on public.agents for update to authenticated
  using      ( public.current_app_role() = 'admin' )
  with check ( public.current_app_role() = 'admin' );

-- 🔴 NO DELETE POLICY, deliberately: history cannot be destroyed from the app.
-- "Removing" an agent is `active = false`.

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agents_touch_updated_at on public.agents;
create trigger agents_touch_updated_at
  before update on public.agents
  for each row execute function public.touch_updated_at();


-- =============================================================================
-- PART 2 — 0003_applications.sql   (the /join apply form's table)
-- =============================================================================

create table if not exists public.applications (
  id           uuid        primary key default gen_random_uuid(),
  first_name   text        not null check (length(first_name) between 1 and 100),
  last_name    text        not null check (length(last_name)  between 1 and 100),
  email        text        not null check (length(email)      between 3 and 254),
  phone        text        not null check (length(phone)      between 7 and 32),
  state        text        not null check (length(state)      between 2 and 40),
  licensed     boolean     not null,
  heard        public.agent_heard,          -- nullable: the field is optional
  consent      boolean     not null default false,
  received_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- 🔴 ADDED 2026-08-03 — THIS INDEX WAS MISSING FROM THIS SCRIPT AND IS IN 0003.
-- Caught by diffing the two files statement-by-statement before recommending a
-- run order. Without it, CATCHUP would leave the database FUNCTIONALLY correct
-- but not IDENTICAL to running 0002+0003+0004, and the admin's "newest first"
-- listing would do a sequential scan for the life of the table.
-- `if not exists` so it is idempotent like everything else here.
create index if not exists applications_received_at_idx
  on public.applications (received_at desc);

alter table public.applications enable row level security;

-- 🔴 SELECT-ONLY, ADMIN-ONLY. There is deliberately NO insert policy: the public
-- form writes with the SERVICE-ROLE key server-side, which bypasses RLS. So a
-- browser cannot write this table, and only an admin can read it. Agents and
-- anonymous visitors see zero rows.
drop policy if exists "applications_select_admin" on public.applications;
create policy "applications_select_admin"
  on public.applications for select to authenticated
  using ( public.current_app_role() = 'admin' );


-- =============================================================================
-- PART 3 — 0004_company_domain.sql  +  YOUR GMAIL ALLOWLIST
--
-- 🔴 READ THIS BEFORE RUNNING PART 3.
--
-- Your only admin is mohamed204430@gmail.com, which is NOT @fflsynergy.com.
--
-- The SQL below on its own will NOT lock you out — the trigger is
-- `before insert on auth.users`, so it only judges accounts being CREATED. Your
-- account already exists and is never re-evaluated.
--
-- ⚠️ BUT THE APPLICATION WILL LOCK YOU OUT, and that is independent of this
-- script. `app/[locale]/(portal)/login/actions.ts` calls `isCompanyEmail()` on
-- every sign-in and calls `signOut()` if it fails. Your address fails it today.
-- Fixing that is a CODE change (lib/auth-domain.ts), not a SQL one — see the
-- report. Running this script does not make that better or worse.
--
-- The allowlist below keeps the DB and the code telling the same story.
-- =============================================================================

/**
 * An explicit, individual allowlist — NOT a second allowed domain.
 * Adding 'gmail.com' to the domain list would let ANY gmail address create a
 * portal account, which destroys the whole point of 0004. One named address is
 * an exception; a public mail domain is a hole.
 */
create or replace function public.is_allowlisted_email(addr text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(trim(coalesce(addr, ''))) = any (array[
    'mohamed204430@gmail.com'          -- founding admin, pre-dates 0004
  ]);
$$;

create or replace function public.is_company_email(addr text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  -- Exact equality on the EXTRACTED domain. `like '%@fflsynergy.com'` would
  -- accept a@b@fflsynergy.com; `like '%fflsynergy.com'` would accept
  -- evil-fflsynergy.com. Both are the classic bypasses.
  select addr is not null
     and length(coalesce(addr, '')) > 0
     and array_length(string_to_array(addr, '@'), 1) = 2
     and lower(split_part(addr, '@', 2)) = any (array['fflsynergy.com']);
$$;

create or replace function public.enforce_company_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (public.is_company_email(new.email)
          or public.is_allowlisted_email(new.email)) then
    raise exception
      'Account creation denied: only @fflsynergy.com addresses may have portal accounts (got %).',
      coalesce(split_part(new.email, '@', 2), '<no domain>');
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_domain_check on auth.users;
create trigger on_auth_user_domain_check
  before insert on auth.users
  for each row execute function public.enforce_company_domain();


-- =============================================================================
-- VERIFY — run this after; it should report every object as present.
-- =============================================================================
select
  to_regtype('public.agent_heard')      is not null as type_agent_heard,
  to_regclass('public.leads')           is not null as table_leads,
  to_regclass('public.agents')          is not null as table_agents,
  to_regclass('public.applications')    is not null as table_applications,
  public.is_allowlisted_email('mohamed204430@gmail.com') as gmail_admin_allowlisted,
  public.is_company_email('someone@fflsynergy.com')      as company_domain_ok,
  public.is_company_email('attacker@evil-fflsynergy.com') as bypass_blocked_should_be_false;
