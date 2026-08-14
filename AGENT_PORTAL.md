# The agents area, the CMS and the activity log

Everything under `/agents` is content Aiman edits from `/admin` — no developer,
no deploy. This file explains how to switch it on, how to run it day to day, and
which decisions are load-bearing.

It documents the agents area only. `HANDOFF.md` remains the record for the
public site.

---

## 1. What this is

| Route | Who can reach it | What it is |
|---|---|---|
| `/login` | anyone | Email + password. No public sign-up exists. |
| `/agents` | any **active** account | Index of the published agent pages. |
| `/agents/:slug` | any **active** account | One page, rendered from the database. Gated pages ask for a password first. |
| `/admin` | `role = 'admin'` | Dashboard: leads, accounts, agents, applications. |
| `/admin/content` | `role = 'admin'` | **The CMS.** Pages, sections, links. |
| `/admin/logs` | `role = 'admin'` | **The activity log.** Who did what, when. |

Two roles, `admin` and `agent`, and a four-state account status
(`unverified` → `pending` → `active`, or `rejected`). **Only `active` grants
anything** — every RLS policy in the database turns on that one word.

---

## 2. Switching it on

**One migration, run once.**

1. Supabase dashboard → SQL Editor.
2. Paste **`supabase/migrations/0007_agent_cms.sql`** whole, and run it.
3. Read the verification row it prints at the end. Every column named
   `*_MUST_BE_0` must be `0`, and `fn_agent_page` must be `true`.

It is idempotent: re-running it changes nothing, and it will **not** overwrite
content you have edited (sections are seeded only for a page that has none).

It assumes `0001`–`0006` have already been applied. If `is_active_admin()` does
not exist, run `0005_agent_signup.sql.txt` first.

### The first admin

There is no way to create an administrator from inside the app, deliberately.

1. Create the account: Supabase dashboard → **Authentication → Users → Add
   user**, with **Auto Confirm User** ON. **Any email domain works** — the
   company-domain restriction was removed on 2026-08-14 (see §3).
2. Open **`supabase/FIRST_ADMIN.sql`**, change the one marked line to that
   address, and run the whole file in the SQL Editor. Type it carefully:
   nothing validates the domain, and this promotes whoever you name to admin.
3. It prints the admin rows. Yours should be there with `role = admin` and
   `status = active`.

That script briefly disables the trigger which makes `profiles.role` immutable —
the control that makes self-elevation impossible. Disabling it requires table
ownership, which only the dashboard's `postgres` role has. If it errors with
"must be owner of table profiles", you are not running it as the project owner;
that is the control working, not a bug.

### Environment

Copy `.env.example` → `.env.local` and fill in three values. The short version:
the two `NEXT_PUBLIC_` ones are meant to be in the browser; the service-role key
must never be, and `npm run build` fails if it ever reaches the static output.

---

## 3. Creating agent accounts

Agents **cannot register themselves.** There is no sign-up route, no "Sign in
with Google", and `scripts/test-auth-domain.mjs` fails the build if a `signUp()`
call reappears anywhere in the repo. Accounts exist because an admin made one.

Both paths are on `/admin`, in the **Create an agent** card.

**A. Send a setup link** *(preferred)*
Type name, email, phone. Synergy creates the account and emails a single-use
link; the agent chooses their own password. Nobody but them ever knows it.
If mail is not configured, the screen shows you the link to pass on by hand.

**B. Set the password yourself**
Type name, email, phone, and a password (minimum 10 characters, typed twice).
The account is created immediately and confirmed, and you tell the agent the
password.

Use B when you are sitting with the new agent, or when setup emails are not
being delivered. **You will know their password** — ask them to change it from
*Forgot password* on the sign-in screen once they are in. That is the whole
trade-off, and it is why A is the default.

Either way: the new account is always `role = 'agent'` (hard-coded in the
database and immutable afterwards), and it is set to `active` so the agent can
sign in straight away.

