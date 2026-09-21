import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const ipo = await prisma.ipo.findFirst({
      where: { slug, isDeleted: false },
      select: { id: true },
    });
    
    if (!ipo) {
      return NextResponse.json({ error: 'IPO not found' }, { status: 404 });
    }
    
    const history = await prisma.subscriptionHistory.findMany({
      where: { ipoId: ipo.id },
      orderBy: { date: 'asc' },
    });
    
    return NextResponse.json(history.map(h => ({
      id: h.id,
      date: h.date.toISOString().split('T')[0],
      qib: Number(h.qib),
      nii: Number(h.nii),
      retail: Number(h.retail),
      employee: Number(h.employee),
      total: Number(h.total),
      recordedAt: h.recordedAt.toISOString(),
    })));
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription history' }, { status: 500 });
  }
}
