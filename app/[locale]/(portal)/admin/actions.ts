"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AGENT_HEARD, AGENT_STAGES, type AgentHeard, type AgentStage } from "@/lib/types";
import { siteOrigin } from "@/lib/site-origin";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_FORMAT_RE } from "@/lib/auth-domain";
import { logActivity } from "@/lib/cms/activity";

/*
 * 🔴 `signOut` LIVES IN (portal)/session/actions.ts NOW, AND IT IS NOT
 * RE-EXPORTED FROM HERE.
 *
 * It moved because /pending and /welcome need it and neither should import a
 * module whose every other export is admin-gated. The obvious courtesy —
 * `export { signOut } from ".../session/actions"` — DOES NOT COMPILE: a
 * "use server" file may only export async functions, and a re-export is not
 * one. Next fails the build with "Only async functions are allowed to be
 * exported in a 'use server' file". Import it from its own module.
 */

// =============================================================================
// ACCOUNT APPROVAL — the mutations behind the approvals queue.
//
// 🔴 EVERY ONE OF THEM CALLS requireAdmin() FIRST, and requireAdmin now demands
// role='admin' AND status='active'. A hidden button is not access control; this
// is the first of three gates:
//
//   1. requireAdmin()          — the caller is a verified, ACTIVE admin.
//   2. profiles_update_admin   — RLS re-judges it in Postgres, and the column
//      + the `grant update (status)`   grant means `status` is the only column any API
//                                caller can write on this table.
//   3. profiles_enforce_transition — the trigger allows only the four legal
//      status moves and refuses any role change or self-approval.
//
// Delete every line of TypeScript below and the database still refuses an
// agent's attempt to approve themselves. That is the design.
// =============================================================================

/**
 * 🔴 THESE TWO ACTIONS RETURN `void`, NOT A RESULT OBJECT, AND THAT IS FORCED BY
 * THE MARKUP RATHER THAN CHOSEN.
 *
 * The approvals queue posts a plain `<form action={serverAction}>` per row — no
 * `useFormState` — because that is what makes the buttons work without
 * JavaScript and keeps the authorisation decision on the server (see
 * ApprovalsQueue's docblock). React types a bare form action as returning
 * `void | Promise<void>`, so a result object cannot be handed back through it.
 *
 * Feedback therefore travels by REDIRECT: a failure sends the admin back to
 * /admin?accountError=<code>, which the page renders as an alert. Success needs
 * no message — the row's badge changes, which is the feedback.
 *
 * Same shape as the existing `setAgentActive` below, deliberately: one pattern
 * for every mutation on this page.
 */
export type AccountErrorCode = "forbidden" | "invalid" | "write_failed";

/**
 * Bounce back to the dashboard with a failure code.
 *
 * `redirect()` throws NEXT_REDIRECT, so it must never sit inside a try/catch —
 * and calling it as `return fail(...)` keeps each guard a single readable line
 * while still terminating the action.
 *
 * 🔴 THE CODE IS COARSE ON PURPOSE. "forbidden", "invalid" and "write_failed"
 * say nothing about WHICH row, WHICH status, or why Postgres refused. A precise
 * message here would be a probe: an admin whose session has been downgraded
 * could otherwise learn other accounts' states from the error text alone.
 */
function fail(locale: string, code: AccountErrorCode): never {
  redirect(`/${locale}/admin?accountError=${code}`);
}

/**
 * Approve (pending -> active) or reject (pending/active -> rejected).
 *
 * 🔴 IT WRITES `status` AND NOTHING ELSE. `approved_at`/`approved_by` are NOT
 * set here, and that is not an oversight: the section-5 column grant in 0005
 * gives `authenticated` UPDATE on `status` only, so an attempt to write the
 * audit columns through this RLS-scoped client would fail the whole statement
 * and take the approval down with it. Recording who approved whom needs either a
 * definer RPC or a service-role write; both are wider surfaces than this feature
 * currently justifies, so the columns exist, stay null, and are documented as
 * reserved rather than half-populated.
 *
 * 🔴 IT DOES NOT PRE-CHECK THE CURRENT STATUS. The trigger is the authority on
 * which transitions are legal, and re-implementing that list here would create
 * two sources of truth that can drift. An illegal move returns `write_failed`
 * because Postgres raised, which is the correct answer.
 */
