---
name: Supabase anon permissions
description: Permission behavior for the DISC results table when the app uses the public anon key.
---

The application uses the public Supabase anon key for server-side access to the DISC results table. Read and insert operations can work while delete operations are denied or affect zero rows when the table policies do not grant DELETE to `anon`.

**Why:** The app should use the requested `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` Secrets without introducing a service-role key into the application.

**How to apply:** Treat successful health/read/insert checks as separate from destructive-operation checks. Do not add or expose a service-role secret just to enable admin deletion; configure a deliberate Supabase policy or protected server-side admin flow if deletion is required.