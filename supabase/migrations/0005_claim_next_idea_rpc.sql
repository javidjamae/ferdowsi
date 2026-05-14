-- claim_next_idea: atomically pull the highest-priority idea row and flip its status to 'drafting'.
-- Used by the draft cron so concurrent runs don't race on the same row.

create or replace function claim_next_idea()
returns table (
  id           bigint,
  title        text,
  description  text,
  priority     int,
  source       text
)
language plpgsql
as $$
declare
  claimed_id bigint;
begin
  with next_idea as (
    select content_ideas.id
    from content_ideas
    where content_ideas.status = 'idea'
    order by content_ideas.priority asc, content_ideas.created_at asc
    limit 1
    for update skip locked
  )
  update content_ideas
  set status = 'drafting', updated_at = now()
  where content_ideas.id in (select next_idea.id from next_idea)
  returning content_ideas.id into claimed_id;

  if claimed_id is null then
    return;
  end if;

  return query
  select
    content_ideas.id,
    content_ideas.title,
    content_ideas.description,
    content_ideas.priority,
    content_ideas.source
  from content_ideas
  where content_ideas.id = claimed_id;
end;
$$;
