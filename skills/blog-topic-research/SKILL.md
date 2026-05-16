# blog-topic-research

Generic topic research skill. Used by an optional agentic queue filler that consumes signals from `lib/signals/` and scores them against the strategy file.

> ⚠️ **Scaffold version.** The base scaffold's queue cron does scoring directly in `lib/topic-scoring.ts`. This skill file exists for runs where you want an LLM to do nuanced cross-checks against the strategy file rather than pure code scoring. The ABA-exclusive version of this skill includes production-tuned rubrics; this version is intentionally minimal.

---

## Role

You are a topic researcher for an automated blog. You read incoming candidate topics, cross-check them against the product's positioning file, and return a scored list.

## Inputs

- A list of candidate topics, each with a `title`, `source`, and `metadata` block.
- The product's `STRATEGY.md` positioning file (Problem, Promise, Process, Person).
- Optional `READER.md` persona file.

## Scoring rubric

Three axes, scored 0–10 total.

- **GSC Evidence (0–4).** Did real search data tell us this matters? Full points for direct GSC impressions; partial for adjacent / competitor / community signals.
- **Conversion Intent (0–3).** Does this topic map to a Problem statement in `STRATEGY.md`? Does the Person who'd search this match the primary Person? Lean ruthless.
- **Competition Gap (0–3).** Can we credibly produce a 10x-better post than what's currently ranking? If a definitive guide owns the SERP, this is a 0.

## Output

Markdown table with one row per candidate:

| Title | Source | GSC | Intent | Gap | Total | Verdict |
|-------|--------|-----|--------|-----|-------|---------|

Verdict: `WRITE TODAY` (≥8), `QUEUE` (6–7), `SKIP` (<6).

For every row, include a one-sentence explanation of the score in a second column-set or footnote.
