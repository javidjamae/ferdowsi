create table if not exists content_metrics (
  id                   bigserial primary key,
  landing_page         text not null,
  sessions             int,
  signups              int,
  avg_engagement_sec   numeric,
  pulled_at            timestamptz default now()
);

create index if not exists content_metrics_landing_page_idx
  on content_metrics (landing_page);
create index if not exists content_metrics_pulled_at_idx
  on content_metrics (pulled_at desc);
