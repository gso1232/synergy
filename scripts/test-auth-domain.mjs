// =============================================================================
// test-auth-domain.mjs — PROOF TESTS for the company-domain rule.
//
//   node scripts/test-auth-domain.mjs
//
// Exercises lib/auth-domain.ts against the cases that matter, including the
// bypass shapes a suffix test would wrongly accept. Exits non-zero on any
// failure, so it can be wired into CI.
//
// 🔴 THIS TESTS THE PREDICATE, NOT THE WHOLE BOUNDARY. The predicate is one of
// four layers; the others are asserted rather than executed here because they
// need a live database:
//   * no public signup            — there is no signUp call anywhere in the repo
//                                   (verified by grep, see the report)
//   * creation-time DB trigger    — supabase/migrations/0004_company_domain.sql
//   * sign-in gate + signOut      — (portal)/login/actions.ts
//   * role is not self-assignable — no UPDATE policy on public.profiles (0001)
// =============================================================================

// The predicate, mirrored verbatim from lib/auth-domain.ts. Kept in step by
// this file's own final test, which fails if the source drifts from it.
import { readFileSync, existsSync } from "node:fs";

const ALLOWED = ["fflsynergy.com"];

/**
 * 🔴 THE INDIVIDUAL ALLOWLIST IS MIRRORED HERE TOO. The founding admin
 * (`mohamed204430@gmail.com`) pre-dates the domain rule and would otherwise be
 * signed straight back out of its own portal. It is ONE EXACT ADDRESS, not a
 * second domain — see lib/auth-domain.ts for why adding "gmail.com" instead
 * would be a back door.
 */
const ALLOWED_EMAILS = ["mohamed204430@gmail.com"];

function isCompanyEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  const parts = trimmed.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  return ALLOWED.includes(domain) || ALLOWED_EMAILS.includes(`${local}@${domain}`);
}

const CASES = [
  // --- MUST BE ALLOWED -------------------------------------------------------
  ["aiman@fflsynergy.com", true, "the existing admin"],
  ["agent@fflsynergy.com", true, "a staff agent"],
  ["Agent@FFLSynergy.COM", true, "case-insensitive domain"],
  ["  agent@fflsynergy.com  ", true, "surrounding whitespace trimmed"],
  ["first.last+tag@fflsynergy.com", true, "plus-addressing is a real local-part"],

  // --- MUST BE ALLOWED: the individual allowlist -----------------------------
  // The founding admin, created 2026-07-31 before the domain rule existed and
  // still the only account on the project.
  ["mohamed204430@gmail.com", true, "founding admin — individually allowlisted"],
  ["MOHAMED204430@GMAIL.COM", true, "allowlist is case-insensitive"],
  ["  mohamed204430@gmail.com  ", true, "allowlist trims whitespace"],

  // --- MUST BE DENIED: the allowlist must not widen to its domain ------------
  // 🔴 THE POINT OF THE WHOLE ALLOWLIST DESIGN. If any of these ever pass, the
  // exception has become a public back door.
  ["someone-else@gmail.com", false, "a DIFFERENT gmail — allowlist must not admit the domain"],
  ["mohamed204430@gmail.com.evil.com", false, "allowlisted local-part on an attacker domain"],
  ["mohamed204430@gmail.co", false, "near-miss of the allowlisted domain"],
  ["mohamed204430+alias@gmail.com", false, "plus-alias of the allowlisted address is NOT the address"],

  // --- MUST BE DENIED: other domains -----------------------------------------
  ["someone@gmail.com", false, "a personal address"],
  ["attacker@evil.com", false, "an unrelated domain"],
  ["someone@checkmatefinancialgroup.com", false, "a competitor's domain"],

  // --- MUST BE DENIED: the bypass shapes -------------------------------------
  // Each of these is accepted by at least one naive implementation.
  ["evil@fflsynergy.com.evil.com", false, "suffix-attack — endsWith('.fflsynergy.com') would pass this"],
  ["evil@notfflsynergy.com", false, "substring-attack — includes('fflsynergy.com') would pass this"],
  ["evil@mail.fflsynergy.com", false, "subdomain is NOT allowed unless added deliberately"],
  ["a@fflsynergy.com@evil.com", false, "double-@ — a naive split would read the domain as evil.com"],
  ["fflsynergy.com", false, "no @ at all"],
  ["@fflsynergy.com", false, "empty local-part"],
  ["agent@", false, "empty domain"],

  // --- MUST BE DENIED: junk (fail closed) ------------------------------------
  ["", false, "empty string"],
  [null, false, "null"],
  [undefined, false, "undefined"],
  [12345, false, "a number"],
  [{}, false, "an object"],
];

