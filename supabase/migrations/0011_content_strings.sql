-- =============================================================================
-- 0011_content_strings.sql — let the admin edit the words on every public page.
--
-- WHY THIS SHAPE, AND WHY IT IS NOT A "PAGE BUILDER".
--
-- Every visible string on this site already lives in messages/en.json and
-- messages/es.json and is read through next-intl. The page components contain
-- NO hardcoded copy — they contain layout, animation and measured spacing, and
-- they call t("about.hero.title") for the words. That separation already
-- existed for translation; this table reuses it for editing.
--
-- So an override here changes the WORDS and can never change the LAYOUT. That
-- is the whole point: /about and /services are scroll-linked sequences with
-- parallax and cap-height-trimmed type, and handing a non-developer free rein
-- over their markup would break them within a day. Handing over the copy
-- cannot.
--
-- 🔴 THIS TABLE IS AN OVERRIDE LAYER, NEVER A DEPENDENCY. i18n.ts loads the
-- JSON catalogue first and merges these rows ON TOP. If this table is empty,
-- unreachable, or the query throws, the site renders exactly what it renders
-- today. A CMS that can take the website down when the database hiccups is a
-- worse product than no CMS, so the read is wrapped and failure is silent.
--
-- DELETING A ROW IS THE UNDO. There is no "revert" feature to build: remove
-- the override and the original string from the repo comes back.
-- =============================================================================

create table if not exists public.content_strings (
  id          uuid        primary key default gen_random_uuid(),
  -- Which language this override applies to. Aiman edits both.
  locale      text        not null check (locale in ('en', 'es')),
  -- The dotted next-intl path, e.g. "about.hero.title". Matches the JSON.
  key         text        not null check (length(key) between 1 and 200),
  -- The replacement copy. 5000 is far above any real string here (the longest
  -- in the catalogue is a few hundred characters) while still being a ceiling.
  value       text        not null check (length(value) <= 5000),
  updated_at  timestamptz not null default now(),
  updated_by  uuid        references auth.users(id) on delete set null,
  -- One override per string per language. The editor upserts on this.
  unique (locale, key)
);

create index if not exists content_strings_locale_idx
  on public.content_strings (locale);

alter table public.content_strings enable row level security;

-- -----------------------------------------------------------------------------
-- READ IS PUBLIC, AND THAT IS DELIBERATE.
--
-- These rows ARE the public website's copy — every one of them is rendered to
-- anonymous visitors by definition. There is nothing to protect, and a public
-- policy means page rendering uses the ordinary publishable key instead of
-- reaching for the service-role key on every request. Keeping the privileged
-- key out of the render path is the safer arrangement, not the looser one.
-- -----------------------------------------------------------------------------
drop policy if exists "content_strings_select_public" on public.content_strings;
create policy "content_strings_select_public"
  on public.content_strings for select
  using (true);

-- -----------------------------------------------------------------------------
-- WRITE IS ADMIN ONLY, via the same public.current_app_role() that 0001
-- established and every other table here uses.
-- -----------------------------------------------------------------------------
drop policy if exists "content_strings_write_admin" on public.content_strings;
create policy "content_strings_write_admin"
  on public.content_strings for all
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');
