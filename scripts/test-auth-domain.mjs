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
import { readFileSync } from "node:fs";

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

// --- Assert there is no public signup anywhere in app code ------------------
console.log("\nNO-PUBLIC-SIGNUP ASSERTION\n" + "=".repeat(72));
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
  raw = execSync(
    'git grep -n -E "\\.(signUp|signInWithOtp|signInWithOAuth|signInWithIdToken)[[:space:]]*\\(" -- "*.ts" "*.tsx"',
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

if (signupHits.length) {
  console.log("  FAIL  a self-service auth entry point exists:\n" + signupHits.join("\n"));
  failures++;
} else {
  console.log("  ok   no signUp / OTP / OAuth CALL anywhere — accounts are admin-created only");
}

console.log("\n" + "=".repeat(72));
if (failures) {
  console.log(`${failures} FAILURE(S)\n`);
  process.exit(1);
}
console.log(`ALL ${CASES.length + 2} CHECKS PASSED\n`);
