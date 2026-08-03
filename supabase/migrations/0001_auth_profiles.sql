-- =============================================================================
-- 0001_auth_profiles.sql  —  Synergy portal, AUTH PHASE 2.
--
-- Users + roles, and nothing else. No leads, no agents-as-data, no content
-- tables — those are a later phase, and lib/adminMock.ts still feeds the admin
-- UI until they exist.
--
-- HOW TO RUN IT (once): Supabase dashboard -> SQL Editor -> paste this whole
-- file -> Run. It runs as the project's `postgres` role, which OWNS every
-- object it creates. That ownership is load-bearing for the SECURITY DEFINER
-- function below (see its note). Forward-only; there is no down migration
-- because this is the first one.
--
-- WHAT PROTECTS THE DATA: Row Level Security, written out in full at the bottom.
-- The anon key that ships to browsers can do NOTHING these policies do not
-- allow, which is why it is safe to expose (see .env.local.example).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. ROLE ENUM.  Two roles this phase. Adding 'manager' later is one
--    `alter type public.app_role add value 'manager';`.
-- -----------------------------------------------------------------------------
-- 🔴 IDEMPOTENT 2026-08-03. Original kept per the standing rule:
-- create type public.app_role as enum ('admin', 'agent');
do $$ begin
  create type public.app_role as enum ('admin', 'agent');
exception when duplicate_object then null; end $$;


-- -----------------------------------------------------------------------------
-- 2. PROFILES.  One row per auth user, 1:1 with auth.users by shared UUID.
--
--    We never touch auth.users (Supabase owns it: email, password hash,
--    tokens). The role lives HERE, in our own RLS-protected table, and NOT in
--    auth.users.raw_user_meta_data — user_metadata is writable by the signed-in
--    user, so a role kept there could be self-elevated. A column here cannot:
--    there is no INSERT/UPDATE/DELETE policy for `authenticated` (section 5),
--    so a client physically cannot write this table.
--
--    `default 'agent'` is deliberate least-privilege: if a profile is ever
--    created by an unexpected path, the worst case is the lowest role, never
--    admin.
-- -----------------------------------------------------------------------------
-- 🔴 IDEMPOTENT 2026-08-03. Original: create table public.profiles (
create table if not exists public.profiles (
  id         uuid        primary key references auth.users (id) on delete cascade,
  role       public.app_role not null default 'agent',
  full_name  text,
  created_at timestamptz not null default now()
);


-- -----------------------------------------------------------------------------
-- 3. ROLE HELPER — breaks the RLS recursion, and is NOT an escalation vector.
--
--    An "admins can read every row" policy on `profiles` would, if it selected
--    from `profiles` to find out whether the caller is an admin, invoke itself
--    -> infinite recursion. This function sidesteps that: SECURITY DEFINER runs
--    it as its OWNER (the `postgres` role this migration runs as), which
--    bypasses RLS, so the lookup does not re-enter the policy.
--
--    WHY DEFINER IS SAFE HERE (the escalation question, answered):
--      * it takes NO arguments — there is no id parameter, so a caller cannot
--        ask for anyone's role but their own (`auth.uid()` is the verified
--        caller, set from the signed JWT, not from input);
--      * it only ever returns a role and performs NO writes;
--      * `set search_path = ''` forces fully-qualified names, closing the
--        classic definer attack where a caller shadows `profiles` with a table
--        on their own search_path;
--      * execute is revoked from public/anon and granted only to
--        `authenticated`, so an anonymous request cannot call it at all.
--    The most a caller can learn from it is their own role. That is the whole
--    surface.
-- -----------------------------------------------------------------------------
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all     on function public.current_app_role() from public, anon;
grant  execute on function public.current_app_role() to authenticated;


-- -----------------------------------------------------------------------------
-- 4. PROFILE-ON-SIGNUP TRIGGER.
--
--    There is NO public signup (see section 6 of the app README / the admin is
--    created manually). This trigger exists so that WHEN an auth user is created
--    manually — through the dashboard or the Admin API, both privileged paths a
--    visitor cannot reach — a matching profile row appears automatically at the
--    least-privilege default. The admin is then elevated by hand (section 6).
--
--    Also DEFINER: it writes to public.profiles, which has RLS on and no INSERT
--    policy, so it must run as owner to insert. It only ever inserts a row keyed
--    to the NEW auth user's own id; it cannot be aimed at another user.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- 🔴 ROLE IS HARD-CODED TO 'agent' AND METADATA IS NEVER CONSULTED FOR IT.
  -- raw_user_meta_data is CLIENT-SUPPLIED (a signup can put anything in it), so
  -- a role read from there would be self-elevation. We honour metadata only for
  -- the benign `full_name`; role is forced to the least-privilege value, and an
  -- admin is minted afterwards by a separate manual UPDATE (see the README /
  -- section 6). Passing {"role":"admin"} at signup lands as 'agent'.
  insert into public.profiles (id, role, full_name)
  values (new.id, 'agent', new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

-- 🔴 IDEMPOTENT 2026-08-03. Original had no guard:
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute function public.handle_new_user();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY — public.profiles, in full.
--
--    Enabling RLS with zero policies denies everything. We add back exactly two
--    SELECT policies and NOTHING else, so the net posture is:
--
--      role                 SELECT              INSERT  UPDATE  DELETE
--      anon (logged out)    nothing             no      no      no
--      authenticated agent  own row only        no      no      no
--      authenticated admin  every row           no      no      no
--      service_role         bypasses RLS (server-only key; never in a browser)
--
--    No INSERT policy  -> profiles are born only via the section-4 trigger.
--    No UPDATE policy  -> nobody can change their own role (or anything else)
--                         from the client. This is what makes the role
--                         un-spoofable; it is enforced by the database, not the
--                         UI. Column-safe self-edit arrives with a later phase.
--    No DELETE policy  -> account removal is a privileged/manual operation.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- A signed-in user may read ONLY their own row.
-- 🔴 IDEMPOTENT 2026-08-03. Postgres has no CREATE POLICY IF NOT EXISTS, so the
-- drop is the guard. Original had no drop.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ( (select auth.uid()) = id );

-- An admin may read EVERY row. Uses the definer helper from section 3 so it
-- does not recurse on this same table.
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using ( public.current_app_role() = 'admin' );

-- (Intentionally no insert/update/delete policies. See the box above.)
