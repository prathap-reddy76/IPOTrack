import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [totalIpos, upcoming, open, closed, listed, totalUsers, totalWatchlist] = await Promise.all([
    prisma.ipo.count({ where: { isDeleted: false } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Upcoming' } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Open' } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Closed' } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Listed' } }),
    prisma.user.count(),
    prisma.watchlistItem.count(),
  ]);
  
  const recentIpos = await prisma.ipo.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, ipoName: true, status: true, slug: true, createdAt: true, priceBandMin: true, priceBandMax: true, gmp: true }
  });
  
  return NextResponse.json({
    totalIpos, upcoming, open, closed, listed, totalUsers, totalWatchlist,
    recentIpos: recentIpos.map(ipo => ({
      ...ipo,
      priceBandMin: Number(ipo.priceBandMin),
      priceBandMax: Number(ipo.priceBandMax),
      createdAt: ipo.createdAt.toISOString(),
    }))
  });
}
