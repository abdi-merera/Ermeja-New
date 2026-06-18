# Supabase Admin Auth Setup

1. Create a free Supabase project.
2. In Supabase, go to Authentication and create an admin user with email/password.
3. Copy your project URL and anon public key from Project Settings > API.
4. Create a root `.env` file:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
ADMIN_EMAILS=admin@example.com
```

5. Create `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

6. Restart both dev servers after changing env files.

Only emails listed in `ADMIN_EMAILS` can use admin API routes, even if another Supabase user can sign in.
