// =============================================================================
// check-portal-gaps.mjs — the declared gap counts must match the rendered ones.
//
//   node scripts/check-portal-gaps.mjs
//
// `lib/portal/sections.ts` declares how many PortalPlaceholder blocks each
// section carries. Those numbers are not decoration: they drive the count chip
// on every tab, the per-card badge on the overview, and the "N details still to
// come" line an agent reads before deciding whether the portal is usable yet.
//
// 🔴 A STALE COUNT IS WORSE THAN NO COUNT. If someone fills in a gap and the
// declared number is not updated, the portal keeps telling agents a detail is
// missing that is now present — or worse, drops a count and tells them the
// section is complete when it is not. The count has to be declared (the overview
// needs it WITHOUT rendering the section) so the only defence is this check.
//
// Exits non-zero on any mismatch, so it can sit in the build the way
// check-no-service-role.mjs does.
// =============================================================================
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// --- declared ---------------------------------------------------------------
const src = readFileSync(join(root, "lib/portal/sections.ts"), "utf8");
const declared = {};
for (const m of src.matchAll(/\{\s*key:\s*"([a-z]+)",\s*steps:\s*(\d+),\s*gaps:\s*(\d+)\s*\}/g)) {
  declared[m[1]] = { steps: Number(m[2]), gaps: Number(m[3]) };
}

if (!Object.keys(declared).length) {
  console.log("  FAIL  could not parse PORTAL_SECTIONS from lib/portal/sections.ts");
  process.exit(1);
}

// --- rendered ---------------------------------------------------------------
const dir = join(root, "components/portal/sections");
const FILES = {
  licensing: "LicensingSection.tsx",
  contracting: "ContractingSection.tsx",
  resources: "ResourcesSection.tsx",
  training: "TrainingSection.tsx",
};

let failures = 0;
console.log("\nPORTAL GAP COUNTS — declared vs rendered\n" + "=".repeat(66));

const present = readdirSync(dir);
for (const [key, meta] of Object.entries(declared)) {
  const file = FILES[key];
  if (!file || !present.includes(file)) {
    console.log(`  FAIL  ${key}: no section component (${file ?? "unmapped"})`);
    failures++;
    continue;
  }
  const body = readFileSync(join(dir, file), "utf8");
  // Count real usages, not the word in a comment.
  const rendered = [...body.matchAll(/<PortalPlaceholder\b/g)].length;
  // Steps are <PortalStep n={..}>; sections without a checklist declare 0.
  const steps = [...body.matchAll(/<PortalStep\b/g)].length;

  const gapOk = rendered === meta.gaps;
  const stepOk = steps === meta.steps;
  if (!gapOk || !stepOk) failures++;
  console.log(
    `  ${gapOk && stepOk ? "ok  " : "FAIL"}  ${key.padEnd(12)} ` +
      `gaps declared ${meta.gaps} / rendered ${rendered}   ` +
      `steps declared ${meta.steps} / rendered ${steps}`,
  );
}

// Every gap must also have a copy key, or it renders an empty note.
const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8"));
const gapKeys = Object.keys(en.portal?.gaps ?? {});
const usedKeys = new Set();
for (const file of Object.values(FILES)) {
  const body = readFileSync(join(dir, file), "utf8");
  for (const m of body.matchAll(/t\("gaps\.([A-Za-z0-9_]+)"\)/g)) usedKeys.add(m[1]);
}
const missing = [...usedKeys].filter((k) => !gapKeys.includes(k));
const unused = gapKeys.filter((k) => !usedKeys.has(k));
if (missing.length) {
  console.log(`  FAIL  gap copy missing from messages/en.json: ${missing.join(", ")}`);
  failures++;
} else {
  console.log(`  ok    every rendered gap has copy (${usedKeys.size} keys)`);
}
if (unused.length) console.log(`  note  unused gap copy keys: ${unused.join(", ")}`);

console.log("=".repeat(66));
if (failures) {
  console.log(`${failures} FAILURE(S)\n`);
  process.exit(1);
}
console.log("Portal gap counts agree.\n");
