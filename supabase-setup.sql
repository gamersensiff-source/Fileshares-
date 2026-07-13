-- ===== SENSIX Vault — Supabase Table Setup =====
-- Run this once in Supabase → SQL Editor → New Query → Run

create table submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  original_filename text,
  size_bytes bigint,
  uploader_email text,
  cloudinary_url text not null,
  cloudinary_public_id text,
  status text not null default 'pending',   -- 'pending' | 'approved' | 'rejected'
  code text,                                 -- assigned only on approval
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

-- Enable Row Level Security
alter table submissions enable row level security;

-- Allow anyone (anonymous users) to INSERT a new submission (the upload form)
create policy "Anyone can submit files"
  on submissions for insert
  to anon
  with check (true);

-- Allow anyone to SELECT rows (needed so the public site can show approved files,
-- and so the admin panel — which uses the same public key — can see everything)
create policy "Anyone can read submissions"
  on submissions for select
  to anon
  using (true);

-- Allow anyone to UPDATE rows (needed for the admin approve/reject buttons,
-- since the admin panel has no real login — it uses the same public key)
create policy "Anyone can update submissions"
  on submissions for update
  to anon
  using (true);

-- ⚠️ SECURITY NOTE:
-- Because this project has no real backend, the same public API key is used
-- by both the public upload form AND the admin panel. This means the SELECT
-- and UPDATE policies above are technically open to anyone who finds your
-- Supabase URL/key. The admin.html password only hides the button in the UI —
-- it does not stop someone from calling the Supabase API directly.
-- This is an acceptable tradeoff for a small personal/free project, but do not
-- use this pattern for anything sensitive.
