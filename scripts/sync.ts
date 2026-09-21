/**
 * CLI Sync Script
 * Usage:
 *   npm run sync          # run full sync (requires dev server running)
 *   npm run sync:dry      # dry-run (queries DB directly, no server needed)
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load .env.local (Next.js doesn't do this for standalone scripts)
config({ path: '.env.local' });
config({ path: '.env' });

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run') || args.includes('--dry');
  const syncType = args.find(a => !a.startsWith('--'))?.toUpperCase();

  const dataMode = process.env['DATA_MODE'] || 'demo';
  const ipoProvider = process.env['IPO_DATA_PROVIDER'] || 'none';
  const hasUpstoxToken = !!process.env['UPSTOX_ACCESS_TOKEN'];
  const hasIpoAlertsKey = !!process.env['IPOALERTS_API_KEY'];

  console.log('╔══════════════════════════════════════╗');
  console.log('║       IPOTrack Sync Service          ║');
  console.log('╚══════════════════════════════════════╝');
  console.log();
  console.log(`Mode:         ${dataMode.toUpperCase()}`);
  console.log(`Dry Run:      ${isDryRun ? 'YES (no DB changes)' : 'NO (will modify DB)'}`);
  console.log(`Type:         ${syncType || 'ALL'}`);
  console.log(`IPO Provider: ${ipoProvider}${hasUpstoxToken ? ' ✅' : ' ❌ (no token)'}`);
  console.log(`GMP Provider: ${hasIpoAlertsKey ? 'ipoalerts.in ✅' : 'none ❌ (no key)'}`);
  console.log();

  if (dataMode === 'demo') {
    console.log('⚠️  DATA_MODE=demo — sync will use local database data.');
    console.log('   Set DATA_MODE=live and configure providers for real sync.');
    console.log();
  }

  const prisma = new PrismaClient();

  try {
    if (isDryRun) {
      // Dry-run: query DB directly, no server needed
      console.log('📊 Checking current database state...');
      console.log();

      const [ipoCount, upcomingCount, openCount, closedCount, listedCount, gmpHistoryCount, subHistoryCount, syncLogCount] = await Promise.all([
        prisma.ipo.count({ where: { isDeleted: false } }),
        prisma.ipo.count({ where: { isDeleted: false, status: 'Upcoming' } }),
        prisma.ipo.count({ where: { isDeleted: false, status: 'Open' } }),
        prisma.ipo.count({ where: { isDeleted: false, status: 'Closed' } }),
        prisma.ipo.count({ where: { isDeleted: false, status: 'Listed' } }),
        prisma.gmpHistory.count(),
        prisma.subscriptionHistory.count(),
        prisma.syncLog.count(),
      ]);

      console.log('Current Database State:');
      console.log(`  Total IPOs:              ${ipoCount}`);
      console.log(`  ├ Upcoming:              ${upcomingCount}`);
      console.log(`  ├ Open:                  ${openCount}`);
      console.log(`  ├ Closed:                ${closedCount}`);
      console.log(`  └ Listed:                ${listedCount}`);
      console.log(`  GMP History Records:     ${gmpHistoryCount}`);
      console.log(`  Subscription Snapshots:  ${subHistoryCount}`);
      console.log(`  Sync Log Entries:        ${syncLogCount}`);
      console.log();

      // Show latest sync for each type
      const types = ['IPO', 'GMP', 'SUBSCRIPTION', 'LISTING'];
      console.log('Last Sync Status:');
      for (const type of types) {
        const log = await prisma.syncLog.findFirst({
          where: { type },
          orderBy: { startedAt: 'desc' },
        });
        if (log) {
          const duration = log.duration ? `${log.duration}ms` : 'N/A';
          console.log(`  ${type.padEnd(14)} ${log.status.padEnd(10)} ${log.startedAt.toISOString().replace('T', ' ').substring(0, 19)}  (${duration})  C:${log.recordsCreated} U:${log.recordsUpdated} F:${log.recordsFailed}`);
        } else {
          console.log(`  ${type.padEnd(14)} Never synced`);
        }
      }
      console.log();

      if (dataMode === 'demo') {
        console.log('✅ Dry run complete. No changes would be made in demo mode.');
        console.log('   The demo provider reads existing DB data — sync would report all records as unchanged.');
      } else {
        console.log('ℹ️  To run a live sync, use: npm run sync');
        console.log('   (Requires dev server running: npm run dev)');
      }
    } else {
      // Live sync: call the cron API endpoint
      const cronSecret = process.env['CRON_SECRET'];
      if (!cronSecret) {
        console.log('❌ CRON_SECRET not set in environment.');
        console.log('   Add CRON_SECRET=yoursecret to .env.local');
        process.exit(1);
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      console.log(`Connecting to: ${baseUrl}`);
      console.log();

      try {
        const url = new URL('/api/cron/sync', baseUrl);
        if (syncType) url.searchParams.set('type', syncType);

        const response = await fetch(url.toString(), {
          headers: { 'Authorization': `Bearer ${cronSecret}` },
        });

        const result = await response.json();

        if (response.ok) {
          console.log('✅ Sync completed successfully!');
          console.log();
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('❌ Sync failed:');
          console.log(JSON.stringify(result, null, 2));
          process.exit(1);
        }
      } catch (fetchError) {
        if (fetchError instanceof TypeError && String(fetchError).includes('fetch')) {
          console.log('❌ Could not connect to the Next.js server.');
          console.log('   Make sure the dev server is running: npm run dev');
          console.log('   Or use the admin panel at /admin/sync');
        } else {
          throw fetchError;
        }
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
