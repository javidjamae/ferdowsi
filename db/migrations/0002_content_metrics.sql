-- Google Analytics per-post metrics land here (guide: Move 5). Shipped
-- empty by the free scaffold; the guide gives you the mechanics for the
-- nightly GA Data API pull that fills it. Columns match the guide's
-- reference schema exactly.
create table if not exists content_metrics (
  id                    bigserial primary key,
  post_id               bigint,
  sessions              int,
  engaged_sessions      int,
  avg_session_duration  numeric,
  signups_attributed    int,
  date                  date not null,
  pulled_at             timestamptz default now()
);

create index if not exists content_metrics_post_date_idx
  on content_metrics (post_id, date desc);
