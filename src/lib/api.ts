import { IPO, GMPRecord, GMPHistoryPoint, SubscriptionData, SubscriptionHistory, CalendarEvent, NewsArticle, LearnArticle } from '@/types';
import { newsArticles } from '@/data/news';
import { learnArticles } from '@/data/learn';

interface RawIpoData {
  id: string;
  slug: string;
  ipoName: string;
  ipoType: string;
  status: string;
  priceBandMin: number;
  priceBandMax: number;
  gmp: number;
  previousGmp: number;
  lotSize: number;
  issueSize: string;
  issueSizeCrore: number;
  openDate: string | null;
  closeDate: string | null;
  allotmentDate: string | null;
  listingDate: string | null;
  industry: string;
  sector: string;
  about: string;
  promoters: string[];
  registrar: string;
  leadManagers: string[];
  location: string;
  subQib: number;
  subNii: number;
  subRetail: number;
  subEmployee: number;
  subTotal: number;
  faceValue: number;
  refundDate: string | null;
  dematDate: string | null;
  listingPrice: number | null;
  // Financial data
  revenue: number | null;
  profit: number | null;
  ebitda: number | null;
  totalAssets: number | null;
  netWorth: number | null;
  eps: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  // Exchange / Company
  exchange: string | null;
  marketMaker: string | null;
  freshIssue: string | null;
  ofs: string | null;
  gmpHistory?: { recordedAt?: string; date?: string; gmp: number }[];
  [key: string]: unknown;
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function transformIpoToLegacy(ipo: RawIpoData): IPO {
  const priceBandMin = Number(ipo.priceBandMin) || 0;
  const priceBandMax = Number(ipo.priceBandMax) || 0;
  const gmp = Number(ipo.gmp) || 0;
  const estimatedListing = priceBandMax > 0 ? priceBandMax + gmp : 0;
  const expectedGainPercent = priceBandMax > 0 ? ((gmp) / priceBandMax) * 100 : 0;
  return {
    id: ipo.id,
    slug: ipo.slug,
    name: ipo.ipoName,
    type: ipo.ipoType,
    status: ipo.status,
    priceBand: priceBandMax > 0 ? `₹${priceBandMin}-${priceBandMax}` : 'TBA',
    gmp: gmp,
    previousGmp: Number(ipo.previousGmp) || 0,
    lotSize: ipo.lotSize || 0,
    sharesPerLot: ipo.lotSize || 0,
    issueSize: ipo.issueSize || (Number(ipo.issueSizeCrore) > 0 ? `₹${Number(ipo.issueSizeCrore).toLocaleString('en-IN')} Cr` : 'TBA'),
    openDate: formatDisplayDate(ipo.openDate),
    closeDate: formatDisplayDate(ipo.closeDate),
    allotmentDate: ipo.allotmentDate ? formatDisplayDate(ipo.allotmentDate) : undefined,
    refundDate: ipo.refundDate ? formatDisplayDate(ipo.refundDate) : undefined,
    dematDate: ipo.dematDate ? formatDisplayDate(ipo.dematDate) : undefined,
    listingDate: ipo.listingDate ? formatDisplayDate(ipo.listingDate) : undefined,
    industry: ipo.industry || '',
    sector: ipo.sector || '',
    about: ipo.about || '',
    promoters: ipo.promoters || [],
    registrar: ipo.registrar || '',
    leadManagers: ipo.leadManagers || [],
    location: ipo.location || '',
    subscription: {
      qib: Number(ipo.subQib) || 0,
      nii: Number(ipo.subNii) || 0,
      retail: Number(ipo.subRetail) || 0,
      employee: Number(ipo.subEmployee) || 0,
      total: Number(ipo.subTotal) || 0,
    },
    financials: [],
    documents: [],
    gmpHistory: (ipo.gmpHistory || []).map((h: { recordedAt?: string; date?: string; gmp: number }) => ({
      date: h.recordedAt ? h.recordedAt.split('T')[0] : (h.date || ''),
      gmp: Number(h.gmp) || 0,
    })),
    faceValue: Number(ipo.faceValue) || 10,
    freshIssue: ipo.freshIssue || undefined,
    ofs: ipo.ofs || undefined,
    minInvestment: priceBandMax > 0 ? priceBandMax * (ipo.lotSize || 0) : 0,
    listingPrice: ipo.listingPrice != null ? Number(ipo.listingPrice) : undefined,
    // Financial data
    revenue: ipo.revenue != null ? Number(ipo.revenue) : undefined,
    profit: ipo.profit != null ? Number(ipo.profit) : undefined,
    ebitda: ipo.ebitda != null ? Number(ipo.ebitda) : undefined,
    totalAssets: ipo.totalAssets != null ? Number(ipo.totalAssets) : undefined,
    netWorth: ipo.netWorth != null ? Number(ipo.netWorth) : undefined,
    eps: ipo.eps != null ? Number(ipo.eps) : undefined,
    roe: ipo.roe != null ? Number(ipo.roe) : undefined,
    roce: ipo.roce != null ? Number(ipo.roce) : undefined,
    debtToEquity: ipo.debtToEquity != null ? Number(ipo.debtToEquity) : undefined,
    // Exchange / Company
    exchange: ipo.exchange || undefined,
    marketMaker: ipo.marketMaker || undefined,
    // Computed
    estimatedListing,
    expectedGainPercent: Math.round(expectedGainPercent * 100) / 100,
  };
}

export async function getIPOs(filters?: { status?: string; type?: string; sector?: string; search?: string; sort?: string }): Promise<IPO[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters?.sector && filters.sector !== 'all') params.set('sector', filters.sector);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sort) params.set('sort', filters.sort);

    const url = `${getBaseUrl()}/api/ipos${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];

    const ipos = await res.json();
    const legacyIpos = ipos.map(transformIpoToLegacy);

    if (filters?.sort === 'gmp_percent') {
      legacyIpos.sort((a: IPO, b: IPO) => {
        const pA_max = Number(a.priceBand.replace(/[₹,]/g, '').split('-')[1] || 0);
        const pB_max = Number(b.priceBand.replace(/[₹,]/g, '').split('-')[1] || 0);
        const percA = pA_max > 0 ? (a.gmp / pA_max) * 100 : 0;
        const percB = pB_max > 0 ? (b.gmp / pB_max) * 100 : 0;
        return percB - percA;
      });
    }

    return legacyIpos;
  } catch (error) {
    console.error('Error in getIPOs:', error);
    return [];
  }
}

export async function getIPOBySlug(slug: string): Promise<IPO | undefined> {
  try {
    if (!slug) return undefined;
    const url = `${getBaseUrl()}/api/ipos/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return undefined;

    const ipo = await res.json();
    return transformIpoToLegacy(ipo);
  } catch (error) {
    console.error('Error in getIPOBySlug:', error);
    return undefined;
  }
}

