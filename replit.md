# Ironworks Forge Challenge

## Overview
A real-time fitness competition tracker — teams log activities (walk, run, bike, meal plans, HR zone sessions) and earn points on a live leaderboard. Backed by Supabase (PostgreSQL).

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite 5
- **Styling:** Tailwind CSS (dark theme)
- **Database:** Supabase (PostgreSQL)
- **Routing:** Wouter
- **Data fetching:** TanStack Query

## Project Structure
```
forge-challenge/
├── index.html              # HTML entry point
├── vite.config.ts          # Vite config (port 5000, host 0.0.0.0)
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript config
├── .env                    # Supabase credentials (gitignored)
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Router + layout
│   ├── index.css           # Global styles
│   ├── lib/                # Supabase client
│   ├── pages/
│   │   ├── Dashboard.tsx   # Overview + standings
│   │   ├── Leaderboard.tsx # Full team leaderboard
│   │   ├── LogActivity.tsx # Log walk/run/bike/meals/HR sessions
│   │   ├── MyStats.tsx     # Individual stats
│   │   └── Admin.tsx       # Admin panel (PIN protected)
│   └── components/
│       └── Layout.tsx      # Nav + layout wrapper
└── forge-supabase/         # Supabase SQL migration files
```

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous key

## Running the App
- Workflow: "Start application" runs `npm run dev`
- Dev server binds to `0.0.0.0:5000` (Replit proxy compatible)

## Points Structure
| Activity | Points |
|---|---|
| Walk | 1 pt/mile |
| Run | 2 pts/mile |
| Bike | 1.5 pts/mile |
| Meal plan Mon–Fri | 3 pts/day |
| Meal plan Sat–Sun | 5 pts/day |
| HR zone session (≥60% max HR) | +5 pts |
| Admin bonus award | custom pts |

## Default Admin PIN
`1234` — change via Admin → PIN tab

## Deployment
- Target: static site (built with `npm run build`, served from `dist/`)
