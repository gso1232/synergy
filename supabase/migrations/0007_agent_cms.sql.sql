-- =============================================================================
-- 0007_agent_cms.sql  —  THE AGENT-AREA CMS + ACTIVITY LOG.
--
-- Four tables (pages, page_sections, section_links, activity_logs), their RLS,
-- one reader function, and the generic seed content.
--
-- HOW TO RUN IT (once): Supabase dashboard -> SQL Editor -> paste this whole
-- file -> Run. It runs as `postgres`, which OWNS every object it creates — that
-- ownership is load-bearing for the SECURITY DEFINER function in section 6.
-- Idempotent throughout: re-running it is a no-op, and re-running it does NOT
-- overwrite content Aiman has edited (see section 8's guard).
--
-- =============================================================================
-- 🔴 WHAT THIS MIGRATION DELIBERATELY DOES **NOT** ADD, AND WHY.
--
-- The brief this was built from specified `profiles.is_active boolean`, a
-- profile trigger, and an `is_admin()` helper. ALL THREE ALREADY EXIST HERE
-- under different names, and duplicating them would create two sources of truth
-- on an auth boundary — the worst possible place for a disagreement:
--
--   brief                     what this database already has        added by
--   ------------------------  ------------------------------------  --------
--   profiles.is_active        profiles.status = 'active'            0005
--                             (a 4-state enum: unverified/pending/
--                              active/rejected — strictly richer)
--   is_admin()                is_active_admin()                     0005
--                             (role='admin' AND status='active')
--   on-auth-user trigger      handle_new_user()                     0001/0005
--
-- So every policy below reads `public.is_active_admin()` and
-- `public.current_account_status() = 'active'`. A second boolean flag meaning
-- almost-but-not-quite the same as `status` is exactly how an account ends up
-- disabled in one table's eyes and enabled in another's.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. PAGES.  One row per page in the agent area. `parent_id` gives the ONE level
--    of nesting the nav dropdown needs ("New Agent Bootcamps" holding the two
--    bootcamp pages).
-- -----------------------------------------------------------------------------
create table if not exists public.pages (
  id                    uuid primary key default gen_random_uuid(),
  parent_id             uuid references public.pages (id) on delete set null,
  slug                  text unique not null,
  title                 text not null,
  subtitle              text,
  is_password_protected boolean not null default false,
  -- 🔴 THIS COLUMN IS NEVER READABLE BY A CLIENT. See section 4's column grants:
  -- `authenticated` is granted SELECT on every other column and NOT on this one,
  -- so an agent cannot fetch the answer to the gate they are being shown. It is
  -- writable (admin-only, by policy) and verifiable (section 6's function), and
  -- that is the whole surface.
  password              text,
  is_published          boolean not null default true,
  sort_order            int not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- A page cannot be its own parent.
  constraint pages_parent_not_self check (parent_id is null or parent_id <> id),
  -- Protection without a password is a gate that opens for everyone — and it
  -- would read as "protected" in the admin list while protecting nothing.
  constraint pages_password_present
    check (not is_password_protected or (password is not null and length(password) > 0)),
  -- The slug goes into a URL. Constrain it here rather than trusting the form.
  constraint pages_slug_shape check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists pages_parent_idx on public.pages (parent_id, sort_order);
create index if not exists pages_published_idx on public.pages (is_published, sort_order);

/*
 * ONE LEVEL OF NESTING, ENFORCED. The nav renders a parent and its children and
 * stops; a grandchild would simply never appear, which is a page that exists and
 * is unreachable. Cheaper to refuse it at the database than to debug it later.
 */
create or replace function public.enforce_page_depth()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is not null then
    -- The parent must be a top-level page.
    if exists (select 1 from public.pages p where p.id = new.parent_id and p.parent_id is not null) then
      raise exception 'pages support one level of nesting: % already has a parent', new.parent_id;
    end if;
    -- ...and this page must not already be somebody's parent.
    if exists (select 1 from public.pages c where c.parent_id = new.id) then
      raise exception 'page % has children and cannot itself be nested', new.id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists pages_enforce_depth on public.pages;
create trigger pages_enforce_depth
  before insert or update on public.pages
  for each row execute function public.enforce_page_depth();

-- `touch_updated_at()` is 0002's, reused rather than redefined.
drop trigger if exists pages_touch_updated_at on public.pages;
create trigger pages_touch_updated_at
  before update on public.pages
  for each row execute function public.touch_updated_at();


-- -----------------------------------------------------------------------------
-- 2. PAGE SECTIONS.  A step, or an untitled block. `step_number` is TEXT and
--    nullable on purpose: the seed uses '01'..'09' (leading zero is meaningful —
--    it is what the badge renders) and resource pages have no step at all.
-- -----------------------------------------------------------------------------
create table if not exists public.page_sections (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references public.pages (id) on delete cascade,
  step_number text,
  heading     text,
  body        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists page_sections_page_idx on public.page_sections (page_id, sort_order);


-- -----------------------------------------------------------------------------
-- 3. SECTION LINKS.  Outbound (or internal) links hanging off a section.
-- -----------------------------------------------------------------------------
create table if not exists public.section_links (
  id         uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.page_sections (id) on delete cascade,
  label      text not null,
  url        text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),

  -- 🔴 SCHEME ALLOWLIST. `url` is rendered into an href, and an admin pasting
  -- (or being socially engineered into pasting) `javascript:…` would ship a
  -- stored XSS to every agent who opened the page. Absolute http(s) or a
  -- site-relative path; nothing else.
  constraint section_links_url_scheme check (url ~* '^(https?://|/)')
);

create index if not exists section_links_section_idx on public.section_links (section_id, sort_order);


-- -----------------------------------------------------------------------------
-- 4. ACTIVITY LOG.  Who did what, when.
--
--    `user_id` is `on delete set null`, NOT cascade: deleting an account must
--    not erase the record that it logged in and read six pages. The row survives
--    with a null actor.
-- -----------------------------------------------------------------------------
create table if not exists public.activity_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete set null,
  -- Free text rather than an enum: 'login', 'view_page', 'cms_edit',
  -- 'account_created'… A new action should not need a migration, and an enum
  -- here would make every new log line a schema change.
  action     text not null,
  target     text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_user_idx    on public.activity_logs (user_id, created_at desc);
create index if not exists activity_logs_action_idx  on public.activity_logs (action, created_at desc);


-- -----------------------------------------------------------------------------
-- 5. TABLE + COLUMN GRANTS.
--
-- 🔴 THE REVOKES ARE NOT DECORATION. Supabase's default privileges hand `anon`
-- and `authenticated` full DML on every new table in `public`; RLS is what
-- actually gates it. Revoking first and granting back explicitly means the
-- `password` column can be made write-only, which RLS alone cannot express —
-- policies filter ROWS, they do not hide COLUMNS.
-- -----------------------------------------------------------------------------
revoke all on public.pages         from anon, authenticated;
revoke all on public.page_sections from anon, authenticated;
revoke all on public.section_links from anon, authenticated;
revoke all on public.activity_logs from anon, authenticated;

-- pages: every column readable EXCEPT `password`.
grant select (id, parent_id, slug, title, subtitle, is_password_protected,
              is_published, sort_order, created_at, updated_at)
  on public.pages to authenticated;
grant insert (id, parent_id, slug, title, subtitle, is_password_protected,
              password, is_published, sort_order)
  on public.pages to authenticated;
grant update (parent_id, slug, title, subtitle, is_password_protected,
              password, is_published, sort_order)
  on public.pages to authenticated;
grant delete on public.pages to authenticated;

grant select, insert, update, delete on public.page_sections to authenticated;
grant select, insert, update, delete on public.section_links to authenticated;

-- The log is append-only from the app's side. No UPDATE, no DELETE, to anyone:
-- a log a user can edit is not a log.
grant select, insert on public.activity_logs to authenticated;


-- -----------------------------------------------------------------------------
-- 6. THE READER — public.agent_page().
--
-- 🔴 WHY A FUNCTION AND NOT THREE CLIENT QUERIES.
--
-- A password gate implemented as "fetch everything, hide it in React until the
-- input matches" is theatre: the content is already in the browser, and the
-- password is one API call away. So the gate lives HERE instead:
--
--   · `password` is unreadable by any client (section 5's column grants);
--   · sections and links of a PROTECTED page are unreadable through the REST
--     API by a non-admin (section 7's policies);
--   · this function is the only path to that content, and it will not return it
--     unless the supplied password matches.
--
-- SECURITY DEFINER, so it can read the `password` column and bypass the
-- section policies — with the caller's own entitlement re-checked in the first
-- line. It takes a slug and an attempt, returns content or a locked stub, and
-- can answer for nobody but the caller (`auth.uid()` inside the status check).
-- -----------------------------------------------------------------------------
create or replace function public.agent_page(p_slug text, p_password text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  pg       record;
  unlocked boolean;
  sections jsonb := '[]'::jsonb;
begin
  -- Entitlement first, before anything is read. A pending, rejected or
  -- signed-out caller gets null — the same answer as a page that does not exist,
  -- so this cannot be used to discover which slugs are real.
  if public.current_account_status() is distinct from 'active' then
    return null;
  end if;

  select * into pg from public.pages where slug = p_slug;
  if not found then
    return null;
  end if;

  -- An unpublished page is visible to an admin (that is how a draft gets
  -- previewed) and to nobody else.
  if not pg.is_published and not public.is_active_admin() then
    return null;
  end if;

  /* 🔴 AN ADMIN IS NOT AUTO-UNLOCKED. They can read the sections through the
     admin policies and the CMS anyway, so bypassing here would buy nothing —
     and it would mean the one person who needs to CHECK the gate works is the
     one person who never sees it. */
  unlocked := (not pg.is_password_protected)
              or (p_password is not null
                  and pg.password is not null
                  and p_password = pg.password);

  if unlocked then
    select coalesce(jsonb_agg(x order by x.sort_order, x.id), '[]'::jsonb)
      into sections
      from (
        select ps.id,
               ps.step_number,
               ps.heading,
               ps.body,
               ps.sort_order,
               coalesce((
                 select jsonb_agg(
                          jsonb_build_object(
                            'id',    sl.id,
                            'label', sl.label,
                            'url',   sl.url
                          ) order by sl.sort_order, sl.id)
                   from public.section_links sl
                  where sl.section_id = ps.id
               ), '[]'::jsonb) as links
          from public.page_sections ps
         where ps.page_id = pg.id
      ) x;
  end if;

  return jsonb_build_object(
    'id',                    pg.id,
    'slug',                  pg.slug,
    'title',                 pg.title,
    'subtitle',              pg.subtitle,
    'parent_id',             pg.parent_id,
    'is_published',          pg.is_published,
    'is_password_protected', pg.is_password_protected,
    'locked',                not unlocked,
    'sections',              sections
  );
end;
$$;

revoke all     on function public.agent_page(text, text) from public, anon;
grant  execute on function public.agent_page(text, text) to authenticated;


-- -----------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY.
--
--   role                  pages         sections/links            activity_logs
--   --------------------  ------------  ------------------------  -------------
--   anon                  nothing       nothing                   nothing
--   authenticated, not
--     status='active'     nothing       nothing                   insert own
--   active agent          published     published + UNPROTECTED   insert own
--                         (read)        (read)                    (no read)
--   active admin          everything    everything                everything
-- -----------------------------------------------------------------------------
alter table public.pages         enable row level security;
alter table public.page_sections enable row level security;
alter table public.section_links enable row level security;
alter table public.activity_logs enable row level security;

-- ---- pages ----
drop policy if exists "pages_select_active" on public.pages;
create policy "pages_select_active"
  on public.pages for select to authenticated
  using ( public.current_account_status() = 'active' and is_published );

drop policy if exists "pages_select_admin" on public.pages;
create policy "pages_select_admin"
  on public.pages for select to authenticated
  using ( public.is_active_admin() );

drop policy if exists "pages_insert_admin" on public.pages;
create policy "pages_insert_admin"
  on public.pages for insert to authenticated
  with check ( public.is_active_admin() );

drop policy if exists "pages_update_admin" on public.pages;
create policy "pages_update_admin"
  on public.pages for update to authenticated
  using      ( public.is_active_admin() )
  with check ( public.is_active_admin() );

drop policy if exists "pages_delete_admin" on public.pages;
create policy "pages_delete_admin"
  on public.pages for delete to authenticated
  using ( public.is_active_admin() );

-- ---- page_sections ----
-- 🔴 THE `not p.is_password_protected` CLAUSE IS THE GATE. Without it an agent
-- could read a bootcamp's content straight off /rest/v1/page_sections and never
-- meet the password form at all.
drop policy if exists "page_sections_select_active" on public.page_sections;
create policy "page_sections_select_active"
  on public.page_sections for select to authenticated
  using (
    public.current_account_status() = 'active'
    and exists (
      select 1 from public.pages p
       where p.id = page_sections.page_id
         and p.is_published
         and not p.is_password_protected
    )
  );

drop policy if exists "page_sections_select_admin" on public.page_sections;
create policy "page_sections_select_admin"
  on public.page_sections for select to authenticated
  using ( public.is_active_admin() );

drop policy if exists "page_sections_insert_admin" on public.page_sections;
create policy "page_sections_insert_admin"
  on public.page_sections for insert to authenticated
  with check ( public.is_active_admin() );

drop policy if exists "page_sections_update_admin" on public.page_sections;
create policy "page_sections_update_admin"
  on public.page_sections for update to authenticated
  using      ( public.is_active_admin() )
  with check ( public.is_active_admin() );

drop policy if exists "page_sections_delete_admin" on public.page_sections;
create policy "page_sections_delete_admin"
  on public.page_sections for delete to authenticated
  using ( public.is_active_admin() );

-- ---- section_links ---- (same shape, one join further out)
drop policy if exists "section_links_select_active" on public.section_links;
create policy "section_links_select_active"
  on public.section_links for select to authenticated
  using (
    public.current_account_status() = 'active'
    and exists (
      select 1
        from public.page_sections ps
        join public.pages p on p.id = ps.page_id
       where ps.id = section_links.section_id
         and p.is_published
         and not p.is_password_protected
    )
  );

drop policy if exists "section_links_select_admin" on public.section_links;
create policy "section_links_select_admin"
  on public.section_links for select to authenticated
  using ( public.is_active_admin() );

drop policy if exists "section_links_insert_admin" on public.section_links;
create policy "section_links_insert_admin"
  on public.section_links for insert to authenticated
  with check ( public.is_active_admin() );

drop policy if exists "section_links_update_admin" on public.section_links;
create policy "section_links_update_admin"
  on public.section_links for update to authenticated
  using      ( public.is_active_admin() )
  with check ( public.is_active_admin() );

drop policy if exists "section_links_delete_admin" on public.section_links;
create policy "section_links_delete_admin"
  on public.section_links for delete to authenticated
  using ( public.is_active_admin() );

-- ---- activity_logs ----
-- 🔴 `user_id = auth.uid()` IN THE WITH CHECK is what stops one agent writing
-- log lines under another agent's id. A log anyone can forge entries into is
-- worse than no log — it is a log you would believe.
drop policy if exists "activity_logs_insert_self" on public.activity_logs;
create policy "activity_logs_insert_self"
  on public.activity_logs for insert to authenticated
  with check ( user_id = (select auth.uid()) );

drop policy if exists "activity_logs_select_admin" on public.activity_logs;
create policy "activity_logs_select_admin"
  on public.activity_logs for select to authenticated
  using ( public.is_active_admin() );

-- (No update or delete policy, and no grant either. Append-only.)


-- =============================================================================
-- 8. SEED CONTENT.
--
-- 🔴 GENERIC STRUCTURE ONLY. This content was rebuilt from a competitor's public
-- agent pages, and every detail belonging to that company was stripped: their
-- chat tool, their staff, their phone numbers, their private course and carrier
-- links, their PDFs. What is left is the procedure any agency's licensing path
-- shares. Only OFFICIAL, public registries survive as real links (NIPR, SIRCON).
--
-- Everywhere a company-specific detail was removed, the body carries a literal
-- "[ADMIN: …]" marker. Those are not filler — they are the list of things Aiman
-- must supply from the CMS, and they are deliberately conspicuous so that a page
-- which is not finished cannot be mistaken for one that is.
--
-- 🔴 THE GUARD: sections are inserted ONLY for a page that currently has none.
-- Re-running this file after Aiman has edited the content therefore changes
-- nothing. A plain `on conflict do nothing` on `pages` would not be enough —
-- the page row would survive while the sections were inserted a second time.
-- =============================================================================
do $seed$
declare
  v_licensing uuid;
  v_checklist uuid;
  v_resources uuid;
  v_bootcamps uuid;
  v_english   uuid;
  v_spanish   uuid;
  v_section   uuid;
begin

  -- ---- the pages themselves -------------------------------------------------
  insert into public.pages (slug, title, subtitle, sort_order)
  values ('licensing-checklist', 'Licensing Checklist',
          'To get licensed, follow these step-by-step in order!', 10)
  on conflict (slug) do nothing;

  insert into public.pages (slug, title, subtitle, sort_order)
  values ('new-agent-checklist', 'New Agent Checklist',
          'To get contracted, follow these step-by-step in order!', 20)
  on conflict (slug) do nothing;

  insert into public.pages (slug, title, subtitle, sort_order)
  values ('agent-resources', 'Agent Resources',
          'Your financial success is our priority', 30)
  on conflict (slug) do nothing;

  -- The dropdown container. No steps of its own; it exists to hold the two
  -- bootcamp pages in the nav.
  insert into public.pages (slug, title, subtitle, sort_order)
  values ('bootcamps', 'New Agent Bootcamps', null, 40)
  on conflict (slug) do nothing;

  select id into v_licensing from public.pages where slug = 'licensing-checklist';
  select id into v_checklist from public.pages where slug = 'new-agent-checklist';
  select id into v_resources from public.pages where slug = 'agent-resources';
  select id into v_bootcamps from public.pages where slug = 'bootcamps';

  -- 🔴 password 'CHANGE_ME' IS A PLACEHOLDER AND IS DOCUMENTED AS ONE in the
  -- README. It is not a secret; it is a marker that the real one has not been
  -- set yet. Aiman changes it from the CMS before these pages carry anything.
  insert into public.pages (slug, title, parent_id, is_password_protected, password, sort_order)
  values ('bootcamp-english', 'SFP Bootcamp English', v_bootcamps, true, 'CHANGE_ME', 10)
  on conflict (slug) do nothing;

  insert into public.pages (slug, title, parent_id, is_password_protected, password, sort_order)
  values ('bootcamp-spanish', 'SFP Bootcamp Spanish', v_bootcamps, true, 'CHANGE_ME', 20)
  on conflict (slug) do nothing;

  select id into v_english from public.pages where slug = 'bootcamp-english';
  select id into v_spanish from public.pages where slug = 'bootcamp-spanish';


  -- ---- LICENSING CHECKLIST --------------------------------------------------
  if not exists (select 1 from public.page_sections where page_id = v_licensing) then

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '01', 'Review licensing requirements for your resident state',
            'Start with your own state''s requirements — they vary, and every step after this one depends on what yours says.', 10)
    returning id into v_section;
    insert into public.section_links (section_id, label, url, sort_order) values
      (v_section, 'NATIONAL INSURANCE PRODUCER REGISTRY',
       'https://nipr.com/licensing-center/state-requirements', 10);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '02', 'Register for Pre-licensing Study Course',
            'You MUST complete the study course registration from your pc or laptop. Please do not register for the course from your phone. Once registered, you have 30 DAYS free access to the study course. Small fee applies if you need to extend beyond 30 days. [ADMIN: add registration link]', 20);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '03', 'Register for State Licensing Exam & Study to Pass Exam!',
            'When you are about 60% through the course, look into registering for state licensing exam. Register early to help you stay motivated and on course! [ADMIN: add exam-registration link]', 30);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '04', 'Email Admin Team your exam date.',
            'Subject line: "Exam schedule date confirmation". Send a screenshot of your scheduled exam date or forward your scheduled exam email confirmation to the Admin Team.', 40);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '05', 'Inform Admin Team and Your Team Leader that you passed your exam!',
            'Congratulations! Let the Admin Team and your Team Leader know you are ready for serious business.', 50);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '06', 'Get plugged in (if you have not)',
            '[ADMIN: fill in team communication tool + how to get an invite]', 60);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '07', 'Get fingerprints done (if your state requires it)',
            'If your state requires fingerprints, schedule an appointment prior to your exam date or as soon as you possibly can. Use the provider information from earlier steps, or search for fingerprint services in your area.', 70);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '08', 'Apply for your State Insurance License',
            'The testing facility may provide information on how to apply for your state insurance license. Call your resident State Department of Insurance for clarification, if needed. We recommend applying with NIPR LICENSING CENTER, or check out SIRCON.

