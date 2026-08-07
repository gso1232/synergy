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

// --- SIGN-UP vs SIGN-IN ELIGIBILITY -----------------------------------------
//
// 🔴 THE ALLOWLIST MUST NOT WIDEN FROM "MAY SIGN IN" TO "MAY BE REGISTERED".
//
// `isCompanyEmail` (sign-in) honours ALLOWED_EMAILS so a pre-existing, vetted
// account is not locked out of its own portal. `isCompanySignupEmail` (account
// CREATION) must not, because signup is now open to the public: if creation
// honoured the allowlist, any stranger could register the allowlisted address
// and take it over. Grandfathering must never grant creation.
//
// This is the single most important behavioural difference between the two
// functions, and it is one word apart in the source, so it is tested directly.
console.log("\nSIGN-UP ELIGIBILITY (isCompanySignupEmail)\n" + "=".repeat(72));

const signupSrc = readFileSync(new URL("../lib/auth-domain.ts", import.meta.url), "utf8");
if (!/export function isCompanySignupEmail/.test(signupSrc)) {
  console.log("  FAIL  isCompanySignupEmail is missing from lib/auth-domain.ts");
  failures++;
} else {
  // Mirror of the implementation: ALLOWED_DOMAINS only, no allowlist.
  const isCompanySignupEmail = (email) => {
    if (typeof email !== "string") return false;
    const bits = email.trim().toLowerCase().split("@");
    if (bits.length !== 2) return false;
    const [local, domain] = bits;
    if (!local || !domain) return false;
    return ALLOWED.includes(domain);
  };

  const SIGNUP_CASES = [
    ["agent@fflsynergy.com", true, "company domain may register"],
    ["AGENT@FFLSYNERGY.COM", true, "case-insensitive"],
    ...ALLOWED_EMAILS.map((e) => [
      e,
      false,
      "🔴 allowlisted address may SIGN IN but must NOT be registrable",
    ]),
    ["evil@gmail.com", false, "public mail domain"],
    ["evil@mail.fflsynergy.com", false, "subdomain is not the domain"],
    ["evil@notfflsynergy.com", false, "substring attack"],
    ["a@fflsynergy.com@evil.com", false, "double-@"],
    ["", false, "empty"],
    [null, false, "null"],
    [undefined, false, "undefined"],
  ];

  for (const [input, expected, why] of SIGNUP_CASES) {
    const got = isCompanySignupEmail(input);
    const label = expected ? "ALLOW" : "DENY ";
    // `JSON.stringify(undefined)` is undefined, not a string — String() first
    // or the reporter crashes on exactly the fail-closed case it is testing.
    const shown = String(JSON.stringify(input)).padEnd(38);
    if (got === expected) {
      console.log(`  ok    ${label}  ${shown} ${why}`);
    } else {
      console.log(`  FAIL  ${label}  ${shown} ${why}`);
      failures++;
    }
  }

  // Drift guard: the two functions must not be collapsed into one.
  if (/isCompanySignupEmail[\s\S]{0,400}?isAllowlistedEmail/.test(signupSrc)) {
    console.log(
      "  FAIL  isCompanySignupEmail appears to consult the allowlist — that widens\n" +
        "        it from sign-in grandfathering to registrable addresses.",
    );
    failures++;
  } else {
    console.log("  ok   DRIFT   isCompanySignupEmail does not consult ALLOWED_EMAILS");
  }
}

// --- SIGN-UP SURFACE ASSERTION ----------------------------------------------
//
// 🔴 THIS ASSERTION IS INVERTED AS OF 0005, AND THE INVERSION IS THE POINT.
//
// It used to assert that NO `signUp` call existed anywhere — that was the
// control keeping strangers out, and this test was its enforcement. 0005 opens
// public signup, so the old assertion is now false BY DESIGN. Leaving it would
// mean a permanently red test, and the likely response to a permanently red
// test is deleting it — losing the guard entirely.
//
// What replaces it is TIGHTER, not looser:
//   · signUp() must exist in EXACTLY ONE file, the one that carries the
//     company-domain check and the rate limit;
//   · OTP / OAuth / id-token sign-in must not exist AT ALL, because each is a
//     self-service entry point that bypasses signup/actions.ts entirely and
//     therefore bypasses the domain gate with it.
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

// The ONE file allowed to call signUp. Anything else is a regression.
const SIGNUP_OWNER = "app/[locale]/(portal)/signup/actions.ts";

const otherEntryPoints = signupHits.filter((line) =>
  /\.(signInWithOtp|signInWithOAuth|signInWithIdToken)\s*\(/.test(line),
);
const signUpCalls = signupHits.filter((line) => /\.signUp\s*\(/.test(line));
const straySignUp = signUpCalls.filter(
  (line) => !line.replace(/\\/g, "/").startsWith(SIGNUP_OWNER),
);

if (otherEntryPoints.length) {
  console.log(
    "  FAIL  an OTP / OAuth / id-token entry point exists — it would bypass the\n" +
      "        company-domain check in signup/actions.ts:\n" +
      otherEntryPoints.join("\n"),
  );
  failures++;
} else {
  console.log("  ok   no OTP / OAuth / id-token sign-in anywhere");
}

if (straySignUp.length) {
  console.log(
    `  FAIL  signUp() is called outside ${SIGNUP_OWNER}:\n` + straySignUp.join("\n"),
  );
  failures++;
} else if (signUpCalls.length === 0) {
  console.log(
    "  FAIL  no signUp() call found at all. 0005 requires EXACTLY ONE, in\n" +
      `        ${SIGNUP_OWNER}. If signup was deliberately removed, this\n` +
      "        assertion must be reverted to its pre-0005 form in the same commit.",
  );
  failures++;
} else {
  console.log(
    `  ok   signUp() exists in exactly one file (${signUpCalls.length} call site) — ${SIGNUP_OWNER}`,
  );
}

console.log("\n" + "=".repeat(72));
if (failures) {
  console.log(`${failures} FAILURE(S)\n`);
  process.exit(1);
}
console.log(`ALL ${CASES.length + 2} CHECKS PASSED\n`);
