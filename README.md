# HYPE Tracker

Track your Hyperliquid HYPE token balance across all sources — spot, HyperLend, HyperEVM, and perps.

## Features

- **Balance Dashboard**: Real-time tracking of HYPE across all allocation sources
  - Spot HYPE on Hyperliquid L1
  - HyperLend deposits (hWHYPE)
  - Native HYPE on HyperEVM
  - Perp account value (USDC)
- **Multi-denomination display**: HYPE, USD, and BTC values
- **Auto-refresh**: Balance updates every 30 seconds
- **Admin Updates**: Post news/updates with markdown support and images
- **Authentication**: Email/password auth via Supabase

## Tech Stack

- Next.js 15+ (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Storage)
- Hyperliquid API (no auth required)
- HyperEVM RPC (public)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/benaicompanion/hype-tracker.git
cd hype-tracker
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** to get your project URL and anon key
3. Run the migration SQL from `supabase/migrations/001_create_posts.sql` in the SQL Editor
4. Create a storage bucket:
   - Go to **Storage** → **New Bucket**
   - Name: `post-images`
   - Public: Yes
5. Set up storage policies:
   - Allow authenticated users to upload to `post-images`
   - Allow public read access

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_EMAIL=admin@example.com
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

```bash
npx vercel --prod
```

Set the same environment variables in your Vercel project settings.

## Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page with login/signup | Public |
| `/dashboard` | Balance tracker dashboard | Authenticated |
| `/updates` | News feed from admin | Authenticated |
| `/admin` | Post creation panel | Admin only |

## API

- `GET /api/balance` — Returns full balance breakdown (no auth required, public Hyperliquid data)

## Tracked Address

Default: `0x2246c4D51374a269423c9bd56a188b77c2473736`

## Balance Sources

1. **Spot HYPE**: Hyperliquid L1 spot clearinghouse
2. **HyperLend (hWHYPE)**: ERC20 balance on HyperEVM contract `0x0D745EAA9E70bb8B6e2a0317f85F1d536616bD34`
3. **HyperEVM Native**: Native HYPE balance on HyperEVM
4. **Perps**: Perpetual trading account margin (USDC denominated)