Note: Resident License requirements vary by state; some require fingerprinting or other background checks. Pricing varies by state. You must first have a resident license and NPN before you can start contracting.', 80)
    returning id into v_section;
    insert into public.section_links (section_id, label, url, sort_order) values
      (v_section, 'NIPR LICENSING CENTER', 'https://nipr.com/licensing-center/apply', 10),
      (v_section, 'SIRCON', 'https://www.sircon.com/products/individuals/index.jsp', 20);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, '09', 'Get National Producer Number (NPN)',
            'You DO NOT need to apply for an NPN. The NPN is issued to you when your State updates the National Producer Registry with your approved license. Call your resident State''s Department of Insurance daily to check on your application and speed up the process. Check for your NPN in the link below.', 90)
    returning id into v_section;
    insert into public.section_links (section_id, label, url, sort_order) values
      (v_section, 'NATIONAL INSURANCE PRODUCER REGISTRY', 'https://nipr.com/help/look-up-your-npn', 10);

    -- Closing block — no step number, so it renders as a plain card rather than
    -- a tenth step in a nine-step list.
    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_licensing, null, 'Finish. Congratulations!',
            'Now get started on the "New Agent Checklist".', 100)
    returning id into v_section;
    insert into public.section_links (section_id, label, url, sort_order) values
      (v_section, 'New Agent Checklist', '/agents/new-agent-checklist', 10);
  end if;


  -- ---- NEW AGENT CHECKLIST --------------------------------------------------
  if not exists (select 1 from public.page_sections where page_id = v_checklist) then

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_checklist, '01', 'Get plugged in (if you have not)',
            '[ADMIN: fill in team communication tool + how to get an invite]', 10);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_checklist, '02', 'Get Error & Omissions (E&O) Insurance',
            'You may purchase E&O insurance from any provider. Consult with your Team Leader if needed; feel free to shop around.

