/**
 * =============================================================================
 * DB-LEVEL PROOF FOR 0005 — REAL JWTs AGAINST PostgREST, NOT THE UI.
 *
 * 🔴 A UI-ONLY PASS PROVES NOTHING ABOUT RLS. Hiding a table behind a route
 * guard and denying it in a policy look identical from a browser; they are not
 * remotely the same thing. Everything here creates a genuine Supabase user,
 * signs in as them to get a genuine access token, and points that token
 * straight at `/rest/v1/...`, which is exactly what an attacker with a valid
 * pending account would do.
 *
 * WHAT IT NEEDS
 *   .env.local with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   and SUPABASE_SECRET_KEY (or the legacy SUPABASE_SERVICE_ROLE_KEY).
 *   Run:  node scripts/test-rls-accounts.mjs
 *
 * 🔴 IT WRITES TO THE LIVE PROJECT AND CLEANS UP AFTER ITSELF.
 * Every account it creates is prefixed `zz-rlstest-` and is deleted in a
 * `finally` block that runs even when an assertion throws. Nothing it touches
 * is a real account, and it never modifies one: the only pre-existing row it
 * reads is the admin's, and it only reads.
 * =============================================================================
 */
import { readFileSync, readdirSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SECRET = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !ANON || !SECRET) {
  console.error("Missing Supabase env. Need URL, publishable key and secret key.");
  process.exit(2);
}

const DOMAIN = "fflsynergy.com";
const TAG = `zz-rlstest-${Date.now().toString(36)}`;
const PASSWORD = "Test-Password-0005-xyz";

let pass = 0;
let fail = 0;
const failures = [];

function ok(group, name) {
  pass++;
  console.log(`  ok    ${name}`);
}
function bad(group, name, detail) {
  fail++;
  failures.push(`[${group}] ${name} — ${detail}`);
  console.log(`  FAIL  ${name}\n          ${detail}`);
}
function check(group, name, condition, detail) {
  if (condition) ok(group, name);
  else bad(group, name, detail);
}
function group(title) {
  console.log(`\n${title}\n${"=".repeat(74)}`);
}

async function api(base, path, { key = ANON, jwt = null, method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${jwt ?? key}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${URL_}/${base}/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON */
  }
  return { status: res.status, ok: res.ok, json, text };
}
const rest = (p, o) => api("rest/v1", p, o);
const auth = (p, o) => api("auth/v1", p, o);

/** Create a confirmed/unconfirmed user via the Admin API. Returns id or null. */
async function createUser(local, { confirm = true, meta = {} } = {}) {
  const email = `${TAG}-${local}@${DOMAIN}`;
  const r = await auth("admin/users", {
    key: SECRET,
    method: "POST",
    body: { email, password: PASSWORD, email_confirm: confirm, user_metadata: meta },
  });
  return { email, id: r.json?.id ?? null, status: r.status, body: r.json };
}

/** Sign in with the PUBLISHABLE key, exactly as a browser does. */
async function signIn(email) {
  const r = await auth("token?grant_type=password", {
    key: ANON,
    method: "POST",
    body: { email, password: PASSWORD },
  });
  return r.json?.access_token ?? null;
}

/** Force a profile status using the service key (bypasses RLS, not triggers). */
async function forceStatus(id, status) {
  return rest(`profiles?id=eq.${id}`, {
    key: SECRET,
    method: "PATCH",
    body: { status },
    prefer: "return=representation",
  });
}

const created = [];

