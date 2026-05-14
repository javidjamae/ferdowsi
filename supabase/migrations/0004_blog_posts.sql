create table if not exists blog_posts (
  id               bigserial primary key,
  content_idea_id  bigint references content_ideas(id),
  slug             text unique not null,
  title            text not null,
  body_markdown    text not null,
  body_html        text,
  hero_image_url   text,
  meta_description text,
  tags             text[] default '{}',
  related_slugs    text[] default '{}',
  published_at     timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists blog_posts_published_at_idx
  on blog_posts (published_at desc);