Notes:
1) Minimum coverage should be $1M/$3M.
2) Have your start date the first of the current month (e.g. if it is 4/12, have your policy start 4/1) so you can start contracting and onboarding immediately.
3) Choose the newly-licensed L&H agent option with coverage that includes Fixed and Indexed Annuities.

[ADMIN: add preferred E&O provider link(s)]', 20);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_checklist, '03', 'Anti-Money Laundering (AML) short course',
            'Every carrier requires a licensed agent to have a valid AML certificate. This short course (about one hour) is valid for two years. Some carriers have their own AML course; generally one AML course from a reputable provider covers a wide range of carriers. The fee is minimal.

Complete the course, KEEP a copy of your completion certificate, and submit it along with your other documents to the Admin Team. [ADMIN: add AML course link]', 30);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_checklist, '04', 'Gather these documents and information for onboarding & contracting',
            'A. Email the Admin Team the documents below in ONE email. Subject line: "Ready to contract – docs attached from (your name)".
1) Resident Insurance License
2) National Producer Number (NPN)
3) Driver''s License
4) E&O Insurance
5) AML certificate

B. Prepare a copy of a voided check as a PDF. In place of a voided check you may submit a signed letter from your bank on bank letterhead, signed by a bank representative, including routing number, account number, and your personal information; or a direct-deposit instruction printout stating your name, routing number and account number. Preferred option is a voided check. Every carrier pays you directly. DO NOT EMAIL this item.