> **Any email address is accepted — gmail, outlook, anything.** The
> `@fflsynergy.com` requirement was removed on 2026-08-14
> (`0009_remove_domain_restriction.sql`). What still keeps strangers out is that
> **there is no public sign-up**: accounts exist only because an admin, the
> Supabase dashboard, or the Admin API made one.
>
> The thing you lose is typo protection. A mistyped address used to be refused
> twice — by the form and by the database. Now it creates a real account at an
> address nobody owns. **Read the address back before you submit**, and use the
> *Delete* button on any unverified account created by mistake.

**To disable an agent:** `/admin` → Accounts → **Reject**. They keep their
password and it stops working — every policy requires `status = 'active'`, so a
rejected account reaches nothing, immediately, with no session to wait out.
Reversible: reject → active is a legal transition.

---

## 4. The CMS

`/admin` → **Content**.

### The shape

```
page                    a URL: /agents/<slug>
 └── section            a numbered step, or a plain block
      └── link          a labelled URL
```

- **Sections with a step number** ("01", "02", "4A") render as numbered steps in
  an ordered list. **Sections without one** render as a plain card. That is the
  only difference, and it is what keeps "Finish. Congratulations!" from becoming
  a tenth step in a nine-step checklist.
- **Order** is the arrow buttons on each section. Pages order by the **Order**
  number in their settings.
- **Nesting is one level deep.** A page can sit under a top-level page, and that
  parent becomes a dropdown in the agents menu — that is how *New Agent
  Bootcamps* holds the two bootcamp pages. A parent with no content of its own
  forwards to its first child rather than serving an empty page.

### Writing a body

A blank line starts a new paragraph. `**bold**` for emphasis.
`[label](https://example.com)` for a link.

Anything you type as `[ADMIN: …]` renders as an **unmissable "still missing"
marker**. The seeded pages carry ten of them — every place a detail from the
reference site was stripped and Synergy has not supplied its own (the team chat
tool, the pre-licensing course, the AML course, the E&O provider, the training
portal, the carrier list). Replacing those markers with real detail is the work
this CMS exists for.

> HTML is not supported and never will be — bodies are rendered as text, so a
> pasted `<script>` shows up as characters on the page rather than running.

### Publishing

**A new page starts as a draft.** It appears in the CMS list marked *Draft* and
is invisible to every agent until you tick **Published**. You can open a draft
yourself from *View the page* to check how it reads.

To take a page down, untick **Published** — do not delete it. Deleting is
permanent, removes its sections and links with it, and has no confirmation step
and no undo.

### Password-protected pages

Tick **Require a password** in page settings and type one.

- The password field is **always blank** on load, for everyone including you.
  Leave it blank to keep the current password; type in it to replace it.
- **The stored password is never readable by anybody** — the database refuses to
  send that column to any browser session. It can be set, and it can be checked;
  it cannot be looked up. If it is forgotten, set a new one.
- Agents who have unlocked a page stay unlocked for that browser session.
  **Changing the password locks everyone out again on their next page load** —
  which is what makes rotating it a real control rather than a cosmetic one.
- The two seeded bootcamp pages ship with the placeholder password `CHANGE_ME`.
  Change both before putting anything real behind them; the migration's
  verification row counts how many are still on it.

Protection is enforced in the database, not in the page. An agent without the
password cannot retrieve the content by any route — not by viewing source, not
by calling the API directly. See §7.

---

## 5. The activity log

`/admin` → **Activity**.

Recorded: `login`, `view_page`, `page_unlocked`, `cms_edit`, `account_created`,
`account_status_changed`. Filter by person, action and date range; the filters
live in the URL, so a filtered view can be bookmarked and shared.

- **Only admins can read it**, enforced in the database.
- **It is append-only.** No API caller — admin included — can edit or delete a
  row. A log anyone can edit is worse than no log.
- Deleting an account leaves its history behind with the actor shown as
  *Deleted account*, rather than erasing what that account did.
- **Failures are not logged.** No failed sign-ins, no wrong page passwords. A
  log of attempted addresses is a list of which addresses exist; a log of nearly
  correct passwords is a list of people's other passwords.
- Capped at the 500 most recent matching rows. The footer says so when the cap
  is hit — narrow the dates to see older activity.

---

## 6. What changed in the existing app

Read this before wondering where something went.

