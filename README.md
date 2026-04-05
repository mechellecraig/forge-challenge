# Ironworks Forge Challenge — Supabase + Railway

## Stack
- React + Vite + TypeScript frontend
- Tailwind CSS (dark theme)
- Supabase (PostgreSQL database)
- Hosted on Railway (static site)

---

## Deploying to Railway

### Option A — Deploy from GitHub (recommended, enables auto-deploy)

1. Create a free account at [github.com](https://github.com) if you don't have one
2. Create a new repository called `forge-challenge`
3. Upload all files from this folder to the repo
4. Go to [railway.app](https://railway.app) and sign up
5. Click **New Project → Deploy from GitHub repo**
6. Select your `forge-challenge` repo
7. Add these environment variables in Railway's **Variables** tab:
   - `VITE_SUPABASE_URL` = `https://lulqfrldqctoosgrjzzh.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key from Supabase)
8. Railway will build and deploy — you'll get a public URL

### Option B — Deploy directly (no GitHub needed)

1. Install Railway CLI: `npm install -g @railway/cli`
2. In this folder, run: `railway login`
3. Then: `railway init` and `railway up`
4. Add environment variables via `railway variables set VITE_SUPABASE_URL=...`

---

## Local development

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173

---

## Making changes in Replit then deploying to Railway

1. Edit files in Replit as normal
2. In Replit, open the **Git** panel (left sidebar)
3. Stage and commit your changes
4. Click **Push** — Railway auto-deploys within ~2 minutes

---

## Default admin PIN
`1234` — change it immediately via Admin → PIN tab

## Points structure
| Activity | Points |
|---|---|
| Walk | 1 pt/mile |
| Run | 2 pts/mile |
| Bike | 1.5 pts/mile |
| Meal plan Mon–Fri | 3 pts/day |
| Meal plan Sat–Sun | 5 pts/day |
| HR zone session (≥60% max HR) | +5 pts |
| Admin bonus award | custom pts |
