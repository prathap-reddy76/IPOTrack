import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { calculateIpoTrackScore } from '@/lib/ipo-score';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const ipo = await prisma.ipo.findUnique({
      where: { slug, isDeleted: false },
    });

    if (!ipo) {
      return NextResponse.json({ error: 'IPO not found' }, { status: 404 });
    }

    const score = calculateIpoTrackScore({
      gmp: ipo.gmp,
      previousGmp: ipo.previousGmp,
      priceBandMax: Number(ipo.priceBandMax),
      subTotal: Number(ipo.subTotal),
      subRetail: Number(ipo.subRetail),
      subQib: Number(ipo.subQib),
      subNii: Number(ipo.subNii),
      revenue: ipo.revenue ? Number(ipo.revenue) : null,
      profit: ipo.profit ? Number(ipo.profit) : null,
      ebitda: ipo.ebitda ? Number(ipo.ebitda) : null,
      eps: ipo.eps ? Number(ipo.eps) : null,
      roe: ipo.roe ? Number(ipo.roe) : null,
      roce: ipo.roce ? Number(ipo.roce) : null,
      debtToEquity: ipo.debtToEquity ? Number(ipo.debtToEquity) : null,
      industry: ipo.industry,
      sector: ipo.sector,
      ipoType: ipo.ipoType,
    });

    return NextResponse.json(score);
  } catch (error) {
    console.error('Error calculating IPOTrack Score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