- **`/welcome` is retired in favour of `/agents`.** The four hardcoded portal
  sections (licensing, contracting, resources, training) carried seven
  `PortalPlaceholder` gaps that a developer had to ship to fill; they are now
  CMS rows Aiman fills himself. `next.config.mjs` redirects `/welcome` and each
  old section URL to its CMS equivalent, so existing bookmarks work.
  **Nothing was deleted** — `welcome/page.tsx`, `welcome/[section]/page.tsx`,
  `PortalChrome` and the four section components are untouched and still
  compile. Restoring the old portal is deleting the `redirects()` block.
- **Sign-in sends agents to `/agents`** instead of `/welcome`.
- **Admins are not bounced out of the agents area.** `welcome/layout.tsx`
  redirected an admin to `/admin`; `agents/layout.tsx` does not, because Aiman
  authors these pages and has to be able to read them.
- **`/admin` gained two nav items**, *Content* and *Activity*, which are real
  routes rather than the in-page anchors the other items use.
- **The account-creation card gained a second form** (password mode). The
  existing invite flow is unchanged.

### Known gap, pre-existing

The **`portal` namespace in `messages/es.json` is entirely empty strings**, so
the retired Spanish portal rendered blank labels. That is not introduced here and
not fixed here — but the new `agents` namespace **is** fully translated in both
locales, so `/es/agents` reads correctly. If `/es/welcome` is ever restored, its
Spanish needs writing.

---

## 7. Why it is safe

Four things, in order of how much they matter.

**1. Row Level Security is the boundary, not the UI.** Every table has RLS on
with explicit policies. Deleting every guard in the TypeScript would not let an
agent read another agent's profile, edit a page, or read the log. The UI hiding
a button is a courtesy; Postgres refusing the write is the control.

**2. The service-role key never reaches the browser.** It has no
`NEXT_PUBLIC_` prefix (the actual mechanism), the module holding it throws if
evaluated in a browser, and `postbuild` fails the build if its name or prefix
appears in the static output. It is used by three server actions, all of which
call `requireAdmin()` before constructing the privileged client, and all three
exist only because `auth.users` rows cannot be created or deleted through RLS.
**The CMS does not use it at all.**

> The brief this was built from specified Supabase Edge Functions for these
> privileged operations. They are Next.js server actions instead, because this
> app is Next.js on Vercel and already had that pattern working, documented and
> build-gated. The security property asked for — *service-role stays server-side,
> the caller is verified as an admin before anything happens* — is satisfied
> identically. Adding Edge Functions would have meant a second privileged
> surface, a second deploy pipeline, and two implementations of account creation.

**3. The password gate is enforced in SQL.** The obvious build — fetch
everything, hide it in React until the input matches — is a curtain: the content
is already in the browser and the password is one API call away. Instead:
`pages.password` has no SELECT grant for any browser session; the sections and
links of a protected page are excluded from the agent-facing RLS policies, so
the REST API will not serve them either; and one `SECURITY DEFINER` function is
the only path to that content, returning nothing unless the supplied password
matches.

**4. Admin-written content is rendered as text, never as HTML.** An admin
account is exactly what a phisher targets, and a compromised one that could
inject a `<script>` into a page every agent reads would turn the portal into a
credential harvester. Link URLs are additionally constrained to `http(s)://` or
a site-relative path by a database check, so `javascript:` cannot reach an href.

---

## 8. File map

```
supabase/migrations/0007_agent_cms.sql   tables, RLS, agent_page(), seed content
supabase/FIRST_ADMIN.sql                 one-off, run by hand

lib/cms/pages.ts                         reads: agent page (RPC), nav tree, CMS
lib/cms/activity.ts                      the log: one writer, one reader
lib/cms/gate.ts                          the unlock cookie's name and path

app/[locale]/(portal)/agents/            layout (guard + nav), index, [slug]
app/[locale]/(portal)/agents/[slug]/actions.ts    unlock / re-lock
app/[locale]/(portal)/admin/content/     CMS list, [id] editor, actions
app/[locale]/(portal)/admin/logs/        the activity log

components/agents/AgentsNav.tsx          CMS-driven nav with the dropdown
components/agents/CmsSections.tsx        steps vs plain blocks
components/agents/RichText.tsx           the safe body renderer
components/admin/AdminSubShell.tsx       chrome for /admin's sub-routes
```
