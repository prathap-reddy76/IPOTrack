import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const filter = searchParams.get('filter');

    const whereClause: Record<string, unknown> = { isDeleted: false, gmp: { gt: 0 } };
    if (filter === 'sme') {
      whereClause.ipoType = { equals: 'SME', mode: 'insensitive' };
    } else if (filter === 'mainboard') {
      whereClause.ipoType = { equals: 'Mainboard', mode: 'insensitive' };
    }

    const ipos = await prisma.ipo.findMany({
      where: whereClause,
      orderBy: { gmpUpdatedAt: 'desc' },
    });

    const records = ipos.map((ipo) => {
      const priceBandMax = Number(ipo.priceBandMax);
      const change = ipo.gmp - ipo.previousGmp;
      const changePercent = ipo.previousGmp > 0
        ? parseFloat(((change / ipo.previousGmp) * 100).toFixed(1))
        : 0;

      return {
        ipoId: ipo.id,
        companyName: ipo.ipoName,
        slug: ipo.slug,
        ipoType: ipo.ipoType,
        currentGmp: ipo.gmp,
        previousGmp: ipo.previousGmp,
        change,
        changePercent,
        trend: ipo.gmp > ipo.previousGmp ? 'up' : ipo.gmp < ipo.previousGmp ? 'down' : 'stable',
        lastUpdated: (ipo.gmpUpdatedAt ?? ipo.updatedAt).toISOString(),
        priceBandMax,
      };
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('API /api/gmp error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
