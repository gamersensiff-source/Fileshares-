# SENSIX Vault — Setup Guide

This site now has 3 parts:
1. **Public site** (`index.html`) — search by code, download files, and a "Share Your File" upload form
2. **Admin panel** (`admin.html`) — password-protected page to approve/reject submissions
3. **`config.js`** — where you plug in your Cloudinary + Supabase keys

---

## Step 1 — Cloudinary (file storage)

You already have your API key. You also need:
- **Cloud Name** — found on your Cloudinary Dashboard homepage
- **Upload Preset** (unsigned) — go to Settings → Upload → Upload presets → Add upload preset →
  set **Signing Mode = Unsigned** → Save. Copy the preset name.

⚠️ We use an **unsigned upload preset** (not your API key/secret directly) because this is a
frontend-only site — secret keys can never be safely placed in browser code. Unsigned presets
are the correct, safe way to let a public form upload files to Cloudinary.

## Step 2 — Supabase (database for pending/approved files)

1. Go to https://supabase.com → create a free account → New Project (free tier)
2. Once created, go to **SQL Editor** → New Query → paste the contents of `supabase-setup.sql`
   from this folder → Run
3. Go to **Project Settings → API** → copy:
   - **Project URL**
   - **anon public key**

## Step 3 — Fill in `config.js`

Open `config.js` and replace the placeholder values:

```js
CLOUDINARY_CLOUD_NAME: 'your-cloud-name',
CLOUDINARY_UPLOAD_PRESET: 'your-unsigned-preset',
SUPABASE_URL: 'https://xxxxx.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOi...',
ADMIN_PASSWORD: 'pick-something-only-you-know',
```

## Step 4 — Commit & push

Commit all files (including the new `admin.html`, `admin.css`, `admin.js`, `config.js`) and push.
GitHub Pages will pick it up automatically.

## How it works day-to-day

1. Someone fills the "Share Your File" form on the main site and uploads a file — it goes straight
   to Cloudinary, and a row is saved in Supabase with status `pending`.
2. You open `yoursite.com/admin.html`, enter your password, and see all pending submissions with
   a **View File** button, **Approve**, and **Reject**.
3. Approve → the file is instantly assigned a random 4-digit code and becomes searchable/downloadable
   on the main site. Reject → it's marked rejected and disappears from the pending list.

No manual `manifest.json` editing needed anymore — `manifest.json` still works for files you want
to add by hand, but approved uploads now come from Supabase automatically.

## ⚠️ Security note

This is a **lightweight, free-tier setup** with no real backend server. The admin password only
hides the admin UI — it doesn't fully lock down the database at the API level (see the comment in
`supabase-setup.sql` for details). This is fine for a small personal project, but don't use this
pattern to store anything truly sensitive.
