-- One row per pipeline job run (queue / draft / publish), written by the
-- shared pipeline functions. Powers the admin Runs tab, which is how you
-- watch the system work without tailing logs.
create table if not exists pipeline_runs (
  id           bigserial primary key,
  job          text not null,           -- 'queue' | 'draft' | 'publish'
  status       text not null default 'running',  -- 'running' | 'ok' | 'error'
  detail       jsonb not null default '{}',
  started_at   timestamptz default now(),
  finished_at  timestamptz
);

create index if not exists pipeline_runs_started_idx
  on pipeline_runs (started_at desc);