C. Have this ready for your contracting appointment:
i) Bank name, address, and phone number (any branch).
ii) Beneficiary name, SSN, and email. Beneficiary must be over 18 and legally present in the US.', 40)
    returning id into v_section;
    insert into public.section_links (section_id, label, url, sort_order) values
      (v_section, 'Look up your NPN (NIPR)', 'https://nipr.com/help/look-up-your-npn', 10);

    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_checklist, null, 'Complete Required IUL Bootcamp & Annuity 101',
            'This step is REQUIRED in order to contract with IUL and Annuity carriers. Complete the required training, then email a completion screenshot to your Admin Team.

Once you have submitted all required documents, the Admin Team will reach out to schedule your onboarding and contracting meeting. [ADMIN: add training portal link + admin contact instructions]', 50);
  end if;


  -- ---- AGENT RESOURCES ------------------------------------------------------
  if not exists (select 1 from public.page_sections where page_id = v_resources) then
    insert into public.page_sections (page_id, step_number, heading, body, sort_order) values
      (v_resources, null, 'Onboarding Tips',    '[ADMIN: add onboarding tips link(s)]',   10),
      (v_resources, null, 'Contracting Tips',   '[ADMIN: add contracting tips link(s)]',  20),
      (v_resources, null, 'Carriers',           '[ADMIN: add carrier names, phone numbers, and portal links here]', 30),
      (v_resources, null, 'Document Download',  '[ADMIN: upload/add document links here]', 40);
  end if;


  -- ---- BOOTCAMPS ------------------------------------------------------------
  if not exists (select 1 from public.page_sections where page_id = v_english) then
    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_english, null, null, '[ADMIN: add protected content + set the real password]', 10);
  end if;

  if not exists (select 1 from public.page_sections where page_id = v_spanish) then
    insert into public.page_sections (page_id, step_number, heading, body, sort_order)
    values (v_spanish, null, null, '[ADMIN: add protected content + set the real password]', 10);
  end if;

