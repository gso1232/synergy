// =============================================================================
// check-no-service-role.mjs — a BUILD GATE.
//
// Scans the CLIENT-REACHABLE build output (the browser bundles Next emits to
// <distDir>/static) for anything that would mean the service-role key — which
// bypasses RLS — leaked into code a browser downloads. If it finds a hit, it
// exits non-zero and FAILS THE BUILD.
//
// It looks for:
//   1. the distinctive NEW-format secret-key prefix `sb_secret_` — catches the
//      new key's VALUE by its own shape, even when no env var is set at scan
//      time. This is the important one under the new API key system.
//   2. the legacy token `service_role` and the env var names
//      SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY — catches a careless
//      `process.env.<name>` reference or hard-coded legacy material.
//   3. the actual secret VALUE, if SUPABASE_SECRET_KEY or the legacy
//      SUPABASE_SERVICE_ROLE_KEY is set in the scan env — belt-and-suspenders.
//
// Run after `next build`, against the same distDir the build used:
//   NEXT_DIST_DIR=.next-build node scripts/check-no-service-role.mjs
// =============================================================================

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const distDir = process.env.NEXT_DIST_DIR || ".next";
// The browser assets. Only these are shipped to and executed by the client.
const clientDir = join(distDir, "static");

const NEEDLES = [
  "sb_secret_", // new-format secret key prefix — its own value gives it away
  "service_role", // legacy role name
  "SUPABASE_SECRET_KEY", // new env var name
  "SUPABASE_SERVICE_ROLE_KEY", // legacy env var name
];
// Also scan for the literal secret value if either secret var is set at scan time.
const secretValue = (
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
)?.trim();
if (secretValue && secretValue.length >= 12) NEEDLES.push(secretValue);

if (!existsSync(clientDir)) {
  console.error(
    `[check-no-service-role] client bundle dir not found: ${clientDir}\n` +
      `Run "next build" first (with NEXT_DIST_DIR if you use one).`,
  );
  process.exit(2);
}

/** Every file under a directory, recursively. */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(clientDir).filter((f) => /\.(js|mjs|cjs|json)$/.test(f));
const hits = [];

for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const needle of NEEDLES) {
    if (text.includes(needle)) {
      // Report the needle by name, but NEVER print the secret value itself.
      const label = needle === secretValue ? "<service-role key value>" : needle;
      hits.push({ file, label });
    }
  }
}

if (hits.length > 0) {
  console.error(
    "\n🔴 BUILD FAILED — service-role material found in the client bundle:\n",
  );
  for (const h of hits) console.error(`   ${h.file}\n     ↳ contains: ${h.label}`);
  console.error(
    "\nThe service-role key bypasses RLS and must never reach a browser.\n" +
      "Move the offending import into server-only code (a server component,\n" +
      "server action, route handler or middleware) and rebuild.\n",
  );
  process.exit(1);
}

console.log(
  `[check-no-service-role] OK — scanned ${files.length} client files in ${clientDir}, no service-role material found.`,
);
