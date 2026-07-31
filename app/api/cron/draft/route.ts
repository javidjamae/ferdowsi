import { NextResponse } from 'next/server';
import { runDraft } from '@/lib/pipeline/draft';

// Writer runs take minutes (LLM write + humanize passes).
export const maxDuration = 600;

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await runDraft();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
