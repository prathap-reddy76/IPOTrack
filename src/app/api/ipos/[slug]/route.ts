import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeIpo, serializeGmpHistoryArray } from '@/lib/serializers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const ipo = await prisma.ipo.findUnique({
      where: { slug, isDeleted: false },
      include: { gmpHistory: { orderBy: { recordedAt: 'asc' } } },
    });

    if (!ipo) {
      return NextResponse.json({ error: 'IPO not found' }, { status: 404 });
    }

    const serializedIpo = serializeIpo(ipo);
    if (!serializedIpo) {
      return NextResponse.json({ error: 'IPO not found' }, { status: 404 });
    }

    const result = {
      ...serializedIpo,
      gmpHistory: serializeGmpHistoryArray(ipo.gmpHistory),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('API /api/ipos/[slug] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