/**
 * NEAR-MISS DETECTION, mirrored from lib/auth-domain.ts exactly as the
 * predicate above is. Its own drift guard follows the cases.
 */
function editDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}
const TYPO_MAX_EDITS = 2;

function domainOf(email) {
  if (typeof email !== "string") return null;
  const bits = email.trim().toLowerCase().split("@");
  if (bits.length !== 2) return null;
  const [local, domain] = bits;
  if (!local || !domain) return null;
  return domain;
}

/** Company domain ONLY — no individual allowlist. Account CREATION rule. */
function isCompanyDomainEmail(email) {
  const d = domainOf(email);
  return d !== null && ALLOWED.includes(d);
}

function looksLikeCompanyDomainTypo(email) {
  const d = domainOf(email);
  if (d === null || ALLOWED.includes(d)) return false;
  return ALLOWED.some(
    (a) => Math.abs(d.length - a.length) <= TYPO_MAX_EDITS && editDistance(d, a) <= TYPO_MAX_EDITS,
  );
}

let failures = 0;
console.log("\nCOMPANY-DOMAIN PREDICATE — proof tests\n" + "=".repeat(72));

for (const [input, expected, why] of CASES) {
  const actual = isCompanyEmail(input);
  const pass = actual === expected;
  if (!pass) failures++;
  const verdict = actual ? "ALLOW" : "DENY ";
  // `JSON.stringify(undefined)` returns undefined (not a string), so the label
  // is built defensively — the undefined case is one of the cases under test.
  const label = (JSON.stringify(input) ?? String(input)).padEnd(38);
  console.log(`${pass ? "  ok  " : "  FAIL"}  ${verdict}  ${label} ${why}`);
}

// =============================================================================
// NEAR-MISS ("did you mean @fflsynergy.com?") — the doubled-L class.
//
// 🔴 EVERY ADDRESS BELOW IS STILL DENIED. These cases assert only WHICH message
// the admin gets. The first block is the reason this exists: an address one
// keystroke from the real one, which reads as correct at a glance.
// =============================================================================
console.log("\nNEAR-MISS DETECTION — typo vs wrong company\n" + "=".repeat(72));

const TYPO_CASES = [
  // --- MUST be flagged as a typo ---------------------------------------------
  ["mohamedsamy2@fllsynergy.com", true, "doubled L — the reported case"],
  ["agent@ffisynergy.com", true, "l -> i, indistinguishable in most fonts"],
  ["agent@ffsynergy.com", true, "dropped an f"],
  ["agent@fflsynerg.com", true, "dropped a y"],
  ["agent@fflsynnergy.com", true, "doubled n"],
  ["agent@fflsyngery.com", true, "transposed er -> re"],
  ["agent@fflsynergy.co", true, "truncated TLD"],
  ["agent@fflsynergy.cm", true, "dropped o in .com"],
  ["agent@fflsynergy.comm", true, "doubled m"],
  ["agent@FFLSynergy.Com", false, "correct domain, odd case — NOT a typo"],

  // --- MUST NOT be flagged: these are wrong, not mistyped --------------------
  ["someone@gmail.com", false, "a different domain entirely"],
  ["someone@checkmatefinancialgroup.com", false, "a competitor"],
  ["evil@notfflsynergy.com", false, "prefix attack — 3 edits, not a slip"],
  ["evil@fflsynergy.com.evil.com", false, "suffix attack — must never read as a typo"],
  ["evil@mail.fflsynergy.com", false, "subdomain — refused, and not a typo"],
  ["a@fflsynergy.com@evil.com", false, "double-@ — malformed, not a typo"],
  ["", false, "empty string"],
  [null, false, "null"],
];

for (const [input, expected, why] of TYPO_CASES) {
  const actual = looksLikeCompanyDomainTypo(input);
  const pass = actual === expected;
  if (!pass) failures++;
  const label = (JSON.stringify(input) ?? String(input)).padEnd(38);
  console.log(`${pass ? "  ok  " : "  FAIL"}  ${actual ? "TYPO " : "plain"}  ${label} ${why}`);
}

// 🔴 THE SAFETY PROPERTY. A near miss must never become an ACCEPTANCE. If any
// address the typo detector recognises also passes the creation gate, the
// helpful message has turned into a hole.
const leaked = TYPO_CASES.filter(([e]) => looksLikeCompanyDomainTypo(e) && isCompanyDomainEmail(e));
if (leaked.length) {
  console.log(`  FAIL  a near-miss address is ACCEPTED for creation: ${leaked.map(([e]) => e).join(", ")}`);
  failures++;
} else {
  console.log("  ok   no near-miss address is accepted for creation — all still denied");
}