export async function setAccountStatus(formData: FormData): Promise<void> {
  // Read the locale FIRST — every failure path below redirects, and the
  // redirect needs it.
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const id = String(formData.get("id") ?? "").trim();
  const next = String(formData.get("status") ?? "").trim();

  const admin = await requireAdmin();
  if (!admin) return fail(locale, "forbidden");

  // Only these two are reachable from the UI. 'pending' and 'unverified' are
  // deliberately NOT accepted: nothing may be pushed back into a queue state,
  // and the trigger would refuse it anyway.
  if (!id || (next !== "active" && next !== "rejected")) {
    return fail(locale, "invalid");
  }

  // 🔴 An admin cannot act on their own row. The trigger enforces this too; the
  // check here exists so the UI gets `invalid` rather than a raised exception.
  if (id === admin.user.id) return fail(locale, "invalid");

  const { error } = await admin.supabase
    .from("profiles")
    .update({ status: next })
    .eq("id", id);

  if (error) {
    console.log("[admin] status write rejected", { code: error.code });
    return fail(locale, "write_failed");
  }

  /* Attributed to the admin who made the decision, with the affected account as
     `target`. This is the row that answers "who approved this person, and when" —
     the question profiles.approved_by was reserved for and cannot currently
     answer (see the note on this action's docblock). */
  await logActivity(admin.user.id, "account_status_changed", id, { status: next });

  revalidatePath(`/${locale}/admin`);
}

/**
 * DELETE AN UNVERIFIED ACCOUNT — squatting mitigation (a).
 *
 * The attack it answers: an account can be created for an address whose inbox
 * nobody controls — a squat, or simply a typo — which then BLOCKS the real
 * person from ever holding that address. The account reaches nothing (it is
 * never confirmed) but the address is taken.
 *
 * 🟡 THIS MATTERS MORE SINCE 2026-08-14, NOT LESS. When the company-domain rule
 * existed, only @fflsynergy.com addresses could be squatted and only an admin
 * could do it. With any domain now permitted, an admin's typo creates an
 * unconfirmed account at an arbitrary address, and this button plus the 24-hour
 * `purge_unverified_accounts` sweep are what clean it up.
 *
 * =============================================================================
 * 🔴 THIS IS THE ONLY PLACE IN THE ADMIN SURFACE THAT USES THE SERVICE-ROLE
 * CLIENT, AND THE REASON IS NARROW AND UNAVOIDABLE.
 *
 * The row that has to die is in `auth.users`, which Supabase owns. There is no
 * RLS policy that can grant a browser session the right to delete an auth user,
 * and there is no DELETE policy on `public.profiles` either (deleting the
 * profile alone would leave an orphaned auth user whose ADDRESS IS STILL TAKEN,
 * i.e. it would not fix the squat at all). Deleting the auth user removes the
 * profile with it, via 0001's `on delete cascade`.
 *
 * THREE THINGS KEEP THIS FROM BEING A BACK DOOR:
 *   1. requireAdmin() runs FIRST and the service client is not created until it
 *      passes.
 *   2. The target is re-read through the RLS-SCOPED client and the delete is
 *      refused unless that read returns status === 'unverified'. So the
 *      privileged call can only ever be aimed at an account that has never
 *      proven its inbox — never at a pending, active or rejected colleague.
 *   3. It is a server action in a server-only module; `createAdminClient` throws
 *      if it is ever evaluated in a browser, and `postbuild` fails the build if
 *      the key's name or prefix reaches `.next/static`.
 * =============================================================================
 */
export async function deleteUnverifiedAccount(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const id = String(formData.get("id") ?? "").trim();

  const admin = await requireAdmin();
  if (!admin) return fail(locale, "forbidden");
  if (!id) return fail(locale, "invalid");
  if (id === admin.user.id) return fail(locale, "invalid");

  // Gate 2. Read through RLS, not the service client — this is the check that
  // stops the privileged delete below being pointed at anyone else.
  const { data: target, error: readError } = await admin.supabase
    .from("profiles")
    .select("id, status")
    .eq("id", id)
    .single();

  if (readError || !target) return fail(locale, "invalid");
  if (target.status !== "unverified") return fail(locale, "invalid");

  const service = createAdminClient();
  if (!service) return fail(locale, "write_failed");

  const { error } = await service.auth.admin.deleteUser(id);
  if (error) {
    console.log("[admin] unverified delete failed", { status: error.status });
    return fail(locale, "write_failed");
  }

  revalidatePath(`/${locale}/admin`);
}

