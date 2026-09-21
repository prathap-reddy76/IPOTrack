import { NextRequest, NextResponse } from 'next/server';
import { syncAll, syncIPOs, syncGMP, syncSubscriptions, syncListings } from '@/lib/sync/sync-service';
import { getDataMode } from '@/lib/providers';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env['CRON_SECRET'];
  
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const mode = getDataMode();
  if (mode === 'demo') {
    return NextResponse.json({
      message: 'Skipped: DATA_MODE is demo. Set DATA_MODE=live to enable cron sync.',
      mode,
    });
  }
  
  try {
    const type = request.nextUrl.searchParams.get('type');
    
    let results;
    switch (type?.toUpperCase()) {
      case 'IPO':
        results = [await syncIPOs()];
        break;
      case 'GMP':
        results = [await syncGMP()];
        break;
      case 'SUBSCRIPTION':
        results = [await syncSubscriptions()];
        break;
      case 'LISTING':
        results = [await syncListings()];
        break;
      default:
        results = await syncAll();
        break;
    }
    
    return NextResponse.json({ success: true, mode, results });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      { status: 500 }
    );
  }
}
