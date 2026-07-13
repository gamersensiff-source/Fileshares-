// ===== SENSIX Vault — Configuration =====
// Fill these in with your own keys. All of these are safe to expose
// in frontend code (they are public/anon keys, not secret keys).

const CONFIG = {
  // --- Cloudinary (file storage) ---
  // Find these in your Cloudinary Dashboard
  CLOUDINARY_CLOUD_NAME: 'dksnuaww0',
  CLOUDINARY_UPLOAD_PRESET: 'sensix_uploads',

  // --- Supabase (database for pending/approved/rejected files) ---
  // Find these in Supabase → Project Settings → API
  SUPABASE_URL: 'https://kcaiitbkixmqdvgelllq.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjYWlpdGJraXhtcWR2Z2VsbGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NTY0MDAsImV4cCI6MjA5OTUzMjQwMH0.rh7TjhWE-b4k1cGKu6PTGbBhoI2f4QxsJ4JpIV3NQp8',

  // --- Admin panel password ---
  // ⚠️ This is a simple deterrent, NOT real security — anyone who reads
  // the source code can see this password. Do not use for truly sensitive data.
  ADMIN_PASSWORD: 'ARPITXVIP',
};