// =============================================================================
// AGENT MUTATIONS
//
// 🔴 EVERY mutation calls requireAdmin() FIRST and returns "forbidden" if the
// caller is not a verified admin — the button being hidden in the UI is not the
// control; this is. requireAdmin() also hands back the RLS-scoped client, so the
// database policies (agents_insert_admin / agents_update_admin) are the second,
// authoritative gate: even if this check were removed, a non-admin's write is
// still rejected by Postgres.
// =============================================================================

export type AgentActionState = {
  ok: boolean;
  error: "forbidden" | "invalid" | "write_failed" | null;
  /** Field-level messages for the form, keyed by field name. */
  fields?: Partial<Record<"name" | "email", string>>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readAgentInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const licensed = formData.get("licensed") === "on";
  const heardRaw = String(formData.get("heard") ?? "");
  const stageRaw = String(formData.get("stage") ?? "");

  const fields: NonNullable<AgentActionState["fields"]> = {};
  if (!name) fields.name = "required";
  if (!email) fields.email = "required";
  else if (!EMAIL_RE.test(email)) fields.email = "format";

  const stage: AgentStage = (AGENT_STAGES as readonly string[]).includes(stageRaw)
    ? (stageRaw as AgentStage)
    : "touch";
  const heard: AgentHeard | null = (AGENT_HEARD as readonly string[]).includes(heardRaw)
    ? (heardRaw as AgentHeard)
    : null;

  return {
    valid: Object.keys(fields).length === 0,
    fields,
    values: {
      name,
      email,
      phone: phone || null,
      state: state || null,
      licensed,
      heard,
      stage,
    },
  };
}

/**
 * Create (no id) or update (id present) an agent. One action, one form.
 */
export async function saveAgent(
  _prev: AgentActionState,
  formData: FormData,
): Promise<AgentActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "forbidden" };

  const { valid, fields, values } = readAgentInput(formData);
  if (!valid) return { ok: false, error: "invalid", fields };

  const id = String(formData.get("id") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";

  const { error } = id
    ? await admin.supabase.from("agents").update(values).eq("id", id)
    : await admin.supabase.from("agents").insert(values);

  if (error) return { ok: false, error: "write_failed" };

  revalidatePath(`/${locale}/admin`);
  return { ok: true, error: null };
}

/**
 * Deactivate / reactivate an agent — the stand-in for delete (no delete policy
 * exists). Re-checks admin; RLS's agents_update_admin is the backstop.
 */
export async function setAgentActive(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return; // forbidden — no-op, nothing changes

  const id = String(formData.get("id") ?? "").trim();
  const active = formData.get("active") === "true";
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  if (!id) return;

  await admin.supabase.from("agents").update({ active }).eq("id", id);
  revalidatePath(`/${locale}/admin`);
}

