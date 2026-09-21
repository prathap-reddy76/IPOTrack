import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeIpos } from '@/lib/serializers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const sector = searchParams.get('sector');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    const whereClause: Record<string, unknown> = { isDeleted: false };

    if (status && status !== 'all') {
      whereClause.status = { equals: status, mode: 'insensitive' };
    }
    if (type && type !== 'all') {
      whereClause.ipoType = { equals: type, mode: 'insensitive' };
    }
    if (sector && sector !== 'all') {
      whereClause.sector = { equals: sector, mode: 'insensitive' };
    }
    if (search) {
      whereClause.OR = [
        { ipoName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderByClause: Record<string, string> = {};
    if (sort) {
      switch (sort) {
        case 'opening_date': orderByClause = { openDate: 'asc' }; break;
        case 'closing_date': orderByClause = { closeDate: 'asc' }; break;
        case 'gmp': orderByClause = { gmp: 'desc' }; break;
        case 'issue_size': orderByClause = { issueSizeCrore: 'desc' }; break;
        case 'company_name': orderByClause = { ipoName: 'asc' }; break;
      }
    }

    const ipos = await prisma.ipo.findMany({
      where: whereClause,
      orderBy: Object.keys(orderByClause).length ? orderByClause : { createdAt: 'desc' },
    });

    const serialized = serializeIpos(ipos);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('API /api/ipos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
