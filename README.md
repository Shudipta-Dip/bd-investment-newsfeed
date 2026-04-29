# BD Investment Newsfeed

**Internal Intelligence & Reputation Management Dashboard** for Bangladesh's investment promotion agencies — **BIDA**, **BEZA**, and **PPPA**.

---

## Overview

BD Investment Newsfeed is a strategic intelligence platform that provides real-time visibility into how global media perceives Bangladesh's investment landscape. It aggregates international financial news from 100+ RSS sources, runs AI-driven sentiment analysis and relevance filtering, and surfaces actionable intelligence to government officials.

### Key Capabilities

- **Automated RSS Scraping** — Scrapes 100+ global news sources every 3 hours via `node-cron`.
- **AI-Powered Filtering** — Uses **Groq** (Llama 3) for fast keyword validation and **Gemini** for deep-dive analysis, narrative rationale, and impact scoring.
- **Sentiment Dashboard** — React/Vite frontend with real-time sentiment badges (Growth, Critical, Policy, Neutral) and AI-generated intelligence notes.
- **Action Logging** — Officials can log responses directly against articles (corrections, signals, archives).
- **Data Retention** — 7-day rolling window on the dashboard; 60-day archive in Supabase with automatic daily purge.

---

## Architecture

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│         client/             │     │         server/             │
│  React + Vite + Tailwind    │◄───►│  Express.js + node-cron     │
│  shadcn/ui components       │     │                             │
│  @tanstack/react-query      │     │  services/                  │
│                             │     │   ├── scraper.js (RSS)      │
│  Port: 8080 (dev)           │     │   ├── aiValidator.js        │
│                             │     │   ├── articleExtractor.js    │
│                             │     │   └── sources.js (100+ RSS) │
│                             │     │                             │
│                             │     │  models/index.js → Supabase │
│                             │     │  Port: 5002                 │
└─────────────────────────────┘     └─────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (included with Node.js)
- A [Supabase](https://supabase.com) project with a `news_articles` table
- API keys for [Google Gemini](https://aistudio.google.com/app/apikey) (×3) and [Groq](https://console.groq.com/keys) (×2)

### 1. Clone

```bash
git clone https://github.com/Shudipta-Dip/bd-investment-newsfeed.git
cd bd-investment-newsfeed
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your real credentials
```

### 3. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 4. Run in development

```bash
# Terminal 1 — Backend (from server/)
cd server
npm run dev          # nodemon on port 5002

# Terminal 2 — Frontend (from client/)
cd client
npm run dev          # Vite dev server on port 8080
```

The client proxies `/api` requests to `http://localhost:5002` via Vite's built-in proxy.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Express server port (default `5002`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service-role key (server-side only) |
| `SUPABASE_PROJECT_PASSWORD` | Supabase project password |
| `GEMINI_API_KEY_1` / `_2` / `_3` | Google Gemini API keys (rotated to manage rate limits) |
| `GROQ_API_KEY_1` / `_2` | Groq API keys (rotated to manage rate limits) |

See [`.env.example`](.env.example) for the full template.

---

## Automation

| Schedule | Action | Source |
|---|---|---|
| Every 3 hours (`0 */3 * * *`) | Full RSS scrape → AI filter → Supabase upsert | `server/app.js` |
| Daily at midnight (`0 0 * * *`) | Purge articles older than 60 days | `server/app.js` |

---

## Scripts (Development Utilities)

Located in `server/scripts/`. These are **one-off dev tools**, not production code:

| Script | Purpose |
|---|---|
| `seed.js` | Seed the database with sample articles |
| `wipe_data.js` | Delete all articles from the database |
| `wipe_all.js` | Alternative full wipe |
| `patch_rationales.js` | Backfill AI rationales for existing articles |
| `fix_failed_sources.js` | Brute-force RSS endpoint discovery for failed sources |
| `discover_rss.js` | Auto-discover RSS feeds from a source list |

---

## Tech Stack

### Backend
- **Express.js** — REST API
- **node-cron** — Scheduled scraping & purge
- **rss-parser** — RSS feed parsing
- **cheerio** / **jsdom** / **@mozilla/readability** — HTML article extraction
- **@google/generative-ai** — Gemini for deep-dive analysis
- **groq-sdk** — Groq (Llama 3) for fast validation
- **@supabase/supabase-js** — Supabase client

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** + **shadcn/ui**
- **@tanstack/react-query** — Data fetching & caching
- **Lucide React** — Icons
- **next-themes** — Dark/light mode

---

## Project Structure

```
bd-investment-newsfeed/
├── client/                     # React/Vite frontend
│   ├── index.html
│   ├── public/
│   │   └── newsfeed_favicon.svg
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── data/               # TypeScript types
│   │   ├── lib/                # API client, utilities
│   │   ├── pages/              # Page components
│   │   └── main.tsx            # App entry
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Express.js backend
│   ├── server.js               # HTTP server entry
│   ├── app.js                  # Express app + cron jobs
│   ├── routes/                 # API routes
│   ├── controllers/            # Route handlers
│   ├── models/                 # Supabase data layer
│   ├── services/               # Scraper, AI, sources
│   ├── scripts/                # Dev utility scripts
│   └── package.json
├── docs/                       # PRD & Design System docs
├── .env.example                # Environment template
├── .gitignore
└── README.md
```

---

## License

Internal use only. Not licensed for redistribution.