/**
 * CREATE AN AGENT ACCOUNT AND EMAIL THEM A SETUP LINK.
 *
 * =============================================================================
 * 🔴 THIS IS NOW THE ONLY WAY A PORTAL ACCOUNT COMES INTO EXISTENCE.
 *
 * Public signup was removed on 2026-08-08: the /signup route, its action, its
 * form and its i18n namespace are all deleted, and scripts/test-auth-domain.mjs
 * fails the build if a `signUp()` call reappears anywhere in the repo. What
 * replaced it is this form — an admin types a name, an address and a phone
 * number, and the person receives a link to choose their own password.
 *
 * FOUR CONTROLS, NOT ONE:
 *   1. requireAdmin() FIRST, before the service client is constructed. A
 *      "use server" action compiles to a public POST endpoint; the admin
 *      layout gates the PAGE, not this function.
 *   2. 🔴 THIS SLOT USED TO BE THE COMPANY-DOMAIN TRIGGER, AND IT IS NOW EMPTY.
 *      `enforce_company_domain` on auth.users rejected any non-@fflsynergy.com
 *      address whatever path created it. It was dropped on 2026-08-14
 *      (0009_remove_domain_restriction.sql). Nothing replaced it: there is no
 *      longer any constraint on WHICH address may hold an account, only on who
 *      may create one (control 1) and what that account may do (control 3).
 *   3. handle_new_user hard-codes role='agent'. Role cannot be requested here,
 *      and enforce_profile_transition makes it immutable afterwards.
 *   4. The setup link proves inbox control before a password exists — now the
 *      ONLY thing that ties an account to a real person.
 *
 * 🔴 WHY THE SERVICE ROLE IS UNAVOIDABLE HERE — the same narrow reason as
 * deleteUnverifiedAccount above. The row being created lives in `auth.users`,
 * which Supabase owns; no RLS policy can grant a browser session the right to
 * mint an auth user. The service client is created only AFTER requireAdmin()
 * has returned, and is used for exactly two statements.
 *
 * 🔴 email_confirm: true IS LOAD-BEARING, NOT CONVENIENCE. handle_new_user reads
 * email_confirmed_at at INSERT and writes status='unverified' when it is null.
 * Unverified rows are swept by purge_unverified_accounts after 24 hours — so an
 * unconfirmed invite would silently delete itself overnight, and Aiman would
 * watch accounts vanish with no error anywhere. Confirming at creation lands the
 * profile on 'pending'; the setup link still proves inbox control.
 * =============================================================================
 */

// =============================================================================
// AGENT ACCOUNT CREATION — the only way an account comes into existence.
// =============================================================================

export type InviteState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  /** The password-mode result: the account exists and the admin already knows
   *  the password, because they chose it. Nothing to display but confirmation —
   *  see `createAgentWithPassword` for why the password is never echoed back. */
  | { status: "created"; email: string }
  | { status: "manual"; email: string; link: string }
  /** `detail` carries the raw driver message. Surfaced ON PURPOSE: this is an
   *  admin-only screen, and the last failure cost an hour precisely because the
   *  UI showed nothing while the real reason sat in an unreadable terminal. */
  | { status: "error"; code: string; detail?: string };

/**
 * 🔴 WHY THIS ONE RETURNS STATE INSTEAD OF REDIRECTING.
 *
 * Every other mutation on this page posts a bare <form action> and reports by
 * redirect (see the AccountErrorCode docblock). This one cannot, for two
 * reasons that only apply here:
 *
 *   1. IT HAS SOMETHING TO HAND BACK. On a delivery failure the admin needs the
 *      actual setup URL. A redirect would have to carry it in a query string —
 *      putting a single-use credential into browser history, the address bar and
 *      every access log between here and there. Returned state keeps it in the
 *      response body.
 *   2. THE HANG. The first version awaited resetPasswordForEmail with no
 *      timeout. With SMTP unconfigured that call blocked, the action never
 *      returned, and useFormStatus sat on "Creating…" forever — so an admin
 *      re-clicks and creates duplicates. That is the bug this shape fixes.
 *
 * The trade-off is real: useFormState needs JavaScript, so this form alone does
 * not work with JS off, unlike the approvals buttons. Accepted deliberately —
 * a copy-me-this-link affordance is useless without JS anyway.
 */

/** Never let a third-party network call hang the action. */
async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | "timeout"> {
  let t: ReturnType<typeof setTimeout>;
  const timer = new Promise<"timeout">((res) => {
    t = setTimeout(() => res("timeout"), ms);
  });
  return Promise.race([p.finally(() => clearTimeout(t)), timer]);
}

