create table if not exists content_ideas (
  id              bigserial primary key,
  title           text not null,
  description     text,
  body            text,
  status          text not null default 'idea',
  priority        int default 3,
  source          text,
  tags            text[] default '{}',
  slug            text,
  image_url       text,
  related_posts   text[] default '{}',
  notes           text,
  reviewed_by     text,
  reviewed_at     timestamptz,
  published_url   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists content_ideas_status_priority_idx
  on content_ideas (status, priority);
create index if not exists content_ideas_source_idx
  on content_ideas (source);
