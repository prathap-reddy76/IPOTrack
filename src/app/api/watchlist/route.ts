import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeIpo } from '@/lib/serializers';
import { getAuthUserId } from '@/lib/api-auth';

export async function GET() {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const watchlistItems = await prisma.watchlistItem.findMany({
      where: { userId },
      include: { ipo: true },
    });

    const items = watchlistItems.map(item => ({
      ...item,
      ipo: serializeIpo(item.ipo),
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ipoId, ipoSlug } = body;

    if (!ipoId && !ipoSlug) {
      return NextResponse.json({ error: 'ipoId or ipoSlug is required' }, { status: 400 });
    }

    let finalIpoId = ipoId;

    if (ipoSlug) {
      const ipo = await prisma.ipo.findUnique({
        where: { slug: ipoSlug },
      });
      if (!ipo) {
        return NextResponse.json({ error: 'IPO not found' }, { status: 404 });
      }
      finalIpoId = ipo.id;
    }

    // Check if already exists
    const existing = await prisma.watchlistItem.findUnique({
      where: {
        userId_ipoId: {
          userId,
          ipoId: finalIpoId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'IPO already in watchlist' }, { status: 409 });
    }

    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        userId,
        ipoId: finalIpoId,
      },
      include: { ipo: true },
    });

    return NextResponse.json({
      ...watchlistItem,
      ipo: serializeIpo(watchlistItem.ipo),
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ipoId = searchParams.get('ipoId');
    const ipoSlug = searchParams.get('ipoSlug');

    if (!ipoId && !ipoSlug) {
      return NextResponse.json({ error: 'ipoId or ipoSlug is required' }, { status: 400 });
    }

    let finalIpoId = ipoId;

    if (ipoSlug) {
      const ipo = await prisma.ipo.findUnique({
        where: { slug: ipoSlug },
      });
      if (!ipo) {
        return NextResponse.json({ error: 'IPO not found' }, { status: 404 });
      }
      finalIpoId = ipo.id;
    }

    if (!finalIpoId) {
       return NextResponse.json({ error: 'ipoId is required' }, { status: 400 });
    }

    await prisma.watchlistItem.delete({
      where: {
        userId_ipoId: {
          userId,
          ipoId: finalIpoId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ success: true }); // Already deleted
    }
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