/**
 * Build the setup link for an address that already has an account.
 *
 * 🔴 generateLink DOES NOT SEND ANYTHING. It asks GoTrue to mint the token and
 * hands back the pieces, so it works with no SMTP configured at all — which is
 * why it is the backbone of both the create flow's fallback and the resume path
 * for an account whose email failed. The token is single-use and expires on the
 * project's recovery-token TTL.
 *
 * =============================================================================
 * 🔴 IT RETURNS `token_hash` POINTED AT OUR OWN CALLBACK, **NOT**
 * `properties.action_link`. RETURNING action_link BURNED EVERY LINK ON FIRST
 * USE, AND THE REASON IS NOT OBVIOUS.
 *
 * `action_link` points at GoTrue: `…/auth/v1/verify?token=…&redirect_to=…`.
 * Following it works — the token is accepted, exactly once, and a login is
 * recorded. But because `generateLink` creates no PKCE flow state (no browser
 * started this flow), GoTrue answers in the IMPLICIT shape and puts the whole
 * session in the URL FRAGMENT:
 *
 *     303 -> /en/auth/callback?next=reset#access_token=…&refresh_token=…
 *
 * A fragment never reaches a server. The callback saw a query containing only
 * `next`, no `code`, and reported "invalid or already used" — on a token that
 * had just been accepted. The admin would then request another link and burn
 * that one the same way, which is why it looked like the links were being
 * consumed before they were opened.
 *
 * Handing out `token_hash` instead keeps the exchange server-side, in the route
 * handler, which is the only place that can persist the resulting cookies. It
 * also drops a config dependency: the browser no longer passes through GoTrue's
 * `redirect_to`, so this link does not need the origin in the project's
 * Auth -> URL Configuration -> Redirect URLs allowlist.
 *
 * 🟡 `redirectTo` IS STILL PASSED. It is unused by the link we build, but it is
 * what GoTrue stamps into `{{ .ConfirmationURL }}` if SMTP is ever switched on
 * and the templated email goes out instead. Leaving it correct costs nothing;
 * removing it would leave a broken link in a code path nobody is testing yet.
 * =============================================================================
 */
async function buildSetupLink(
  service: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string,
  locale: string,
): Promise<string | null> {
  const { data, error } = await service.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${siteOrigin()}/${locale}/auth/callback?next=reset` },
  });

  const hashedToken = data?.properties?.hashed_token;
  if (error || !hashedToken) {
    console.log("[admin] generateLink failed", { code: error?.status });
    return null;
  }

  const url = new URL(`${siteOrigin()}/${locale}/auth/callback`);
  url.searchParams.set("token_hash", hashedToken);
  url.searchParams.set("type", "recovery");
  url.searchParams.set("next", "reset");
  return url.toString();
}

export async function inviteAgentAccount(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();

  const admin = await requireAdmin();
  if (!admin) return { status: "error", code: "forbidden" };

  if (!fullName || fullName.length > 100) return { status: "error", code: "name" };
  if (!EMAIL_FORMAT_RE.test(email)) return { status: "error", code: "email" };

  /* ===========================================================================
     🔴 THE COMPANY-DOMAIN CHECK THAT STOOD HERE WAS REMOVED ON 2026-08-14, ON
     INSTRUCTION. ANY valid address may now be given an account.

     What was here: `isCompanyDomainEmail(email)` plus a near-miss helper that
     told the admin "did you mean @fflsynergy.com?" when they had typed
     `…@fllsynergy.com`. Both are deleted, along with the trigger that backed
     them (0009_remove_domain_restriction.sql).

     🔴 THE COST, STATED BECAUSE IT IS REAL: a mistyped address is no longer
     caught. It used to be refused twice — here with a readable message, and at
     INSERT by the database whatever path created it. Now a typo produces a real
     account at an address nobody owns, the setup link goes to that address, and
     nothing anywhere reports a problem. The remaining mitigation is the admin
     reading the address back before submitting, and the account being useless
     until someone confirms the inbox.

     Format is still checked (one `@`, a dotted domain, no whitespace) so the
     Admin API is not called with something that is not an address at all.
     =========================================================================== */

  const service = createAdminClient();
  if (!service) return { status: "error", code: "unconfigured" };

  // 1. Mint the auth user. handle_new_user provisions the profile at 'pending'.
  //    email_confirm: true is load-bearing — see step 2's note.
  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? "";
    console.log("[admin] account create rejected", { code: createErr?.status });
    if (/already|exists|registered|duplicate/i.test(msg)) return { status: "error", code: "duplicate" };
    /* 🔴 A `/fflsynergy|denied|domain/` BRANCH SAT HERE AND WENT WITH THE
       TRIGGER (0009). Its job was to turn the domain trigger's raised exception
       back into a readable message. That exception can no longer occur, and a
       surviving branch matching on the word "domain" would only ever fire on
       some UNRELATED failure whose message happened to contain it — reporting a
       wrong-domain problem that does not exist. Unmatched failures now fall
       through to `write_failed`, which is the honest answer. */
    return { status: "error", code: "write_failed", detail: msg };
  }

  // 2. Phone the trigger cannot know, and pending -> active. That promotion IS
  //    the invitation. Service-role write, so enforce_profile_transition sees
  //    auth.uid() = null and its no-self-approval guard does not fire.
  const { error: profileErr } = await service
    .from("profiles")
    .update({ phone: phone || null, full_name: fullName, status: "active" })
    .eq("id", created.user.id);

  if (profileErr) {
    await service.auth.admin.deleteUser(created.user.id).catch(() => {});
    console.log("[admin] profile write rejected, account rolled back", { code: profileErr.code });
    return { status: "error", code: "write_failed" };
  }

  await logActivity(admin.user.id, "account_created", email, { method: "setup_link" });

  revalidatePath(`/${locale}/admin`);

  // 3. Mint the link FIRST, unconditionally. If delivery then fails or stalls we
  //    already hold the thing the admin needs, and the account is never left
  //    unreachable because a mail server was down.
  const link = await buildSetupLink(service, email, locale);

  // 4. Attempt delivery, but never wait on it indefinitely.
  const sent = await withTimeout(
    createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${siteOrigin()}/${locale}/auth/callback?next=reset`,
    }),
    8000,
  );

  if (sent === "timeout") {
    console.log("[admin] setup mail timed out after 8s — SMTP likely unconfigured");
    return link
      ? { status: "manual", email, link }
      : { status: "error", code: "mail" };
  }
  if (sent.error) {
    console.log("[admin] setup mail failed", { code: sent.error.status });
    return link
      ? { status: "manual", email, link }
      : { status: "error", code: "mail" };
  }

  return { status: "sent", email };
}

