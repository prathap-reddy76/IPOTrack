import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeIpos } from '@/lib/serializers';
import { NewsArticle } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q') || '';

    if (q.length < 2) {
      return NextResponse.json({ ipos: [], news: [] });
    }

    const dbIpos = await prisma.ipo.findMany({
      where: {
        isDeleted: false,
        OR: [
          { ipoName: { contains: q, mode: 'insensitive' } },
          { companyName: { contains: q, mode: 'insensitive' } },
          { industry: { contains: q, mode: 'insensitive' } },
        ],
      },
    });

    const serialized = serializeIpos(dbIpos);

    // News is static data - import and filter here
    // We import the static data directly since this is a server route
    let newsResults: NewsArticle[] = [];
    try {
      const { newsArticles } = await import('@/data/news');
      const s = q.toLowerCase();
      newsResults = newsArticles.filter((n) =>
        n.title.toLowerCase().includes(s) ||
        (n.excerpt || n.summary || '').toLowerCase().includes(s)
      );
    } catch {
      // If news data import fails, return empty
    }

    return NextResponse.json({ ipos: serialized, news: newsResults });
  } catch (error) {
    console.error('API /api/search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
