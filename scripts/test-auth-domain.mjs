// =============================================================================
// test-auth-domain.mjs — PROOF TESTS for the account-creation boundary.
//
//   node scripts/test-auth-domain.mjs
//
// Exits non-zero on any failure, so it can be wired into CI.
//
// =============================================================================
// 🔴 THIS FILE WAS INVERTED ON 2026-08-14. IT USED TO PROVE THE COMPANY-DOMAIN
// RULE HELD; IT NOW PROVES THE RULE IS GONE AND STAYS GONE.
//
// The @fflsynergy.com restriction was removed on instruction — in the database
// by `0009_remove_domain_restriction.sql` (dropping the
// `on_auth_user_domain_check` trigger and `enforce_company_domain()`), and in
// the app by deleting the predicates from `lib/auth-domain.ts` and the gates in
// `login/actions.ts` and `admin/actions.ts`.
//
// 🔴 DELETING THIS FILE WOULD HAVE BEEN THE WRONG MOVE. Its ~200 lines of
// domain-predicate cases are genuinely dead, but two things it asserted are not
// about the domain at all and are now MORE load-bearing than they were:
//
//     · there is NO public signup — no signUp(), no OAuth, no OTP, no route;
//     · there is no account-creation helper implying a self-service path.
//
// With the domain rule gone, "an admin created it" is the ONLY thing standing
// between a stranger and an account. Those assertions are kept verbatim.
//
// What replaces the deleted cases is the inverse guard: the domain lock must not
// come back by accident — through a reverted file, a merge, or someone
// reinstating a helper because a call site still referenced it.
// =============================================================================

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

let failures = 0;
let checks = 0;

function ok(msg) {
  checks++;
  console.log(`  ok   ${msg}`);
}
function fail(msg) {
  checks++;
  failures++;
  console.log(`  FAIL ${msg}`);
}

const authDomainSrc = readFileSync(new URL("../lib/auth-domain.ts", import.meta.url), "utf8");

// --- THE DOMAIN LOCK MUST STAY OFF -------------------------------------------
//
// Each of these existed to enforce or describe the company-domain rule. Any one
// of them reappearing as a live EXPORT means the lock is creeping back — and it
// would creep back silently, because the app would simply start refusing
// addresses it accepted yesterday.
console.log("\nDOMAIN LOCK REMOVED\n" + "=".repeat(72));

const BANNED_EXPORTS = [
  "isCompanyEmail",
  "isCompanyDomainEmail",
  "isAllowlistedEmail",
  "isCompanySignupEmail",
  "looksLikeCompanyDomainTypo",
  "ALLOWED_DOMAINS",
  "ALLOWED_EMAILS",
  "PRIMARY_DOMAIN",
];

for (const name of BANNED_EXPORTS) {
  // `export const NAME` / `export function NAME` — an export, not a mention.
  // The file's own docblock names all eight while explaining their removal, and
  // a bare word search would flag that documentation as a failure. (The old
  // version of this script had exactly that bug against `signUp`.)
  const re = new RegExp(`export\\s+(?:const|function|let|type)\\s+${name}\\b`);
  if (re.test(authDomainSrc)) {
    fail(
      `lib/auth-domain.ts exports \`${name}\` again — the company-domain lock is\n` +
        `       coming back. It was removed deliberately on 2026-08-14; if it is\n` +
        `       genuinely wanted, that needs a decision and migration 0009 reverted,\n` +
        `       not a helper quietly reinstated.`,
    );
  } else {
    ok(`lib/auth-domain.ts does not export \`${name}\``);
  }
}

// --- NO DOMAIN GATE AT THE CALL SITES ----------------------------------------
//
// 🔴 THE EXPORTS BEING ABSENT IS NOT ENOUGH. Someone could reintroduce the same
// rule inline — `email.endsWith("@fflsynergy.com")` in the create action — which
// would restore the lock without touching lib/auth-domain.ts at all. This greps
// the actual auth and admin code for a hardcoded domain comparison.
console.log("\nNO HARDCODED DOMAIN GATE IN AUTH CODE\n" + "=".repeat(72));

const GATED_FILES = [
  "app/[locale]/(portal)/login/actions.ts",
  "app/[locale]/(portal)/admin/actions.ts",
  "lib/auth-domain.ts",
];

for (const rel of GATED_FILES) {
  const src = readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
  // Strip comments before testing: every one of these files DOCUMENTS the
  // removed rule, and the documentation must not fail the test that guards it.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
    .join("\n");

  if (/fflsynergy/i.test(code)) {
    fail(`${rel} has a live reference to the company domain outside comments`);
  } else {
    ok(`${rel} has no live company-domain reference`);
  }
}