/**
 * CREATE AN AGENT ACCOUNT WITH A PASSWORD THE ADMIN TYPES.
 *
 * =============================================================================
 * 🔴 THIS IS THE SECOND CREATION PATH, NOT A REPLACEMENT FOR THE FIRST.
 *
 * `inviteAgentAccount` above emails a setup link and lets the person choose
 * their own password — which is better security hygiene, because at no point
 * does a second human know their credential. It needs working SMTP, or the
 * admin has to hand-deliver a link.
 *
 * This one exists because that is not always the situation. Aiman sits with a
 * new agent, types an address and a password, and tells them what it is. It is
 * the flow he asked for, and there is nothing wrong with it as long as the
 * trade-off is stated rather than hidden:
 *
 *   · the admin knows the agent's initial password;
 *   · so does anyone standing behind either of them, or reading the message it
 *     is sent in.
 *
 * The mitigation is the same one every temporary credential gets: the agent
 * changes it. `/reset-password` already exists and is linked from the login
 * screen. The README says so in the sentence next to this flow.
 *
 * 🔴 THE PASSWORD IS NEVER LOGGED, NEVER RETURNED, AND NEVER PUT IN A URL. The
 * activity log records `account_created` with the ADDRESS. The action returns
 * `{ status: "created", email }` and nothing else — the admin typed the password
 * and does not need it echoed, and echoing it would put it in a response body
 * that could be cached, screenshotted or shoulder-read.
 *
 * THE CONTROLS, THE SAME ONES THE INVITE PATH HAS:
 *   1. requireAdmin() FIRST, before the service client is constructed.
 *   2. 🔴 THE DOMAIN TRIGGER IS GONE (2026-08-14, 0009). Any valid address may
 *      be given an account, and nothing checks which. Note that this path has no
 *      inbox-confirmation step at all — the admin sets the password directly —
 *      so an address typed here is never proven to belong to anyone.
 *   3. handle_new_user hard-codes role='agent'; enforce_profile_transition
 *      makes it immutable afterwards.
 *   4. email_confirm: true — load-bearing, not convenience. See the invite
 *      path's note: an unconfirmed account lands on 'unverified' and is swept by
 *      purge_unverified_accounts within 24 hours.
 * =============================================================================
 */

/** The floor for an admin-chosen password. Supabase's project default minimum
 *  is 6; this is deliberately higher because this password is transmitted
 *  person-to-person and will live longer than it should. */
const MIN_PASSWORD = 10;

