-- Snapshot-before-overwrite (guide: Move 4, "Snapshot before every
-- overwrite"). Every write path that replaces a body inserts the PRIOR
-- content here first, so an AI edit or a bad save can never destroy the
-- only copy.
create table if not exists content_revisions (
  id           bigserial primary key,
  entity_type  text not null,     -- 'idea' | 'post'
  entity_id    bigint not null,
  body         text not null,     -- the content BEFORE the overwrite
  title        text,
  cause        text not null,     -- 'manual-edit' | 'ai-edit' | 'rewrite' | 'restore'
  actor        text,
  created_at   timestamptz default now()
);

create index if not exists content_revisions_entity_idx
  on content_revisions (entity_type, entity_id, created_at desc);
