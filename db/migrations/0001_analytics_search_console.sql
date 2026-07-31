-- Search Console daily pull lands here (guide: Move 5). The free scaffold
-- ships the table but NOT the ingestion job; the guide gives you the
-- mechanics to build it (nightly GSC API pull, last 28 days, domain
-- property). Columns match the guide's reference schema exactly.
create table if not exists analytics_search_console (
  id            bigserial primary key,
  query         text not null,
  page          text,
  impressions   int,
  clicks        int,
  ctr           numeric,
  position      numeric,
  date          date not null,
  pulled_at     timestamptz default now()
);

create index if not exists analytics_search_console_query_idx
  on analytics_search_console (query);
create index if not exists analytics_search_console_page_date_idx
  on analytics_search_console (page, date desc);
create index if not exists analytics_search_console_date_impr_idx
  on analytics_search_console (date desc, impressions desc);
