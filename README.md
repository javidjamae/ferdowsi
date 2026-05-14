# Ferdowsi

> Ferdowsi spent thirty years writing the Shahnameh. Sixty thousand verses. One man, three decades, an entire culture preserved in long-form. This repo does the same job. With agents. In hours, not decades.

A fully automated content engine that researches what to write, scores what's worth writing, drafts it in your voice, humanizes the prose, generates a hero image, and ships it to a fast static site. You can run it lights-out or keep yourself in the review loop. Either way, the bill comes in under twenty dollars a month.

Named after [Ferdowsi](https://en.wikipedia.org/wiki/Ferdowsi), the tenth-century Persian poet who proved that one tireless writer with the right system can outlast empires.

Part of the skill library from [App Builders Academy](https://www.appbuilders.us?utm_source=github&utm_medium=readme&utm_campaign=ferdowsi).

---

## What you actually get

A blog that runs itself. Pick the cadence. Three posts a day, ten posts a day, two posts a week, one post a year. The system holds the same quality bar at any volume.

What it does for you, end to end:

- **Researches topics.** Pulls real search demand from Google Search Console, real conversion data from Google Analytics, and (optionally) competitor gaps from SpyFu, Ahrefs, Reddit, and your community.
- **Scores and prioritizes.** Every candidate gets scored against three axes: search evidence, conversion intent, and competition gap. Only the topics that can actually move revenue get queued.
- **Drafts in your voice.** Loads your positioning file, your reader persona, and a writer skill calibrated to clear a ten-times-better-than-the-best-ranking-page quality bar.
- **Strips the AI tells.** Two-stage humanizer. Deterministic rules first, LLM validator second. The output reads like a person wrote it because, effectively, your standards did.
- **Generates the hero image.** Pluggable. Leonardo by default. Swap for Replicate, fal.ai, or anything that takes a prompt and returns a URL.
- **Ships it.** Promotes approved drafts to a static-rendered Next.js site, dual-publishes as HTML and markdown for AI crawlers, revalidates the cache, indexes the sitemap.

This is what a six-person content team does for a SaaS company. The team costs you fifty thousand a month. This costs you twenty.

---

## Why this beats running WordPress

WordPress was built for a different problem. You needed an admin UI because non-engineers wrote the posts. You needed plugins because the core was a CMS, not a site. You needed a database query on every page load because pages weren't static. You needed Yoast to think about SEO because the templates didn't.

Ferdowsi has none of that, and you don't miss any of it:

- **No admin UI to maintain.** The writer is an agent. Edits happen in markdown files or through the Claude Code CLI. When you want a new feature, you vibe-code it.
- **No plugin sprawl.** SEO meta, sitemap, structured data, AI-crawler markdown alternates, image optimization — all native Next.js. No "install plugin, configure plugin, hope it doesn't break on the next major release."
- **No database query on read.** Posts render as static HTML at the edge. Cache hit on every page view. Lighthouse scores in the high nineties without effort.
- **No theme jail.** It's a Next.js app. You own every component. Want a different layout? Edit the JSX. Want a fully custom design system? Drop it in. Tailwind already wired up.
- **No security surface.** No PHP runtime, no `wp-admin` to harden, no third-party plugins shipping CVEs. The attack surface is one Next.js app and a Postgres database.
- **No content lock-in.** Your posts live in plain Postgres rows and plain markdown. Export them, fork them, move them. You're never trapped in someone else's CMS.

WordPress made sense in 2005. In 2026, a Next.js app plus an agent writer plus a Postgres table is the new default.

---

## Lights-out, or human-in-the-loop. Your call.

The pipeline ships with a review gate baked in. Drafts park in `ready_for_review` and wait for your tap. Mobile-first admin UI. Approve from your phone in the morning, posts go live by lunch.

When you trust the output, flip one flag in the config. The cron self-approves, the publisher promotes, you wake up to fresh posts. Same quality. Less involvement.

Most operators run both modes at different times. Manual for the first thirty posts while you tune the strategy file and the scoring weights. Automatic once the rubric is calibrated. The system supports either without a code change.

---

## Cost to run

At one post per day, real numbers:

- Anthropic API for writing and humanizing: about twelve dollars per month on Opus, six on Sonnet
- Image generation via Leonardo: about fifteen dollars per month (skip or self-host to drop to zero)
- Supabase free tier handles the first ten thousand posts
- Vercel Hobby tier handles the cron and hosting

Total at one post per day: under twenty dollars per month. Scale to ten posts per day and you're still under a hundred. There is no version of this where you're paying a human team's salary to do the same job.

---

## Prerequisites

- Node 20+
- A Supabase project (free tier)
- An Anthropic API key
- A Google Search Console property and a Google Analytics 4 property
- An image-generation API key (Leonardo by default, pluggable)

---

## Five-minute deploy

```bash
git clone https://github.com/javidjamae/ferdowsi
cd ferdowsi
cp .env.example .env
# Fill in your keys in .env
npm install
npm run db:migrate
npm run dev
```

Then ship it:

```bash
vercel deploy
```

Set the same env vars in the Vercel dashboard. The cron entries in `vercel.json` fire automatically.

---

## Configuration

Four files own the personality of your blog. Edit these:

1. `strategy/STRATEGY.md` — your 4Ps positioning file (Problem, Promise, Process, Person). Loaded on every cron run.
2. `strategy/READER.md` — a tight persona description for the writer to calibrate against.
3. `lib/topic-scoring.ts` — the three-axis scoring rubric. Tune the weights for your business.
4. `skills/write-blog-post/SKILL.md` — the writer prompt. The 10x quality bar and code-verification rule live here.

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
  signals/          # Signal source registry (2 implemented, 5 pluggable)
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
  migrations/       # Five tables, one RPC
public/
  llms.txt          # AI discovery file
vercel.json         # Cron schedule
```

---

## Signal sources

Pluggable via a clean interface. Two are wired up. Five are ready to enable.

| Source | Status | Description |
|---|---|---|
| `gsc.ts` | implemented | Queries with impressions but no clicks |
| `ga-gap.ts` | implemented | Landing pages with traffic but low conversion |
| `spyfu.ts` | pluggable | Competitor keyword gap |
| `ahrefs.ts` | pluggable | Content gap analysis |
| `competitor-scraper.ts` | pluggable | Playwright scrape of competitor blogs |
| `reddit.ts` | pluggable | Question-shaped post titles from configured subreddits |
| `skool.ts` | pluggable | Recent comments and posts from your community |

Each pluggable source is ~30 lines. Drop in an API key, flip `enabled: true`, you're done. Adding a new source later is a new file, not a refactor.

---

## License

MIT. Use it, fork it, ship it.

The production-tuned writer prompts, humanizer rule expansions, and per-business scoring rubrics that drive the App Builders Academy reference build are not in this repo. They live inside [App Builders Academy](https://www.appbuilders.us?utm_source=github&utm_medium=readme&utm_campaign=ferdowsi_license) along with the full course, the community, and the upgrade-as-you-go skill library.

---

## Course

Full build walkthrough on YouTube. Search "Build a WordPress Clone With AI Agent Writers." Four and a half hours. Every component in this repo, explained, on camera.
