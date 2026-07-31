# Ferdowsi

> Ferdowsi spent thirty years writing the Shahnameh. Sixty thousand verses. One man, three decades, an entire culture preserved in long-form. This repo does the same job. With agents. In hours, not decades.

An open-source automated blog: an agent researches topics, writes in your voice, strips the AI tells, parks drafts for a twenty-second review, and publishes to a fast static site with markdown twins that AI assistants can cite. One Postgres database and one Anthropic key. That's the whole bill of materials.

**This is the companion repo to the App Builders guide: [Building a Fully Automated Technical Blog](https://www.appbuilders.us/guides/automated-blog-system).** The guide is the strategy, tool-agnostic. This repo is the worked example: the guide handed to a coding agent with one instruction, "build this on Next.js, Postgres, and Vercel." Read the guide for the why. Clone this for a running starting point. Repeat the same play on your own stack if it differs.

Named after [Ferdowsi](https://en.wikipedia.org/wiki/Ferdowsi), the tenth-century Persian poet who proved that one tireless writer with the right system can outlast empires.

## What's in the box

- **Topic queue** (guide: Move 1). Seed topics from a file, or let the researcher propose scored candidates against your strategy. Dedup against everything queued and published. An anti-filler floor keeps weak topics out.
- **Writer + humanizer** (Move 2). Drafts written against your strategy and reader files with the writer skill, then a two-stage humanizer: deterministic rules first, LLM validator second.
- **GEO dual-format publishing** (Move 3). Every post renders as HTML for people and as `/slug/index.md` for AI crawlers, with the canonical Link header that makes dual-publishing safe. `llms.txt` template included.
- **Review gate** (Move 4). Drafts park in a review queue. Side-by-side preview and markdown editor, approve or reject. Every overwrite snapshots to `content_revisions` first, and a truncation guard refuses a save that destroys most of a draft.
- **A dashboard that shows you the whole map.** The admin mirrors the managed product's layout one-to-one. Live tabs: Overview, Ideas, Drafts, Posts, Runs. The others (Analytics, Activity, Configuration, Settings) are honest placeholders: each one tells you what you could build there, which guide section teaches it, and what the managed version does instead.
- **Runs log.** Every pipeline job records what it did. Watch the system work without tailing logs.

Configuration is files, on purpose: `strategy/STRATEGY.md`, `strategy/READER.md`, `strategy/SEED-TOPICS.md`, the skills in `skills/`, and `.env`. Edit them in git. That IS the config system.

## Run it locally first (no accounts, ~5 minutes)

Everything works on your machine against a local Postgres. No Supabase project, no Vercel account, no provisioning.

```bash
git clone https://github.com/javidjamae/ferdowsi
cd ferdowsi
npm install

# Any Postgres works. Docker is the fastest:
docker run -d --name ferdowsi-pg -p 5432:5432 -e POSTGRES_PASSWORD=ferdowsi postgres:16

cp .env.example .env
# Set in .env:
#   DATABASE_URL=postgres://postgres:ferdowsi@localhost:5432/postgres
#   ANTHROPIC_API_KEY=sk-ant-...

npm run db:migrate
npm run dev
```

Open http://localhost:3000/admin (no password needed in dev until you set `ADMIN_SECRET`). Add a topic in Ideas, hit "Draft next idea", review it in Drafts, approve, publish. Your post is live at http://localhost:3000/your-slug with its markdown twin at `/your-slug/index.md`.

The crons are just authenticated GET routes, so you can drive the whole pipeline by hand while testing:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/queue?force=1"
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/draft
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/publish
```

## Then take it live (Supabase + Vercel, ~1 hour)

Same code, different connection string. Nothing else changes.

1. Create a Supabase project (free tier). Grab the connection string from the Connect panel; on Vercel use the **Transaction pooler** string.
2. `DATABASE_URL=<that string> npm run db:migrate` to create the schema there. Moving local test data too? `pg_dump` your local database and restore it, it's all just Postgres.
3. Push to GitHub, import the repo in Vercel, and set the env vars from your `.env` (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `ADMIN_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`).
4. Deploy. The cron entries in `vercel.json` fire automatically: queue daily, draft daily, publish daily. Adjust the schedules to your cadence.

## Cost to run

- Anthropic API for research, writing, and validation: single-digit dollars per month at one post a day, model-dependent (`MODEL_WRITE` and friends in `.env` trade cost for quality per stage)
- Postgres: local is free; the Supabase free tier holds years of posts
- Vercel Hobby runs the site and the crons
- Hero images: off by default (`IMAGE_PROVIDER=none`); wire any provider in `lib/image-gen.ts` when you want covers

## What this repo deliberately doesn't include

The guide teaches five moves. This repo fully implements Moves 1 through 4 plus the cron orchestration. **Move 5, the analytics feedback loop, is described in the guide and left for you to build**: the `analytics_search_console` and `content_metrics` tables are already migrated (matching the guide's schema), and the Analytics tab in the dashboard tells you exactly what goes there. That's not a tease, it's the honest line between a weekend scaffold and a production system. The dashboard's locked tabs map every other gap the same way.

If you'd rather not own that build, there's a managed version of this same architecture, calibrated and supported. The honest build-vs-buy accounting, written to be evaluated by you or your coding agent, is in [docs/BUILD-VS-BUY.md](docs/BUILD-VS-BUY.md). The short version: building v1 is a weekend; trusting a pipeline unattended is the long pole. Watch it running end to end in [the training that pairs with the guide](https://www.appbuilders.us/freebies/automated-blog-system/training).

## Folder structure

```
app/
  api/cron/
    queue/          # Daily: seeds + LLM topic research, scored + deduped
    draft/          # Daily: claim top idea, write, humanize, park for review
    publish/        # Daily: promote approved drafts to the public site
  admin/            # The dashboard (env-password gate, see ADMIN_SECRET)
  [slug]/           # HTML renderer + /index.md markdown twin (canonical header)
components/         # Dashboard components incl. the locked-tab showroom
db/migrations/      # Plain SQL, applied by npm run db:migrate
docs/BUILD-VS-BUY.md
lib/
  db.ts             # The one Postgres seam (local or Supabase)
  llm.ts            # The one Anthropic seam (per-stage models)
  pipeline/         # queue / draft / publish, shared by crons + dashboard
  humanizer/        # Rules + LLM validator
  markdown.ts       # Dependency-free markdown renderer
  revisions.ts      # Snapshot-before-overwrite + truncation guard
skills/             # The writer + researcher prompts (your voice lives here)
strategy/           # STRATEGY.md, READER.md, SEED-TOPICS.md
```

## License

MIT. Use it, fork it, ship it.

The production-tuned prompts, quality gates, and integrations that drive the managed version are not in this repo; the guide teaches you how to build your own versions of all of them.
