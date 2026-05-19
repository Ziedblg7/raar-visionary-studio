# RAAR Architecture — Visionary Studio

Portfolio and client-facing web app for **Rabeb Chekir**, architect.

## Tech Stack

- **React 19** + **TanStack Router** (SPA)
- **Vite** for bundling
- **Supabase** (database + auth + edge functions)
- **Tailwind CSS v4** + **Radix UI** (shadcn/ui)
- **Framer Motion** for animations
- **i18next** — English, French, Arabic (RTL)

---

## Local Development

```bash
npm install
npm run dev
```

---

## Deploying to Hostinger

### 1. Build the app

```bash
npm install
npm run build
```

This produces a `dist/` folder.

### 2. Upload to Hostinger

1. Log in to your **Hostinger hPanel**
2. Go to **File Manager** → navigate to `public_html/`
3. Upload the entire contents of the `dist/` folder (not the folder itself — its contents)
4. The `.htaccess` file is already included in the build — it handles SPA routing

> **Important:** If your site is in a subfolder (e.g. `public_html/raar/`), open `vite.config.ts` and add `base: '/raar/'` to the config, then rebuild.

### 3. Environment variables

Vite bakes `VITE_*` variables at build time. Before building, create a `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

---

## AI Estimator — Supabase Edge Function

The estimator uses a **Supabase Edge Function** (`supabase/functions/estimator/`) powered by OpenAI.

### Setup

1. In **Supabase Dashboard → Edge Functions → Secrets**, add:
   ```
   OPENAI_API_KEY = sk-...
   ```

2. Deploy the function:
   ```bash
   supabase functions deploy estimator
   ```

The function uses `gpt-4o-mini` by default. Change the model in `supabase/functions/estimator/index.ts` if needed.

---

## Admin Panel

Visit `/login` to access the admin panel. Authentication is handled by Supabase Auth.

---

## Supabase Database

Run the migrations in `supabase/migrations/` via the Supabase CLI:

```bash
supabase db push
```

Tables: `projects`, `pricing_catalog`, `pricing_config`, `currency_rates`, `quotations`.