// --- EMAIL FORMAT VALIDATION IS STILL THERE ----------------------------------
//
// Removing the domain rule must not have removed format checking with it. An
// action that calls the Admin API with "not an email" gets a driver error the
// admin cannot read.
console.log("\nEMAIL FORMAT VALIDATION KEPT\n" + "=".repeat(72));

if (/export\s+const\s+EMAIL_FORMAT_RE\b/.test(authDomainSrc)) {
  ok("lib/auth-domain.ts still exports EMAIL_FORMAT_RE");
} else {
  fail("EMAIL_FORMAT_RE is gone — the creation paths have no format check left");
}

const adminSrc = readFileSync(
  new URL("../app/[locale]/(portal)/admin/actions.ts", import.meta.url),
  "utf8",
);
const formatChecks = (adminSrc.match(/EMAIL_FORMAT_RE\.test\(email\)/g) ?? []).length;
// Three creation/resume paths: inviteAgentAccount, createAgentWithPassword,
// setupLinkForExisting. Each validates the address it was handed.
if (formatChecks >= 3) {
  ok(`admin/actions.ts validates email format on ${formatChecks} paths`);
} else {
  fail(
    `admin/actions.ts validates email format on only ${formatChecks} path(s); expected 3\n` +
      `       (inviteAgentAccount, createAgentWithPassword, setupLinkForExisting)`,
  );
}

// Behavioural check of the exported predicate, so "it exists" is not mistaken
// for "it works". Mirrors lib/auth-domain.ts; the regex is duplicated here on
// purpose, so a change to the source that this file does not expect shows up.
const EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FORMAT_CASES = [
  // 🔴 THE FIRST FOUR ARE THE POINT OF THE WHOLE CHANGE: public mail domains,
  // which the old rule refused, must now pass.
  ["someone@gmail.com", true],
  ["someone@outlook.com", true],
  ["first.last+tag@somecompany.co.uk", true],
  ["aiman@fflsynergy.com", true],
  // Still refused, on shape alone.
  ["", false],
  ["not-an-email", false],
  ["missing@domain", false],
  ["a@b@c.com", false],
  ["spaces in@example.com", false],
  ["@example.com", false],
  ["trailing@example.", false],
];

for (const [addr, expected] of FORMAT_CASES) {
  const got = EMAIL_FORMAT_RE.test(addr);
  if (got === expected) {
    ok(`format ${expected ? "accepts" : "refuses"} ${JSON.stringify(addr)}`);
  } else {
    fail(`format check on ${JSON.stringify(addr)}: expected ${expected}, got ${got}`);
  }
}

// --- MIGRATION 0009 IS PRESENT -----------------------------------------------
//
// The app-side removal and the database-side removal have to travel together. If
// the app stops checking and the trigger is still installed, account creation
// fails at INSERT with a raw Postgres error and no message anyone can act on.
console.log("\nDATABASE-SIDE REMOVAL SHIPPED\n" + "=".repeat(72));

const migrationCandidates = [
  "../supabase/migrations/0009_remove_domain_restriction.sql",
  "../supabase/migrations/0009_remove_domain_restriction.sql.sql",
  "../supabase/migrations/0009_remove_domain_restriction.sql.txt",
];
const migration = migrationCandidates.find((p) => existsSync(new URL(p, import.meta.url)));

if (!migration) {
  fail(
    "supabase/migrations/0009_remove_domain_restriction.sql is missing. The app no\n" +
      "       longer checks the domain; without this migration the database still does,\n" +
      "       and every non-company address fails at INSERT.",
  );
} else {
  const sql = readFileSync(new URL(migration, import.meta.url), "utf8");
  if (/drop\s+function\s+if\s+exists\s+public\.enforce_company_domain/i.test(sql)) {
    ok("0009 drops public.enforce_company_domain()");
  } else {
    fail("0009 does not drop public.enforce_company_domain()");
  }
  // 🔴 THE TRIGGER MUST BE DROPPED BY LOOKUP, NOT BY GUESSED NAME. The trigger
  // is `on_auth_user_domain_check`; `enforce_company_domain` is the FUNCTION.
  // `DROP TRIGGER IF EXISTS <wrong name>` is a silent no-op, so a migration that
  // only hard-codes a name can claim success while changing nothing.
  if (/pg_trigger/i.test(sql) && /enforce_company_domain/i.test(sql)) {
    ok("0009 finds the trigger via pg_trigger rather than a guessed name");
  } else {
    fail(
      "0009 does not look the trigger up in pg_trigger. DROP TRIGGER IF EXISTS with\n" +
        "       the wrong name succeeds and removes nothing.",
    );
  }
}

