import { NextResponse } from 'next/server';
import { runQueue } from '@/lib/pipeline/queue';

export const maxDuration = 300;

// Thin cron wrapper — the logic lives in lib/pipeline/queue.ts so the
// dashboard's "Generate topics" button runs the exact same code.
export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const force = new URL(request.url).searchParams.get('force') === '1';
  const result = await runQueue({ force });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