async function main() {
  console.log(`0005 RLS PROOF — project ${URL_}`);
  console.log(`test accounts tagged ${TAG}`);

  // ---------------------------------------------------------------------------
  group("0 · PRECONDITIONS — is the migration applied?");

  const enumProbe = await rest("rpc/current_account_status", { key: SECRET, method: "POST", body: {} });
  const adminProbe = await rest("rpc/is_active_admin", { key: SECRET, method: "POST", body: {} });
  const colProbe = await rest("profiles?select=status,email,approved_at&limit=1", { key: SECRET });

  const migrated =
    enumProbe.status !== 404 && adminProbe.status !== 404 && colProbe.status === 200;

  check("pre", "current_account_status() exists", enumProbe.status !== 404, `status ${enumProbe.status}`);
  check("pre", "is_active_admin() exists", adminProbe.status !== 404, `status ${adminProbe.status}`);
  check("pre", "profiles.status / email / approved_at exist", colProbe.status === 200,
    colProbe.json?.message ?? `status ${colProbe.status}`);

  if (!migrated) {
    console.log(
      "\n🔴 MIGRATION NOT APPLIED. supabase/migrations/0005_agent_signup.sql must be\n" +
        "   run in the SQL editor before the remaining groups can mean anything.\n" +
        "   Stopping here rather than reporting green on tests that never ran.",
    );
    return;
  }

  // ---------------------------------------------------------------------------
  group("1 · BACKFILL REGRESSION — no admin may be left locked out");

  const admins = await rest("profiles?select=id,email,role,status", { key: SECRET });
  const adminRows = (admins.json ?? []).filter((r) => r.role === "admin");
  const lockedOut = adminRows.filter((r) => r.status !== "active");
  check("backfill", `every admin is active (${adminRows.length} admin row(s))`,
    adminRows.length > 0 && lockedOut.length === 0,
    lockedOut.length ? `locked out: ${lockedOut.map((r) => r.email).join(", ")}` : "no admin rows at all");
  for (const a of adminRows) console.log(`          admin: ${a.email} status=${a.status}`);

  // ---------------------------------------------------------------------------
  group("2 · SIGN-UP DOMAIN — the DB trigger, independent of app code");

  for (const [addr, why] of [
    ["attacker@gmail.com", "public mail domain"],
    ["evil@mail.fflsynergy.com", "subdomain is not the domain"],
    ["evil@fflsynergy.com.evil.com", "suffix attack"],
    ["mohamed204430@gmail.com", "allowlisted for SIGN-IN, must not be creatable"],
  ]) {
    const r = await auth("admin/users", {
      key: SECRET,
      method: "POST",
      body: { email: addr, password: PASSWORD, email_confirm: true },
    });
    // The 0004 trigger raises, which surfaces as a non-2xx from the Admin API.
    check("domain", `create "${addr}" is refused (${why})`, !r.ok,
      `got ${r.status} ${JSON.stringify(r.json)?.slice(0, 120)}`);
    if (r.ok && r.json?.id) created.push(r.json.id);
  }

  // ---------------------------------------------------------------------------
  group("3 · ROLE CANNOT BE SELF-ASSIGNED AT SIGN-UP");

  const evil = await createUser("evilmeta", {
    confirm: true,
    meta: { role: "admin", status: "active", full_name: "Meta Attacker" },
  });
  if (evil.id) created.push(evil.id);
  const evilProfile = await rest(`profiles?id=eq.${evil.id}&select=role,status,full_name`, { key: SECRET });
  const ep = evilProfile.json?.[0];
  check("role", 'signup metadata {"role":"admin"} lands as role=agent', ep?.role === "agent",
    `got role=${ep?.role}`);
  check("role", "metadata cannot preset status either", ep?.status === "pending",
    `got status=${ep?.status} (email_confirm:true means the case-branch should give pending)`);
  check("role", "benign full_name IS honoured", ep?.full_name === "Meta Attacker",
    `got ${JSON.stringify(ep?.full_name)}`);

  // ---------------------------------------------------------------------------
  group("4 · UNVERIFIED never reaches a counted pending state");

  const unver = await createUser("unverified", { confirm: false });
  if (unver.id) created.push(unver.id);
  const unverRow = await rest(`profiles?id=eq.${unver.id}&select=status`, { key: SECRET });
  check("unverified", "unconfirmed signup lands status=unverified",
    unverRow.json?.[0]?.status === "unverified", `got ${unverRow.json?.[0]?.status}`);

  // Confirm it via the Admin API — same transition the email link causes.
  await auth(`admin/users/${unver.id}`, { key: SECRET, method: "PUT", body: { email_confirm: true } });
  const afterConfirm = await rest(`profiles?id=eq.${unver.id}&select=status`, { key: SECRET });
  check("unverified", "confirming the email flips unverified -> pending",
    afterConfirm.json?.[0]?.status === "pending", `got ${afterConfirm.json?.[0]?.status}`);

  // ---------------------------------------------------------------------------
  group("5 · PENDING JWT — zero rows everywhere, no writes anywhere");

  const pendingUser = await createUser("pending", { confirm: true });
  if (pendingUser.id) created.push(pendingUser.id);
  await forceStatus(pendingUser.id, "pending");
  const pendingJwt = await signIn(pendingUser.email);
  check("pending", "pending account CAN obtain a valid JWT (that is the threat)",
    Boolean(pendingJwt), "sign-in returned no access token");

  if (pendingJwt) {
    for (const table of ["leads", "agents", "applications", "profiles"]) {
      const r = await rest(`${table}?select=*`, { jwt: pendingJwt });
      const rows = Array.isArray(r.json) ? r.json.length : -1;
      check("pending", `GET /${table} returns 0 rows`, r.status === 200 && rows === 0,
        `status ${r.status}, rows ${rows}`);
    }

    // Own row specifically — the case a naive policy would leave open.
    const own = await rest(`profiles?id=eq.${pendingUser.id}&select=*`, { jwt: pendingJwt });
    check("pending", "GET own profile row returns 0 rows",
      own.status === 200 && Array.isArray(own.json) && own.json.length === 0,
      `status ${own.status}, rows ${Array.isArray(own.json) ? own.json.length : "?"}`);

    // Self-approval.
    const selfApprove = await rest(`profiles?id=eq.${pendingUser.id}`, {
      jwt: pendingJwt, method: "PATCH", body: { status: "active" }, prefer: "return=representation",
    });
    const stillPending = await rest(`profiles?id=eq.${pendingUser.id}&select=status`, { key: SECRET });
    check("pending", "PATCH own status -> active is denied",
      stillPending.json?.[0]?.status === "pending",
      `status is now ${stillPending.json?.[0]?.status} (HTTP ${selfApprove.status})`);

    // Self-promotion.
    const selfPromote = await rest(`profiles?id=eq.${pendingUser.id}`, {
      jwt: pendingJwt, method: "PATCH", body: { role: "admin" }, prefer: "return=representation",
    });
    const stillAgent = await rest(`profiles?id=eq.${pendingUser.id}&select=role`, { key: SECRET });
    check("pending", "PATCH own role -> admin is denied",
      stillAgent.json?.[0]?.role === "agent",
      `role is now ${stillAgent.json?.[0]?.role} (HTTP ${selfPromote.status})`);

    // Writes to other tables.
    const insertAgent = await rest("agents", {
      jwt: pendingJwt, method: "POST", body: { name: "x", email: "x@fflsynergy.com" },
    });
    check("pending", "INSERT into agents is denied", !insertAgent.ok, `HTTP ${insertAgent.status}`);
  }

  // ---------------------------------------------------------------------------
  group("6 · REJECTED and UNVERIFIED JWTs — same zero access");

  const rejected = await createUser("rejected", { confirm: true });
  if (rejected.id) created.push(rejected.id);
  await forceStatus(rejected.id, "pending");
  await forceStatus(rejected.id, "rejected");
  const rejJwt = await signIn(rejected.email);
  if (rejJwt) {
    for (const table of ["leads", "agents", "applications", "profiles"]) {
      const r = await rest(`${table}?select=*`, { jwt: rejJwt });
      const rows = Array.isArray(r.json) ? r.json.length : -1;
      check("rejected", `rejected: GET /${table} returns 0 rows`, r.status === 200 && rows === 0,
        `status ${r.status}, rows ${rows}`);
    }
  } else {
    bad("rejected", "rejected account sign-in", "no token — cannot test its RLS posture");
  }

  // ---------------------------------------------------------------------------
  group("7 · TRANSITIONS — only the legal ones, and never self-approval");

  const t = await createUser("transitions", { confirm: true });
  if (t.id) created.push(t.id);

  // active -> pending must raise (no going back into a queue state).
  await forceStatus(t.id, "active");
  const backwards = await forceStatus(t.id, "pending");
  check("transition", "active -> pending is refused by the trigger", !backwards.ok,
    `HTTP ${backwards.status} ${JSON.stringify(backwards.json)?.slice(0, 100)}`);

  // role change must raise even for service_role (the trigger is not bypassed).
  const roleChange = await rest(`profiles?id=eq.${t.id}`, {
    key: SECRET, method: "PATCH", body: { role: "admin" }, prefer: "return=representation",
  });
  check("transition", "role change is refused EVEN FOR service_role", !roleChange.ok,
    `HTTP ${roleChange.status} — a leaked secret key must not be able to mint an admin`);

  // The legal approval path.
  await forceStatus(t.id, "rejected");
  const restore = await forceStatus(t.id, "active");
  check("transition", "rejected -> active is allowed (a rejection is reversible)", restore.ok,
    `HTTP ${restore.status}`);

  // ---------------------------------------------------------------------------
  group("8 · AN ACTIVE AGENT IS STILL NOT AN ADMIN");

  const activeAgent = await createUser("activeagent", { confirm: true });
  if (activeAgent.id) created.push(activeAgent.id);
  await forceStatus(activeAgent.id, "active");
  const agentJwt = await signIn(activeAgent.email);

  if (agentJwt) {
    const ownRow = await rest("profiles?select=id,role,status", { jwt: agentJwt });
    check("agent", "active agent sees EXACTLY their own profile row",
      ownRow.status === 200 && Array.isArray(ownRow.json) && ownRow.json.length === 1 &&
        ownRow.json[0].id === activeAgent.id,
      `rows ${Array.isArray(ownRow.json) ? ownRow.json.length : "?"}`);

    for (const table of ["leads", "agents", "applications"]) {
      const r = await rest(`${table}?select=*`, { jwt: agentJwt });
      const rows = Array.isArray(r.json) ? r.json.length : -1;
      check("agent", `active agent: GET /${table} returns 0 rows`, r.status === 200 && rows === 0,
        `status ${r.status}, rows ${rows}`);
    }

    // The headline case: one agent approving another.
    const victim = await createUser("victim", { confirm: true });
    if (victim.id) created.push(victim.id);
    await forceStatus(victim.id, "pending");
    const crossApprove = await rest(`profiles?id=eq.${victim.id}`, {
      jwt: agentJwt, method: "PATCH", body: { status: "active" }, prefer: "return=representation",
    });
    const victimNow = await rest(`profiles?id=eq.${victim.id}&select=status`, { key: SECRET });
    check("agent", "an active agent CANNOT approve another agent",
      victimNow.json?.[0]?.status === "pending",
      `victim is now ${victimNow.json?.[0]?.status} (HTTP ${crossApprove.status})`);
  } else {
    bad("agent", "active agent sign-in", "no token");
  }

  // ---------------------------------------------------------------------------
  group("9 · NO BLANKET POLICIES");

  // pg_policies is not exposed through PostgREST, so the assertion is made
  // against the migration TEXT — the artifact that actually ships and the thing
  // a reviewer would read.
  //
  // 🔴 THE FILE LIST IS GLOBBED, NOT HARDCODED, AND THAT WAS A REAL BUG.
  // This originally opened "0005_agent_signup.sql" by name. The file on disk is
  // `0005_agent_signup.sql.txt` — this project stores several migrations with a
  // `.txt` suffix (0003 and 0004 too) — so the harness threw ENOENT *after*
  // every other group had passed, and the run reported a failure that had
  // nothing to do with the database. A security check that can be defeated by a
  // rename is not a check. It now scans EVERY migration, whatever it is called.
  const migDir = new URL("../supabase/migrations/", import.meta.url);
  const migFiles = readdirSync(migDir).filter((f) => /\.sql(\.txt)?$/i.test(f));
  check("policies", "migration files found to scan", migFiles.length > 0, "none matched");

  const offenders = [];
  for (const f of migFiles) {
    const sql = readFileSync(new URL(f, migDir), "utf8");
    // Strip line comments so prose ABOUT blanket policies is not flagged as one
    // — the same class of false positive test-auth-domain.mjs already hit.
    const code = sql
      .split("\n")
      .filter((l) => !l.trim().startsWith("--") && !l.trim().startsWith("*"))
      .join("\n");
    if (/using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\)/i.test(code)) offenders.push(f);
  }
  check("policies", `no USING(true) / WITH CHECK(true) in any of ${migFiles.length} migrations`,
    offenders.length === 0, `blanket policy in: ${offenders.join(", ")}`);

  // ---------------------------------------------------------------------------
  group("10 · ANON REACHES NOTHING");

  for (const table of ["leads", "agents", "applications", "profiles"]) {
    const r = await rest(`${table}?select=*`, { key: ANON });
    const rows = Array.isArray(r.json) ? r.json.length : -1;
    check("anon", `anon GET /${table} returns 0 rows`, rows === 0,
      `status ${r.status}, rows ${rows}`);
    const w = await rest(table, { key: ANON, method: "POST", body: { name: "x" } });
    check("anon", `anon INSERT into ${table} is denied`, !w.ok, `HTTP ${w.status}`);
  }
}

async function cleanup() {
  if (!created.length) return;
  console.log(`\nCLEANUP — removing ${created.length} test account(s)`);
  let removed = 0;
  for (const id of created) {
    const r = await auth(`admin/users/${id}`, { key: SECRET, method: "DELETE" });
    if (r.ok || r.status === 404) removed++;
  }
  console.log(`  ${removed}/${created.length} deleted`);
  const leftovers = await rest(
    `profiles?select=id,email&email=like.${TAG}*`, { key: SECRET },
  );
  const stray = Array.isArray(leftovers.json) ? leftovers.json.length : 0;
  console.log(stray === 0 ? "  no leftover rows" : `  ⚠️ ${stray} leftover profile row(s)`);
}

try {
  await main();
} catch (e) {
  fail++;
  failures.push(`harness threw: ${e.stack ?? e}`);
  console.log(`\nHARNESS ERROR: ${e.message}`);
} finally {
  await cleanup();
}

console.log("\n" + "=".repeat(74));
console.log(`${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log(`  · ${f}`);
  process.exit(1);
}
console.log("ALL DB-LEVEL CHECKS PASSED\n");
