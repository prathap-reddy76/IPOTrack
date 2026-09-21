import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get('slug');
    const range = searchParams.get('range');

    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const ipo = await prisma.ipo.findUnique({ where: { slug, isDeleted: false } });
    if (!ipo) {
      return NextResponse.json([]);
    }

    let dateFilter: Record<string, Date> = {};
    if (range) {
      const now = new Date();
      if (range === '7d') {
        dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      } else if (range === '1m') {
        dateFilter = { gte: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()) };
      } else if (range === '3m') {
        dateFilter = { gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()) };
      }
    }

    const history = await prisma.gmpHistory.findMany({
      where: {
        ipoId: ipo.id,
        ...(Object.keys(dateFilter).length > 0 ? { recordedAt: dateFilter } : {}),
      },
      orderBy: { recordedAt: 'asc' },
    });

    const result = history.map((h) => ({
      date: h.recordedAt.toISOString().split('T')[0],
      gmp: h.gmp,
      sub: 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/gmp/history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