export async function getGMPUpdates(filter?: string): Promise<GMPRecord[]> {
  try {
    const params = new URLSearchParams();
    if (filter) params.set('filter', filter);

    const url = `${getBaseUrl()}/api/gmp${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error('Error in getGMPUpdates:', error);
    return [];
  }
}

export async function getGMPHistory(slug: string, range?: string): Promise<GMPHistoryPoint[]> {
  try {
    if (!slug) return [];
    const params = new URLSearchParams({ slug });
    if (range) params.set('range', range);

    const url = `${getBaseUrl()}/api/gmp/history?${params.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error('Error in getGMPHistory:', error);
    return [];
  }
}

export async function getSubscriptionData(slug: string): Promise<SubscriptionData | undefined> {
  try {
    const ipo = await getIPOBySlug(slug);
    return ipo?.subscription;
  } catch (error) {
    console.error('Error in getSubscriptionData:', error);
    return undefined;
  }
}

export async function getSubscriptionHistory(_slug: string): Promise<SubscriptionHistory[]> {
  return [];
}

export async function getCalendarEvents(month?: number, year?: number): Promise<CalendarEvent[]> {
  try {
    const params = new URLSearchParams();
    if (month !== undefined) params.set('month', month.toString());
    if (year !== undefined) params.set('year', year.toString());

    const url = `${getBaseUrl()}/api/calendar${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];

    return await res.json();
  } catch (error) {
    console.error('Error in getCalendarEvents:', error);
    return [];
  }
}

export async function getNews(category?: string, search?: string): Promise<NewsArticle[]> {
  let news = [...newsArticles];
  if (category && category !== 'all') {
    news = news.filter(n => n.category === category);
  }
  if (search) {
    const s = search.toLowerCase();
    news = news.filter(n =>
      n.title.toLowerCase().includes(s) ||
      (n.excerpt || n.summary || '').toLowerCase().includes(s)
    );
  }
  return news;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  return newsArticles.find(n => n.slug === slug);
}

export async function getLearnArticles(category?: string, search?: string): Promise<LearnArticle[]> {
  let articles = [...learnArticles];
  if (category && category !== 'all') {
    articles = articles.filter(a => a.category === category);
  }
  if (search) {
    const s = search.toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(s) ||
      a.excerpt.toLowerCase().includes(s)
    );
  }
  return articles;
}

export async function getLearnArticleBySlug(slug: string): Promise<LearnArticle | undefined> {
  return learnArticles.find(a => a.slug === slug);
}

export async function searchAll(query: string): Promise<{ ipos: IPO[]; news: NewsArticle[] }> {
  try {
    if (query.length < 2) return { ipos: [], news: [] };

    const url = `${getBaseUrl()}/api/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { ipos: [], news: [] };

    const data = await res.json();
    const ipos = (data.ipos || []).map(transformIpoToLegacy);
    return { ipos, news: data.news || [] };
  } catch (error) {
    console.error('Error in searchAll:', error);
    return { ipos: [], news: [] };
  }
}