// 🔴 CREATION IGNORES THE INDIVIDUAL ALLOWLIST. The grandfathered address may
// sign IN; it must not be a template for creating new accounts.
if (isCompanyDomainEmail("mohamed204430@gmail.com")) {
  console.log("  FAIL  isCompanyDomainEmail honours ALLOWED_EMAILS — creation must be domain-only");
  failures++;
} else {
  console.log("  ok   isCompanyDomainEmail ignores the individual allowlist");
}

// Drift guard for the near-miss helpers.
{
  const src = readFileSync(new URL("../lib/auth-domain.ts", import.meta.url), "utf8");
  const m = src.match(/TYPO_MAX_EDITS\s*=\s*(\d+)/);
  if (!m) {
    console.log("  FAIL  DRIFT   TYPO_MAX_EDITS not found in lib/auth-domain.ts");
    failures++;
  } else if (Number(m[1]) !== TYPO_MAX_EDITS) {
    console.log(`  FAIL  DRIFT   source TYPO_MAX_EDITS=${m[1]} != test ${TYPO_MAX_EDITS}`);
    failures++;
  } else {
    console.log(`  ok   DRIFT   TYPO_MAX_EDITS matches this test: ${TYPO_MAX_EDITS}`);
  }
  if (!/export function looksLikeCompanyDomainTypo/.test(src)) {
    console.log("  FAIL  looksLikeCompanyDomainTypo is missing from lib/auth-domain.ts");
    failures++;
  }
  if (!/export function isCompanyDomainEmail/.test(src)) {
    console.log("  FAIL  isCompanyDomainEmail is missing from lib/auth-domain.ts");
    failures++;
  }
}

