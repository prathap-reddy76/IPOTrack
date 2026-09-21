'use server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

import { serializeIpo } from '@/lib/serializers';

export async function getAdminStats() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  
  const [total, upcoming, open, closed, listed, recentGmp, recentIpos] = await Promise.all([
    prisma.ipo.count({ where: { isDeleted: false } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Upcoming' } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Open' } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Closed' } }),
    prisma.ipo.count({ where: { isDeleted: false, status: 'Listed' } }),
    prisma.gmpHistory.findMany({
      take: 5,
      orderBy: { recordedAt: 'desc' },
      include: { ipo: { select: { ipoName: true, slug: true } } },
    }),
    prisma.ipo.findMany({
      where: { isDeleted: false },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, ipoName: true, status: true, priceBandMin: true, priceBandMax: true, createdAt: true, slug: true },
    }),
  ]);
  
  return { 
    total, upcoming, open, closed, listed, 
    recentGmp: recentGmp.map(g => ({
      ...g,
      estimatedListingPrice: g.estimatedListingPrice != null ? Number(g.estimatedListingPrice) : null,
      estimatedGainPercent: g.estimatedGainPercent != null ? Number(g.estimatedGainPercent) : null,
      recordedAt: g.recordedAt.toISOString(),
    })),
    recentIpos: recentIpos.map(ipo => ({
      ...ipo,
      priceBandMin: Number(ipo.priceBandMin),
      priceBandMax: Number(ipo.priceBandMax),
      createdAt: ipo.createdAt.toISOString(),
    }))
  };
}

export async function getAdminIPOs(search?: string, status?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  
  const where: Record<string, unknown> = {};
  if (status && status !== 'all') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { ipoName: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
    ];
  }
  const ipos = await prisma.ipo.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });
  return ipos.map(ipo => serializeIpo(ipo));
}

export async function getIPOById(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (!id) return null;
  const ipo = await prisma.ipo.findUnique({ where: { id } });
  if (!ipo) return null;
  return serializeIpo(ipo);
}

export async function getIPOGmpHistory(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (!id) return { ipo: null, history: [] };
  
  const ipo = await prisma.ipo.findUnique({ 
    where: { id }, 
    select: { id: true, ipoName: true, gmp: true, priceBandMax: true } 
  });
  if (!ipo) return { ipo: null, history: [] };
  
  const history = await prisma.gmpHistory.findMany({
    where: { ipoId: id },
    orderBy: { recordedAt: 'desc' },
  });
  
  return { 
    ipo: { ...ipo, priceBandMax: Number(ipo.priceBandMax) },
    history: history.map(h => ({
      ...h,
      estimatedListingPrice: h.estimatedListingPrice != null ? Number(h.estimatedListingPrice) : null,
      estimatedGainPercent: h.estimatedGainPercent != null ? Number(h.estimatedGainPercent) : null,
      recordedAt: h.recordedAt.toISOString(),
    }))
  };
}
