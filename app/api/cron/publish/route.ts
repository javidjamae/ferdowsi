import { NextResponse } from 'next/server';
import { runPublish } from '@/lib/pipeline/publish';

export const maxDuration = 120;

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await runPublish();
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