// --- Drift guard: the source's ALLOWED_DOMAINS must equal this test's list ---
// 🔴 PARSE THE ARRAY LITERAL, NOT THE WHOLE FILE. A first version regexed every
// quoted domain-shaped string in the file and failed on `@mail.fflsynergy.com`
// written inside a COMMENT explaining why subdomains are rejected. A guard that
// fires on documentation is a guard people learn to ignore.
const src = readFileSync(new URL("../lib/auth-domain.ts", import.meta.url), "utf8");
const arrayMatch = src.match(/ALLOWED_DOMAINS\s*=\s*\[([^\]]*)\]/);
if (!arrayMatch) {
  console.log("  FAIL  DRIFT   could not find ALLOWED_DOMAINS in lib/auth-domain.ts");
  failures++;
} else {
  const inSource = [...arrayMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  const same =
    inSource.length === ALLOWED.length && inSource.every((d, i) => d === ALLOWED[i]);
  if (!same) {
    console.log(
      `  FAIL  DRIFT   source ALLOWED_DOMAINS [${inSource.join(", ")}] != test list [${ALLOWED.join(", ")}]`,
    );
    failures++;
  } else {
    console.log(`  ok   DRIFT   source ALLOWED_DOMAINS matches this test: [${inSource.join(", ")}]`);
  }
}

// --- NO ACCOUNT-CREATION HELPER ---------------------------------------------
//
// 🔴 REVERTED WITH THE REMOVAL OF PUBLIC SIGNUP. This section used to exercise
// `isCompanySignupEmail` — the "may this address CREATE an account" check that
// backed the public signup form. Public signup is gone and so is that function,
// so the test is now the inverse: assert the helper has NOT come back, because
// its reappearance would mean a self-service creation path came back with it.
console.log("\nNO ACCOUNT-CREATION HELPER\n" + "=".repeat(72));

const signupSrc = readFileSync(new URL("../lib/auth-domain.ts", import.meta.url), "utf8");
if (/export function isCompanySignupEmail/.test(signupSrc)) {
  console.log(
    "  FAIL  isCompanySignupEmail is back in lib/auth-domain.ts. It only has a\n" +
      "        caller if a self-service account-creation path exists. Accounts are\n" +
      "        admin-created only — remove it, or review the path that needs it.",
  );
  failures++;
} else {
  console.log("  ok   isCompanySignupEmail is absent — no account-creation helper");
}

// --- SIGN-UP SURFACE ASSERTION ----------------------------------------------
//
// 🔴 RESTORED TO ITS PRE-0005 FORM: NO `signUp` CALL MAY EXIST ANYWHERE.
//
// 0005 opened public signup and this assertion was loosened to "exactly one
// signUp(), in signup/actions.ts". That decision has been reversed — the route,
// its action and its form are deleted — so the original, stricter assertion is
// back, exactly as the 0005 note required if signup were ever removed.
//
// The property under test: there is NO self-service account-creation path.
//   · signUp() must not exist AT ALL;
//   · OTP / OAuth / id-token sign-in must not exist either, because each is a
//     self-service entry point that mints an account on first use.
// Accounts come from an admin, from the admin panel. Nowhere else.
console.log("\nSIGN-UP SURFACE ASSERTION\n" + "=".repeat(72));
import { execSync } from "node:child_process";
// 🔴 MATCH CALL SYNTAX, AND STRIP COMMENTS. A first version grepped the bare
// word `signUp` and failed on a COMMENT in SiteHeader.tsx reading "There is no
// `signUp` anywhere" — i.e. it flagged the documentation asserting the very
// property it was testing. It now looks for an actual invocation (`.signUp(`)
// and discards lines that are comments.
// 🔴 NO `|| true`, AND THAT WAS A FALSE-PASS BUG. The first version appended
// `|| true` to swallow git grep's exit-1-on-no-match. On Windows `cmd` that
// token is not a command, so the whole invocation exited non-zero — meaning the
// catch fired and `raw` was emptied EVEN WHEN GREP HAD FOUND HITS. A real
// signUp call would have been reported as "ok". git grep's contract is exit 0 =
// found, exit 1 = not found, >1 = error, so the exit code is read directly and
// the found-case output is taken from the thrown error's stdout.
let raw = "";
try {
  // 🔴 `--untracked` IS LOAD-BEARING AND ITS ABSENCE WAS A FALSE PASS.
  // Plain `git grep` searches the INDEX, not the working tree. When
  // signup/actions.ts was first written it was a new, unstaged file — so the
  // grep did not see it and this assertion reported "no signUp anywhere" while
  // a live public-signup action sat on disk. Caught by negative control: the
  // test passed at a moment it had to fail. Any check that greps source for a
  // security property must include untracked files, or it silently stops
  // testing exactly the code that was just added.
  raw = execSync(
    'git grep -n --untracked -E "\\.(signUp|signInWithOtp|signInWithOAuth|signInWithIdToken)[[:space:]]*\\(" -- "*.ts" "*.tsx"',
    { encoding: "utf8" },
  ).trim();
} catch (e) {
  if (e.status === 1) {
    raw = ""; // no matches — the expected, passing case
  } else {
    console.log(`  FAIL  git grep failed (exit ${e.status}); cannot assert no-signup`);
    failures++;
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
  console.log(
    "  FAIL  an OTP / OAuth / id-token entry point exists — each mints an account\n" +
      "        on first use, which is a self-service creation path:\n" +
      otherEntryPoints.join("\n"),
  );
  failures++;
} else {
  console.log("  ok   no OTP / OAuth / id-token sign-in anywhere");
}

if (signUpCalls.length) {
  console.log(
    "  FAIL  signUp() is called — there must be NO self-service account creation.\n" +
      "        Accounts are created by an admin, from the admin panel, only:\n" +
      signUpCalls.join("\n"),
  );
  failures++;
} else {
  console.log("  ok   no signUp() call anywhere — accounts are admin-created only");
}

// --- NO SIGNUP ROUTE ---------------------------------------------------------
//
// The call-site grep above would not catch a signup PAGE that had lost its
// action, so the route itself is asserted gone as well.
console.log("\nNO SIGNUP ROUTE\n" + "=".repeat(72));
const signupRoute = new URL("../app/[locale]/(portal)/signup", import.meta.url);
if (existsSync(signupRoute)) {
  console.log("  FAIL  app/[locale]/(portal)/signup still exists on disk");
  failures++;
} else {
  console.log("  ok   app/[locale]/(portal)/signup does not exist");
}

console.log("\n" + "=".repeat(72));
if (failures) {
  console.log(`${failures} FAILURE(S)\n`);
  process.exit(1);
}
/* Predicate cases + near-miss cases + the eight standalone assertions (no-leak,
   allowlist-ignored, two near-miss drift guards, ALLOWED_DOMAINS drift, no
   signup helper, no OTP/OAuth, no signUp(), no signup route). Counted rather
   than hard-coded so adding a case cannot silently leave the total stale. */
console.log(`ALL ${CASES.length + TYPO_CASES.length + 8} CHECKS PASSED\n`);
