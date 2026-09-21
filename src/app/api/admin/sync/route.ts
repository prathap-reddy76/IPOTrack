import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { syncIPOs, syncGMP, syncSubscriptions, syncListings, syncAll } from '@/lib/sync/sync-service';
import { getProviderInfo } from '@/lib/providers';

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const types = ['IPO', 'GMP', 'SUBSCRIPTION', 'LISTING', 'NEWS'];

    const latestLogs = await Promise.all(
      types.map(async (type) => {
        const log = await prisma.syncLog.findFirst({
          where: { type },
          orderBy: { startedAt: 'desc' },
        });
        return {
          type,
          log: log ? {
            ...log,
            startedAt: log.startedAt.toISOString(),
            completedAt: log.completedAt?.toISOString() ?? null,
          } : null,
        };
      })
    );

    return NextResponse.json({ logs: latestLogs, provider: getProviderInfo() });
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json({ error: 'Failed to fetch sync logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, dryRun = false } = body as { type?: string; dryRun?: boolean };

    const options = { dryRun };

    let results;
    switch (type?.toUpperCase()) {
      case 'IPO':
        results = [await syncIPOs(options)];
        break;
      case 'GMP':
        results = [await syncGMP(options)];
        break;
      case 'SUBSCRIPTION':
        results = [await syncSubscriptions(options)];
        break;
      case 'LISTING':
        results = [await syncListings(options)];
        break;
      default:
        results = await syncAll(options);
        break;
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    console.error('Admin sync error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
