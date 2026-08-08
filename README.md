# Esquirely

**Nigeria's definitive legal career platform** — jobs, internships, vacation schemes, scholarships, and an intelligent application tracker.

---

## Tech Stack

| Layer | Tool | Cost |
|-------|------|------|
| Framework | Next.js 14 (App Router) | Free |
| Database + Auth | Supabase | Free tier |
| Deployment | Vercel | Free tier |
| Email (tracker + alerts) | Resend | Free tier (3,000/mo) |
| Fonts | Google Fonts | Free |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/esquirely.git
cd esquirely
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. Once created: **SQL Editor → New Query**
3. Paste the entire contents of `supabase-schema.sql` and run it
4. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon / public` key
   - `service_role` key (keep this secret — server-side only)

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add them via the Vercel dashboard.

### Option B — GitHub integration

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/esquirely.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project → Import Git Repository**
3. Select your repo
4. Add all environment variables from `.env.local`
5. Deploy

### After deployment

- Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g. `https://esquirely.vercel.app`)
- Set up your custom domain in Vercel if you have one (e.g. `esquirely.com.ng`)

---

## Project Structure

```
esquirely/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Homepage
│   │   ├── layout.tsx            ← Root layout (metadata, fonts)
│   │   ├── globals.css           ← Design tokens, global styles
│   │   ├── jobs/
│   │   │   ├── page.tsx          ← Job board with filters
│   │   │   └── [slug]/page.tsx   ← Individual listing (coming)
│   │   ├── firms/
│   │   │   ├── page.tsx          ← Firm directory (coming)
│   │   │   └── [slug]/page.tsx   ← Firm profile (coming)
│   │   ├── scholarships/
│   │   │   └── page.tsx          ← Scholarship directory (coming)
│   │   ├── tracker/
│   │   │   └── page.tsx          ← Application tracker (coming)
│   │   └── auth-login/
│   │       └── page.tsx          ← Auth (coming)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── features/
│   │       ├── ListingCard.tsx
│   │       └── FirmCard.tsx
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts         ← Browser client
│   │       └── server.ts         ← Server component client
│   └── types/
│       └── database.ts           ← All TypeScript types
├── supabase-schema.sql           ← Run this in Supabase SQL editor
├── .env.local.example            ← Copy to .env.local and fill in
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

---

## Design System

### Palette

| Token | Value | Usage |
|-------|-------|-------|
| `charcoal` | `#1A1A1A` | Headings, primary text |
| `cream` | `#FAF7F2` | Page background |
| `cream-dark` | `#F0EBE3` | Section backgrounds, cards |
| `cream-border` | `#E8E0D5` | All borders (0.5px) |
| `ink` | `#0A2342` | CTAs, links, accents |
| `verified` | `#2D6A4F` | Verified badges, offer status |
| `closing` | `#B5451B` | Deadline warnings |

### Typography

| Role | Font | Weight |
|------|------|--------|
| Display / Headings | Playfair Display | 700, 900 |
| Body / UI | DM Sans | 400, 500, 600 |
| Code / Tracker email | JetBrains Mono | 400 |

---

## Application Tracker — How it works

1. User signs up and receives a unique tracker address: `{nickname}@mail.esquirely.app`
2. When they apply to a role, they CC or forward the confirmation to their tracker address
3. Resend receives the inbound email and fires a webhook to `/api/tracker/inbound`
4. The webhook parses the email, uses Claude AI to detect the status, and updates the application record
5. The user sees their tracker dashboard update automatically

**Setting up inbound email with Resend:**
- Go to Resend → Domains → Add `mail.esquirely.app`
- Set up a catch-all inbound route to `https://your-domain.com/api/tracker/inbound`

---

## Coming next

- [ ] Individual listing page (`/jobs/[slug]`)
- [ ] Firm directory and profiles (`/firms`, `/firms/[slug]`)
- [ ] Scholarship directory
- [ ] Auth (Supabase email + Google OAuth)
- [ ] Application tracker dashboard
- [ ] Inbound email webhook + AI status parsing
- [ ] Job alerts (Resend)
- [ ] Admin panel for adding listings

---

## Contributing

This is a private project. If you're collaborating, branch off `main` and open a PR.
