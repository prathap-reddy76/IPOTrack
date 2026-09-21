import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const ipos = await prisma.ipo.findMany({
      where: { isDeleted: false },
    });

    const events: { id: string; companyName: string; date: string; type: string; ipoSlug: string; description: string }[] = [];

    ipos.forEach((ipo) => {
      if (ipo.openDate) {
        events.push({
          id: `${ipo.id}-open`,
          companyName: ipo.ipoName,
          date: ipo.openDate.toISOString().split('T')[0],
          type: 'ipo_opens',
          ipoSlug: ipo.slug,
          description: 'IPO Subscription Opens',
        });
      }
      if (ipo.closeDate) {
        events.push({
          id: `${ipo.id}-close`,
          companyName: ipo.ipoName,
          date: ipo.closeDate.toISOString().split('T')[0],
          type: 'ipo_closes',
          ipoSlug: ipo.slug,
          description: 'IPO Subscription Closes',
        });
      }
      if (ipo.allotmentDate) {
        events.push({
          id: `${ipo.id}-allotment`,
          companyName: ipo.ipoName,
          date: ipo.allotmentDate.toISOString().split('T')[0],
          type: 'allotment',
          ipoSlug: ipo.slug,
          description: 'Basis of Allotment',
        });
      }
      if (ipo.listingDate) {
        events.push({
          id: `${ipo.id}-listing`,
          companyName: ipo.ipoName,
          date: ipo.listingDate.toISOString().split('T')[0],
          type: 'listing',
          ipoSlug: ipo.slug,
          description: 'Shares List on Exchange',
        });
      }
    });

    if (monthParam !== null && yearParam !== null) {
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);
      const filtered = events.filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      return NextResponse.json(filtered);
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('API /api/calendar error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