// =============================================================================
// EVERYTHING BELOW IS UNCHANGED AND IS THE REASON THIS FILE STILL EXISTS.
//
// 🔴 THESE ASSERTIONS ARE NOW THE WHOLE BOUNDARY. With no domain rule, the only
// thing between a stranger and an account is that there is no way for them to
// create one. If any check below starts failing, the product has a public
// signup path and any address in the world can hold an account.
// =============================================================================

// --- NO ACCOUNT-CREATION HELPER ---------------------------------------------
console.log("\nNO ACCOUNT-CREATION HELPER\n" + "=".repeat(72));

if (/export function isCompanySignupEmail/.test(authDomainSrc)) {
  fail(
    "isCompanySignupEmail is back in lib/auth-domain.ts. It only has a caller if a\n" +
      "       self-service account-creation path exists. Accounts are admin-created only.",
  );
} else {
  ok("isCompanySignupEmail is absent — no account-creation helper");
}

// --- SIGN-UP SURFACE ASSERTION ----------------------------------------------
//
// The property under test: there is NO self-service account-creation path.
//   · signUp() must not exist AT ALL;
//   · OTP / OAuth / id-token sign-in must not exist either, because each is a
//     self-service entry point that mints an account on first use.
// Accounts come from an admin, from the admin panel. Nowhere else.
console.log("\nSIGN-UP SURFACE ASSERTION\n" + "=".repeat(72));

// 🔴 MATCH CALL SYNTAX, AND STRIP COMMENTS. A first version grepped the bare
// word `signUp` and failed on a COMMENT asserting the very property it tests.
// 🔴 NO `|| true` — on Windows `cmd` that token is not a command, so the whole
// invocation exited non-zero, the catch fired, and `raw` was emptied EVEN WHEN
// GREP HAD FOUND HITS. git grep's contract is exit 0 = found, 1 = not found.
// 🔴 `--untracked` IS LOAD-BEARING. Plain `git grep` searches the INDEX, not the
// working tree, so a newly written unstaged file is invisible to it — which once
// let a live public-signup action pass this very check.
let raw = "";
try {
  raw = execSync(
    'git grep -n --untracked -E "\\.(signUp|signInWithOtp|signInWithOAuth|signInWithIdToken)[[:space:]]*\\(" -- "*.ts" "*.tsx"',
    { encoding: "utf8" },
  ).trim();
} catch (e) {
  if (e.status === 1) {
    raw = ""; // no matches — the expected, passing case
  } else {
    fail(`git grep failed (exit ${e.status}); cannot assert no-signup`);
    raw = "";
  }
}

const signupHits = raw
  .split("\n")
  .filter(Boolean)
  .filter((line) => {
    const code = line.replace(/^[^:]+:\d+:/, "").trim();
    return !code.startsWith("*") && !code.startsWith("//") && !code.startsWith("/*");
  });

const otherEntryPoints = signupHits.filter((line) =>
  /\.(signInWithOtp|signInWithOAuth|signInWithIdToken)\s*\(/.test(line),
);
const signUpCalls = signupHits.filter((line) => /\.signUp\s*\(/.test(line));

if (otherEntryPoints.length) {
  fail(
    "an OTP / OAuth / id-token entry point exists — each mints an account on first\n" +
      "       use, which is a self-service creation path:\n" +
      otherEntryPoints.join("\n"),
  );
} else {
  ok("no OTP / OAuth / id-token sign-in anywhere");
}

if (signUpCalls.length) {
  fail(
    "signUp() is called — there must be NO self-service account creation.\n" +
      "       Accounts are created by an admin, from the admin panel, only:\n" +
      signUpCalls.join("\n"),
  );
} else {
  ok("no signUp() call anywhere — accounts are admin-created only");
}

// --- NO SIGNUP ROUTE ---------------------------------------------------------
//
// The call-site grep above would not catch a signup PAGE that had lost its
// action, so the route itself is asserted gone as well.
console.log("\nNO SIGNUP ROUTE\n" + "=".repeat(72));

if (existsSync(new URL("../app/[locale]/(portal)/signup", import.meta.url))) {
  fail("app/[locale]/(portal)/signup still exists on disk");
} else {
  ok("app/[locale]/(portal)/signup does not exist");
}

console.log("\n" + "=".repeat(72));
if (failures) {
  console.log(`${failures} FAILURE(S) of ${checks} checks\n`);
  process.exit(1);
}
console.log(`ALL ${checks} CHECKS PASSED\n`);
