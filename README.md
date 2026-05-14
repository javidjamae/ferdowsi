# Automated Blog System

A production-ready scaffold for running a fully automated blog with AI agent writers. Built on Next.js 15, Supabase, Tailwind, and Claude.

Companion repo for the YouTube course: **Build a WordPress Clone With AI Agent Writers**.

This is the open-source scaffold version. It will publish posts. The production-tuned versions of the writer prompt, humanizer rules, and topic-scoring rubric — the ones refined against months of real traffic data — stay in the App Builders Academy program.

---

## What this does

Three loops running on cron:

1. **Topic loop** — pulls signals from Google Search Console + Google Analytics (plus five pluggable sources), scores candidate topics against your strategy file, and queues the winners.
2. **Writer loop** — picks the highest-priority topic, drafts it with Claude, runs it through a two-stage humanizer, generates a hero image, and parks it for review.
3. **Publisher loop** — promotes approved drafts to the public posts table and revalidates the Next.js cache.

You stay in control of what ships. The AI drafts. You approve.

---

## Prerequisites

- Node 20+
- A Supabase project (free tier works)
- An Anthropic API key (or any LLM that fits the writer call)
- A Google Search Console + Google Analytics property
- An image-generation API key (Leonardo, Replicate, fal.ai — pluggable)

---

## Five-minute deploy

```bash
git clone https://github.com/javidjamae/automated-blog-system
cd automated-blog-system
cp .env.example .env
# Fill in your keys in .env
npm install
npm run db:migrate
npm run dev
```

Then push to Vercel:

```bash
vercel deploy
```

Set the same env vars in the Vercel dashboard. The cron entries in `vercel.json` will fire automatically.

---

## Configuration

Four files you'll actually edit for your business:

1. `strategy/STRATEGY.md` — your 4Ps positioning file (Problem, Promise, Process, Person). See Section 01 of the course.
2. `strategy/READER.md` — a tight persona description for the writer to calibrate against.
3. `lib/topic-scoring.ts` — the three-axis scoring rubric. Tune the weights for your business.
4. `skills/write-blog-post/SKILL.md` — the writer prompt. The 10x quality bar and code verification rule live here.

---

## Folder structure

```
app/
  api/
    cron/
      ingest-gsc/   # Nightly: pull GSC data into Postgres
      ingest-ga/    # Nightly: pull GA4 data into Postgres
      queue/        # Daily: score topics, fill content_ideas
      draft/        # Hourly: write the next post, humanize, image-ify
      publish/      # Hourly: promote approved drafts to public
    admin/
      publish/      # Manual approve endpoint
  admin/
    blog/           # Mobile-first review queue
  [slug]/           # Dual-format renderer: HTML + .md
lib/
  signals/          # Signal source registry (2 implemented, 5 stubs)
  humanizer/        # Rules + LLM validator
  topic-scoring.ts  # The scoring rubric
  image-gen.ts      # Pluggable image generator
skills/
  blog-topic-research/  # Topic queue agent prompt
  write-blog-post/      # Writer agent prompt
strategy/
  STRATEGY.md       # Your 4Ps positioning file
  READER.md         # Your persona file
supabase/
  migrations/       # Five tables, five SQL files
public/
  llms.txt          # AI discovery file
vercel.json         # Cron schedule
```

---

## The signal sources

Pluggable via a clean interface. Two are wired up. Five are stubs you enable when you're ready.

| Source | Status | Description |
|---|---|---|
| `gsc.ts` | implemented | Queries with impressions but no clicks |
| `ga-gap.ts` | implemented | Landing pages with traffic but low conversion |
| `spyfu.ts` | stub | Competitor keyword gap |
| `ahrefs.ts` | stub | Content gap analysis |
| `competitor-scraper.ts` | stub | Playwright scrape of competitor blogs |
| `reddit.ts` | stub | Question-shaped post titles from configured subreddits |
| `skool.ts` | stub | Recent comments and posts from your community |

Each stub is ~30 lines. Drop in an API key, flip `enabled: true`, you're done.

---

## License

MIT. Use it, fork it, ship it. Production-tuned prompts and rubrics are NOT included. They live in [App Builders Academy](https://www.appbuilders.us).

---

## Course

Full 4.5-hour build walkthrough on YouTube. Search "Build a WordPress Clone With AI Agent Writers."