end
$seed$;


-- =============================================================================
-- 9. VERIFICATION. Read the output; every *_MUST_BE_* column has its answer in
--    its name. Same convention as 0005.
-- =============================================================================
select
  (select count(*) from public.pages)                                   as pages_seeded,
  (select count(*) from public.page_sections)                           as sections_seeded,
  (select count(*) from public.section_links)                           as links_seeded,
  (select count(*) from public.pages where is_password_protected
     and password = 'CHANGE_ME')                                        as pages_still_on_placeholder_pw,
  to_regprocedure('public.agent_page(text,text)') is not null            as fn_agent_page,
  -- The password column must NOT be readable by a browser session.
  (select count(*) from information_schema.column_privileges
    where grantee = 'authenticated' and table_schema = 'public'
      and table_name = 'pages' and column_name = 'password'
      and privilege_type = 'SELECT')                                    as pw_readable_MUST_BE_0,
  -- No policy on the new tables may be a blanket allow.
  (select count(*) from pg_policies
    where schemaname = 'public'
      and tablename in ('pages','page_sections','section_links','activity_logs')
      and (coalesce(qual, '') = 'true' or coalesce(with_check, '') = 'true'))
                                                                        as blanket_policies_MUST_BE_0,
  -- The log must be append-only: no UPDATE/DELETE grant to any browser role.
  (select count(*) from information_schema.table_privileges
    where grantee in ('anon','authenticated') and table_schema = 'public'
      and table_name = 'activity_logs'
      and privilege_type in ('UPDATE','DELETE'))                        as log_mutable_MUST_BE_0;
