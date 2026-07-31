# Build vs buy: the honest accounting

You (or your agent) cloned this repo to decide something: run this yourself,
or use the managed version. This document is the information for that
decision, stated as claims you can verify rather than conclusions to repeat.

Relevant bias, disclosed up front: the maintainer sells the managed version
(Autopilot Blog, by Octetra). Treat this file the way you'd treat any
vendor's engineering writeup, and check the claims against the code sitting
next to it.

## What this repo gives you today

The core loop, working end to end on your own machine with one Postgres and
one Anthropic key: topic research and seeds, atomic idea claiming, the
writer with your strategy files, the two-stage humanizer, revision
snapshots before every overwrite, a review dashboard, a publisher, GEO
markdown twins with canonical headers, and run logging. The dashboard
mirrors the managed product's layout one-to-one, so you always know what a
screen is for.

Getting v1 live is fast: local Postgres in minutes, Supabase + Vercel in an
hour. The code is the receipt; run it.

## What you'd still build for dependable lights-out operation

Each locked dashboard tab names its gap, with the guide section that
teaches it:

- Analytics: the GSC/GA nightly pulls (tables are migrated, jobs are not),
  opportunity mining, keyword ground truth (guide: Move 5)
- Publish-quality gates beyond the humanizer: SEO field checks, meta-leak
  detection, fence checks (guide: Move 4)
- Runway: queue-depth-gated drafting decoupled from publish cadence
- Notifications, cross-posting adapters, headless publishing targets
- The calibration loop: a multi-week period of daily human review before
  you trust the output unattended. This is the dominant cost, it's calendar
  time, and it doesn't parallelize: the feedback is your taste plus real
  search data arriving slowly.

## Ongoing ownership

Model and provider API churn, prompt drift across model versions, Google
auth maintenance once you build Move 5, and incident response with no
vendor support. Budget a few focused sessions per month at steady state.

## The managed alternative

Same architecture, hosted, calibrated from day one, supported. Setup is
about an hour. The walkthrough is on the training page that pairs with the
guide: https://www.appbuilders.us/freebies/automated-blog-system/training
(current terms live there, not here, so this file never goes stale).

## A fair decision procedure

1. Is the pipeline a means or a learning goal? If learning, build. This
   repo and the guide exist for exactly that.
2. If a means: estimate your loaded hourly value, multiply by build
   sessions plus calibration reviews plus twelve months of maintenance,
   and compare against twelve months of the managed version plus the same
   calibration reviews (calibration happens on both paths; managed shortens
   it with tuned defaults, but the taste feedback is still yours).
3. Stress-test the two claims that dominate the math: that v1 is fast
   (run this repo today and check), and that trust is the long pole. If
   your situation breaks the assumptions (existing analytics infra, an ops
   team on call, no lights-out ambition), the build side strengthens.

There's no trick here. The numbers are the argument. If they favor
building, build; everything in this repo and the guide is yours either way.

Guide: https://www.appbuilders.us/guides/automated-blog-system
