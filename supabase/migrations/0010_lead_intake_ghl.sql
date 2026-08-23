-- =============================================================================
-- 0010_lead_intake_ghl.sql — make the lead intake able to record what it
-- actually collects, and whether the CRM received it.
--
-- WHY THIS EXISTS. 0002_crm.sql created public.leads and said in its own header
-- that rows would be "INSERTED server-side by the lead intake (the GHL webhook,
-- a later phase)". This is that later phase. Two gaps showed up the moment the
-- intake was written against the real form:
--
--   1. NO MESSAGE COLUMN. components/ContactForm.tsx collects a free-text
--      message ("What would you like us to know") and public.leads had nowhere
--      to put it. Dropping it on the floor would mean the admin panel shows a
--      lead whose most important sentence is missing.
--   2. NO DELIVERY RECORD. Forwarding to GoHighLevel is best-effort by design —
--      the row is committed BEFORE the webhook is called, so a CRM outage can
--      never cost a captured lead. That is only safe if a lead which never
--      reached the CRM is VISIBLE afterwards. Without these columns a failed
--      delivery is invisible and the lead silently never gets worked.
--
-- 🔴 PURELY ADDITIVE. Every column is nullable or defaulted, so existing rows
-- stay valid and nothing that reads `select *` breaks. Reversal is DROP COLUMN.
-- =============================================================================

-- --- what the contact form actually collects ---------------------------------
alter table public.leads add column if not exists message text;
-- "en" | "es". The visitor's language is a routing fact for a bilingual agency,
-- so it is stored rather than inferred from the copy later.
alter table public.leads add column if not exists locale text;

-- --- CRM delivery record ------------------------------------------------------
-- 'pending'      row committed, webhook not attempted yet (should be transient)
-- 'delivered'    GoHighLevel returned 2xx
-- 'failed'       attempted and did not succeed — SEE ghl_detail, WORK THIS LEAD
-- 'unconfigured' no webhook URL set in the environment at the time
alter table public.leads add column if not exists ghl_status text not null default 'pending';
-- A reason code only ("timeout", "http 502"). Never a URL, never a token.
alter table public.leads add column if not exists ghl_detail text;
alter table public.leads add column if not exists ghl_delivered_at timestamptz;

-- The same record for agent applications, which feed the same CRM.
alter table public.applications add column if not exists ghl_status text not null default 'pending';
alter table public.applications add column if not exists ghl_detail text;
alter table public.applications add column if not exists ghl_delivered_at timestamptz;

-- Partial index: the only query anyone runs against these is "what has not
-- reached the CRM", so indexing the whole column would be mostly dead weight.
create index if not exists leads_ghl_undelivered_idx
  on public.leads (received_at desc)
  where ghl_status <> 'delivered';

create index if not exists applications_ghl_undelivered_idx
  on public.applications (created_at desc)
  where ghl_status <> 'delivered';
