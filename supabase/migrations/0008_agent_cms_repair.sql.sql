-- =============================================================================
-- 0008_agent_cms_repair.sql  —  PUBLISH THE REAL CONTENT PAGES, AND REPORT ON
-- THE STATE OF THE CMS.
--
-- Safe to run any number of times. It creates nothing and deletes nothing.
--
-- =============================================================================
-- 🔴 RUN 0007 FIRST. THIS FILE REPAIRS; IT DOES NOT INSTALL.
--
-- If `public.pages` does not exist, this raises with that instruction rather
-- than failing halfway through with a relation-does-not-exist buried in the
-- output. That absent-table case is not hypothetical: it is what was actually
-- wrong the first time the agents area came up empty. The app reported "no pages
-- have been published yet" because its read failed and the failure was being
-- swallowed — the tables were never created at all. Both halves are fixed: the
-- app now distinguishes the two (lib/cms/pages.ts, getNavTree), and this file
-- refuses to pretend it can repair a schema that is not there.
--
-- =============================================================================
-- 🔴 WHY THE SEED CONTENT IS NOT REPEATED IN THIS FILE.
--
-- Section 3 below reports any page missing its sections, and tells you to re-run
-- `0007_agent_cms.sql` to restore them. 0007 seeds a page's sections ONLY when
-- that page currently has none, so re-running it repairs the gap and touches
-- nothing you have edited — that guard is exactly what it was written for.
--
-- Copying those ~150 lines of body text into this migration would give the
-- content two homes. The first time somebody edited a step in one and not the
-- other, whichever file was run last would win, silently. One source of truth is
-- worth more than the convenience of a single-file repair.
-- =============================================================================

do $guard$
begin
  if to_regclass('public.pages') is null then
    raise exception
      'public.pages does not exist. Run supabase/migrations/0007_agent_cms.sql first, then re-run this file.';
  end if;
end
$guard$;


-- -----------------------------------------------------------------------------
-- 1. PUBLISH THE REAL CONTENT PAGES.
--
--    These six slugs are the seeded structure. Anything else in the table was
--    created by an admin through the CMS, and its published state is THEIR
--    decision — a repair script that published every draft it found would be a
--    repair script that leaks half-written pages to every agent. The list is
--    explicit for that reason.
--
--    `where is_published is distinct from true` so the row is only touched when
--    it actually needs changing; that keeps `updated_at` (and the touch trigger)
--    honest about when the content last changed.
-- -----------------------------------------------------------------------------
update public.pages
   set is_published = true
 where slug in (
         'licensing-checklist',
         'new-agent-checklist',
         'agent-resources',
         'bootcamps',          -- the dropdown parent
         'bootcamp-english',   -- its two children
         'bootcamp-spanish'
       )
   and is_published is distinct from true;


-- -----------------------------------------------------------------------------
-- 2. REPAIR THE BOOTCAMP NESTING.
--
--    The two bootcamp pages hang off `bootcamps` so the nav renders them as a
--    submenu. A child whose `parent_id` is null is not broken — it renders as a
--    top-level page — but it is not what was intended, and `on delete set null`
--    on that FK means a parent that was deleted and recreated leaves exactly
--    this state behind.
-- -----------------------------------------------------------------------------
update public.pages c
   set parent_id = p.id
  from public.pages p
 where p.slug = 'bootcamps'
   and c.slug in ('bootcamp-english', 'bootcamp-spanish')
   and c.parent_id is distinct from p.id;


-- =============================================================================
-- 3. REPORT. Nothing below changes anything — read the output.
-- =============================================================================

-- ---- 3a. Every page, and whether it has content. ----------------------------
-- `sections = 0` on a content page means its seed did not run. Re-run 0007 to
-- restore it. `bootcamps` legitimately has 0: it is a menu container, and the
-- app forwards it to its first child rather than rendering it.
select
  p.slug,
  p.title,
  p.is_published,
  p.is_password_protected,
  parent.slug                                              as parent_slug,
  p.sort_order,
  (select count(*) from public.page_sections s where s.page_id = p.id)   as sections,
  (select count(*) from public.section_links l
     join public.page_sections s on s.id = l.section_id
    where s.page_id = p.id)                                              as links