export async function createAgentWithPassword(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  const admin = await requireAdmin();
  if (!admin) return { status: "error", code: "forbidden" };

  if (!fullName || fullName.length > 100) return { status: "error", code: "name" };
  if (!EMAIL_FORMAT_RE.test(email)) return { status: "error", code: "email" };
  if (password.length < MIN_PASSWORD) return { status: "error", code: "passwordShort" };
  // 🔴 CONFIRMED, BECAUSE NOBODY CAN RECOVER FROM A TYPO HERE. The agent is
  // about to be told a password that does not work, and the failure surfaces as
  // "invalid login" — indistinguishable from a wrong address or a rejected
  // account. Cheap check, expensive omission.
  if (password !== confirm) return { status: "error", code: "passwordMismatch" };

  /* 🔴 NO DOMAIN CHECK — removed 2026-08-14 with the rest of the company-domain
     rule. Any valid address may be given an account. The typo exposure is worse
     on THIS path than on the invite path: there is no setup email whose
     non-arrival would hint that the address is wrong, so a mistyped address
     produces an account the admin then reads a password out for, to nobody. See
     the invite path above for the full note. */

  const service = createAdminClient();
  if (!service) return { status: "error", code: "unconfigured" };

  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created?.user) {
    const msg = createErr?.message ?? "";
    // 🔴 THE MESSAGE IS INSPECTED BUT NEVER RETURNED WHOLESALE ON THIS PATH.
    // GoTrue echoes the submitted payload in some failure shapes, and this
    // request has a password in it.
    console.log("[admin] password-mode create rejected", { code: createErr?.status });
    if (/already|exists|registered|duplicate/i.test(msg)) return { status: "error", code: "duplicate" };
    /* 🔴 A `/fflsynergy|denied|domain/` BRANCH SAT HERE AND WENT WITH THE
       TRIGGER (0009). Its job was to turn the domain trigger's raised exception
       back into a readable message. That exception can no longer occur, and a
       surviving branch matching on the word "domain" would only ever fire on
       some UNRELATED failure whose message happened to contain it — reporting a
       wrong-domain problem that does not exist. Unmatched failures now fall
       through to `write_failed`, which is the honest answer. */
    if (/password/i.test(msg)) return { status: "error", code: "passwordShort" };
    return { status: "error", code: "write_failed" };
  }

  // Phone the trigger cannot know, and pending -> active. Service-role write, so
  // enforce_profile_transition sees auth.uid() = null and its no-self-approval
  // guard does not fire.
  const { error: profileErr } = await service
    .from("profiles")
    .update({ phone: phone || null, full_name: fullName, status: "active" })
    .eq("id", created.user.id);

  if (profileErr) {
    await service.auth.admin.deleteUser(created.user.id).catch(() => {});
    console.log("[admin] profile write rejected, account rolled back", { code: profileErr.code });
    return { status: "error", code: "write_failed" };
  }

  /* Attributed to the ADMIN who created it, not to the new account: this is a
     record of an administrative act. `target` is the address that was created. */
  await logActivity(admin.user.id, "account_created", email, { method: "password" });

  revalidatePath(`/${locale}/admin`);
  return { status: "created", email };
}

/**
 * RESUME an account that exists but never received its link — and the general
 * "get me the link" button. Creates nothing; only mints a fresh token for an
 * address that already has a user.
 */
export async function setupLinkForExisting(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const locale = String(formData.get("locale") ?? "en") === "es" ? "es" : "en";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  const admin = await requireAdmin();
  if (!admin) return { status: "error", code: "forbidden" };
  if (!EMAIL_FORMAT_RE.test(email)) return { status: "error", code: "email" };

  /* 🔴 NO DOMAIN CHECK — removed 2026-08-14. This path only ever mints a fresh
     link for an address that ALREADY has an account, so a wrong domain now
     surfaces as the truthful `nouser` ("no account exists for that address")
     rather than as the friendlier near-miss message it used to get. That is a
     small loss of helpfulness and no loss of correctness. */

  const service = createAdminClient();
  if (!service) return { status: "error", code: "unconfigured" };

  const link = await buildSetupLink(service, email, locale);
  if (!link) return { status: "error", code: "nouser" };

  // Always "manual": this button exists precisely because mail is not arriving.
  return { status: "manual", email, link };
}
