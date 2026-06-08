# SegWitz Knowledge Base

Internal Knowledge Base / SOP Repository built with Next.js and Supabase.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

### 3. Set up Supabase

Run migrations in order in the Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_setup.sql`

Optionally run `supabase/seed.sql` for sample master data.

### 4. Create admin user

1. Sign up via Supabase Auth dashboard or the app login page
2. Promote to admin:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@segwitz.com';
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local.example`
4. Set Supabase redirect URL: `https://your-domain.vercel.app/auth/callback`
5. Deploy

## Features

- Supabase Auth (login, forgot/reset password)
- Role-based access (Admin, Department Manager, Team Member, View Only)
- Document upload, search, filter, PDF viewer
- CRUD for divisions, departments, types, categories, tags, users
- Audit logging
- Row Level Security and storage policies

## Tech Stack

Next.js App Router, TypeScript, Tailwind CSS, Shadcn UI, Supabase, TanStack Table, React PDF, React Hook Form, Zod