from public.pages p
left join public.pages parent on parent.id = p.parent_id
order by coalesce(parent.sort_order, p.sort_order), p.sort_order;


-- ---- 3b. The headline numbers. ----------------------------------------------
select
  (select count(*) from public.pages)                                as pages_total,
  (select count(*) from public.pages where is_published)             as pages_published,
  -- What `/agents` will list: published, top level. If this is 0, the landing
  -- page is legitimately empty and the app will now say so.
  (select count(*) from public.pages
    where is_published and parent_id is null)                        as landing_cards,
  -- Content pages with no sections. MUST BE 0 — anything else means re-run 0007.
  (select count(*) from public.pages p
    where p.slug in ('licensing-checklist','new-agent-checklist','agent-resources',
                     'bootcamp-english','bootcamp-spanish')
      and not exists (select 1 from public.page_sections s where s.page_id = p.id))
                                                                     as pages_missing_sections_MUST_BE_0,
  -- Bootcamps still on the placeholder password.
  (select count(*) from public.pages
    where is_password_protected and password = 'CHANGE_ME')          as pages_on_placeholder_pw,
  -- The password column must stay unreadable by browser sessions (0007 §5).
  (select count(*) from information_schema.column_privileges
    where grantee = 'authenticated' and table_schema = 'public'
      and table_name = 'pages' and column_name = 'password'
      and privilege_type = 'SELECT')                                 as pw_readable_MUST_BE_0;


-- ---- 3c. CONTENT HYGIENE — the other agency's details must not be in here. ---
--
-- 🔴 THIS IS A REAL CHECK, NOT A FORMALITY. The seed structure was rebuilt from
-- a competitor's public agent pages, and everything identifying them was
-- stripped: their chat tool, their staff, their phone numbers, their private
-- course and carrier links, their PDFs. Only official public registries survive
-- as real links (NIPR, SIRCON).
--
-- It scans BODIES AND LINKS, including anything an admin has typed since — the
-- likeliest way one of these gets reintroduced is somebody pasting from the old
-- site while filling in an [ADMIN: …] marker. Every count must be 0.
select
  (select count(*) from public.page_sections
    where body ~* '(slack|ffl-oc\.com|srstrainingcamp|webce|napa-benefits|360coveragepros|prepare2pass|xcelsolutions)')
                                                                     as bodies_with_competitor_detail_MUST_BE_0,
  (select count(*) from public.section_links
    where url ~* '(ffl-oc\.com|srstrainingcamp|webce|napa-benefits|360coveragepros|prepare2pass|xcelsolutions)'
       or label ~* 'slack')                                          as links_with_competitor_detail_MUST_BE_0,
  -- A US phone number in a body. The seed contains none; a real one appearing
  -- here means somebody pasted contact details that need checking.
  (select count(*) from public.page_sections
    where body ~ '(\+?1[ .-]?)?\(?\d{3}\)?[ .-]\d{3}[ .-]\d{4}')     as bodies_with_phone_numbers_CHECK_THESE,
  -- Outstanding [ADMIN: …] markers — the details Synergy still owes. Not an
  -- error; this is the to-do list, and it is expected to start at 10.
  (select count(*) from public.page_sections where body like '%[ADMIN:%')
                                                                     as sections_with_admin_markers;


-- ---- 3d. Only official links should be outbound. -----------------------------
-- Read this list. Every https:// host here should be nipr.com or sircon.com
-- until Synergy supplies its own; internal links start with '/'.
select l.url, l.label, p.slug as on_page
  from public.section_links l
  join public.page_sections s on s.id = l.section_id
  join public.pages p on p.id = s.page_id
 order by l.url;
