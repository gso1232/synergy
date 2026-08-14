// =============================================================================
// check-domain-open.mjs — DOES THE LIVE DATABASE ACCEPT ANY EMAIL DOMAIN?
//
//   node scripts/check-domain-open.mjs
//
// Answers one question against the REAL project in .env.local: can an account be
// created for a plain @gmail.com address? That is the end-to-end property
// 0009_remove_domain_restriction.sql exists to produce, and it cannot be proved
// by reading source — the trigger lives in the database, not the repo.
//
// =============================================================================
// 🔴 IT CREATES A REAL ACCOUNT AND THEN DELETES IT. There is no read-only way to
// ask this: `enforce_company_domain` is a BEFORE INSERT trigger, so the only way
// to know whether it fires is to attempt an insert. The probe address is unique
// per run (`zz-domain-probe-<timestamp>@gmail.com`) so it cannot collide with a
// real person, and the account is deleted immediately on success.
//
// While the restriction is still in place the insert is REJECTED and nothing is
// created at all, so running this before applying 0009 has no side effect
// whatsoever.
//
// 🔴 IT USES THE SERVICE-ROLE KEY AND IS THEREFORE DEVELOPER-ONLY. It is a
// script, not application code — nothing imports it, and `postbuild` does not
// run it. Never wire it into a request path.
// =============================================================================

import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

/**
 * 🔴 THIS SCRIPT SETS `process.exitCode` AND NEVER CALLS `process.exit()`.
 *
 * `process.exit()` here aborted the Node process on Windows:
 *
 *     Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c
 *
 * — a hard abort with exit code 127, from tearing the loop down while the
 * fetch's handles were still closing. 127 conventionally means "command not
 * found", so a CI job running this would report the wrong failure entirely.
 *
 * The consequence is that `exitCode` does NOT stop execution, so every branch
 * below must be a real `else if` / `else`. An earlier pass swapped the calls
 * one-for-one and left the branches independent, which made the final "failed
 * for an unexpected reason" block print after every outcome — including success.
 */
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_ || !SECRET) {
  console.log("FAIL  .env.local is missing NEXT_PUBLIC_SUPABASE_URL or the secret key.");
  process.exitCode = 1;
}

const headers = {
  apikey: SECRET,
  Authorization: `Bearer ${SECRET}`,
  "Content-Type": "application/json",
};

const probe = `zz-domain-probe-${Date.now()}@gmail.com`;

const res = await fetch(`${URL_}/auth/v1/admin/users`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    email: probe,
    // Random enough for a row that exists for a few hundred milliseconds.
    password: `Probe-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    email_confirm: true,
  }),
});

const body = await res.json().catch(() => ({}));
const message = body.msg ?? body.message ?? body.error_description ?? "";

if (res.ok && body.id) {
  // Created — so the restriction is gone. Clean up immediately.
  const del = await fetch(`${URL_}/auth/v1/admin/users/${body.id}`, {
    method: "DELETE",
    headers,
  });
  console.log("\n  ok   ANY EMAIL DOMAIN IS ACCEPTED — a @gmail.com account was created.");

  if (del.ok) {
    console.log(`       probe account deleted (HTTP ${del.status}).`);
    console.log("\nDomain restriction is OFF end-to-end.\n");
    process.exitCode = 0;
  } else {
    // 🔴 A LEFTOVER PROBE ACCOUNT IS A REAL ACCOUNT. Fail loudly rather than
    // report success and leave it sitting in Authentication -> Users.
    console.log(`\n  ⚠ THE PROBE ACCOUNT COULD NOT BE DELETED (HTTP ${del.status}).`);
    console.log(`       Remove ${probe} by hand:`);
    console.log("       Supabase dashboard -> Authentication -> Users.\n");
    process.exitCode = 1;
  }
} else if (/only @|domain|denied/i.test(message)) {
  console.log("\n  FAIL THE COMPANY-DOMAIN RESTRICTION IS STILL ACTIVE IN THE DATABASE.");
  console.log(`       The database said: ${message}`);
  console.log("\n       Nothing was created. The app code no longer checks the domain, but");
  console.log("       the trigger on auth.users does. Apply the migration:");
  console.log("         supabase/migrations/0009_remove_domain_restriction.sql");
  console.log("       (Supabase dashboard -> SQL Editor -> paste -> Run), then re-run this.\n");
  process.exitCode = 1;
} else {
  console.log(`\n  FAIL Account creation failed for an unexpected reason (HTTP ${res.status}).`);
  console.log(`       ${message || "(no message)"}`);
  console.log("       Nothing was created.\n");
  process.exitCode = 1;
}
