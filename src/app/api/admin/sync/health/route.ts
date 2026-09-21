import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkProviderHealth } from '@/lib/providers/health-check';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const health = await checkProviderHealth();
    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Health check failed' },
      { status: 500 }
    );
  }
}
