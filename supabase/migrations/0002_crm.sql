-- =============================================================================
-- 0002_crm.sql  —  Synergy portal, CRUD PHASE 3.
--
-- Adds the two operational tables the admin panel reads/writes: leads and
-- agents. Depends on 0001_auth_profiles.sql (it uses public.current_app_role()
-- and the app_role model). RUN 0001 FIRST, then this. Run once.
--
-- Enforcement is Row Level Security, same as 0001: table-level access for the
-- anon/authenticated API roles is provided by Supabase's default privileges,
-- and these policies decide what each role may actually see or change. The
-- publishable key a browser holds can do NOTHING these policies do not allow.
--
-- content is NOT a table here — the admin's Content view is a read-only
-- reflection of repo state (lib/blog.ts + static pages), not database rows.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------
create type public.lead_source  as enum ('contact', 'calculator');
create type public.lead_status  as enum ('new', 'contacted', 'qualified', 'closed');
create type public.agent_stage  as enum ('touch', 'meet', 'licensed', 'appointed');
create type public.agent_heard  as enum ('search', 'social', 'referral', 'event', 'other');


-- -----------------------------------------------------------------------------
-- LEADS — contact/calculator submissions. READ-ONLY to the admin (record of
-- inbound interest). Rows are INSERTED server-side by the lead intake (the GHL
-- webhook, a later phase) using the SECRET key, which bypasses RLS. There is no
-- client write path, by design: an admin does not create or delete leads.
-- -----------------------------------------------------------------------------
create table public.leads (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  email        text        not null,
  phone        text,
  source       public.lead_source not null,
  interest     text,                              -- product key p1..p7, or free text
  sms_consent  boolean     not null default false,
  email_optin  boolean     not null default false,
  status       public.lead_status not null default 'new',
  received_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Admin may READ every lead. No insert/update/delete policy exists, so the API
-- roles (anon, authenticated — including a non-admin) cannot write or read
-- anything they shouldn't: non-admin authenticated sees 0 rows, anon sees none.
create policy "leads_select_admin"
  on public.leads
  for select
  to authenticated
  using ( public.current_app_role() = 'admin' );


-- -----------------------------------------------------------------------------
-- AGENTS — the recruiting roster (pipeline records, NOT auth accounts; a
-- portal login is a separate, manually-created auth user). Admin has full CRUD
-- EXCEPT hard delete: there is no delete policy, so history cannot be destroyed
-- from the app. "Removing" an agent is setting active=false.
-- -----------------------------------------------------------------------------
create table public.agents (
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

create policy "agents_select_admin"
  on public.agents
  for select
  to authenticated
  using ( public.current_app_role() = 'admin' );

create policy "agents_insert_admin"
  on public.agents
  for insert
  to authenticated
  with check ( public.current_app_role() = 'admin' );

create policy "agents_update_admin"
  on public.agents
  for update
  to authenticated
  using      ( public.current_app_role() = 'admin' )
  with check ( public.current_app_role() = 'admin' );

-- 🔴 NO DELETE POLICY. Hard delete is denied to every API role, admin included.
-- Deactivate (update active=false) instead, so the record survives.


-- -----------------------------------------------------------------------------
-- updated_at bookkeeping for agents. Plain trigger (no elevated rights needed —
-- it only rewrites a column on the row already being updated). search_path is
-- pinned for hygiene; now() resolves from pg_catalog regardless.
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger agents_touch_updated_at
  before update on public.agents
  for each row execute function public.touch_updated_at();
