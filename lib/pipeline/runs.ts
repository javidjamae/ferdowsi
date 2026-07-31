import { query } from '@/lib/db';

// Every pipeline job records a run row (admin Runs tab reads these).
// startRun/finishRun bracket the job; a crash leaves status 'running' and
// the real story in your platform logs.

export async function startRun(job: string): Promise<number> {
  const [row] = await query<{ id: number }>(
    `INSERT INTO pipeline_runs (job) VALUES ($1) RETURNING id`,
    [job]
  );
  return row.id;
}

export async function finishRun(
  id: number,
  status: 'ok' | 'error',
  detail: Record<string, unknown>
): Promise<void> {
  await query(
    `UPDATE pipeline_runs SET status = $2, detail = $3, finished_at = now() WHERE id = $1`,
    [id, status, JSON.stringify(detail)]
  );
}

/** Run a job with run-recording around it. Returns the detail (with error captured). */
export async function withRun(
  job: string,
  fn: () => Promise<Record<string, unknown>>
): Promise<{ runId: number; ok: boolean; detail: Record<string, unknown> }> {
  const runId = await startRun(job);
  try {
    const detail = await fn();
    await finishRun(runId, 'ok', detail);
    return { runId, ok: true, detail };
  } catch (err) {
    const detail = { error: err instanceof Error ? err.message : String(err) };
    await finishRun(runId, 'error', detail);
    return { runId, ok: false, detail };
  }
}
