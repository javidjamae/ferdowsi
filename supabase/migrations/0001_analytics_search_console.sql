create table if not exists analytics_search_console (
  id            bigserial primary key,
  query         text not null,
  page          text,
  impressions   int,
  clicks        int,
  ctr           numeric,
  position      numeric,
  pulled_at     timestamptz default now()
);

create index if not exists analytics_search_console_query_idx
  on analytics_search_console (query);
create index if not exists analytics_search_console_pulled_at_idx
  on analytics_search_console (pulled_at desc);
