import 'server-only';
import { ProviderIpoData } from '@/lib/providers/types';

/**
 * NormalizedIpoData — matches the Prisma Ipo model fields exactly.
 * All Decimal fields are represented as number for safe comparison.
 */
export interface NormalizedIpoData {
  slug: string;
  ipoName: string;
  companyName: string;
  ipoType: string;
  status: string;

  openDate: Date | null;
  closeDate: Date | null;
  allotmentDate: Date | null;
  listingDate: Date | null;
  refundDate: Date | null;
  dematDate: Date | null;

  priceBandMin: number;
  priceBandMax: number;
  lotSize: number;
  issueSize: string | null;
  issueSizeCrore: number;
  faceValue: number;
  freshIssue: string | null;
  ofs: string | null;

  gmp: number;

  subTotal: number;
  subRetail: number;
  subQib: number;
  subNii: number;
  subEmployee: number;

  listingPrice: number | null;

  // Financial
  revenue: number | null;
  profit: number | null;
  ebitda: number | null;
  totalAssets: number | null;
  netWorth: number | null;
  eps: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;

  // Company
  exchange: string | null;
  marketMaker: string | null;
  industry: string;
  sector: string;
  about: string;
  promoters: string[];
  registrar: string;
  leadManagers: string[];
  location: string;
}

// ── Normalization helpers ──────────────────────────────────

export function normalizeDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  return isNaN(num) || !isFinite(num) ? null : num;
}

export function normalizeRequiredNumber(value: number | string | null | undefined, defaultValue: number): number {
  const num = normalizeNumber(value);
  return num === null ? defaultValue : num;
}

export function normalizeString(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim();
}

export function normalizeSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert raw provider data to database-ready normalized format.
 */
export function normalizeIpoData(raw: ProviderIpoData): NormalizedIpoData {
  return {
    slug: raw.slug || normalizeSlug(raw.ipoName),
    ipoName: normalizeString(raw.ipoName),
    companyName: normalizeString(raw.companyName) || normalizeString(raw.ipoName),
    ipoType: normalizeString(raw.ipoType) || 'Mainboard',
    status: normalizeString(raw.status) || 'Upcoming',

    openDate: normalizeDate(raw.openDate),
    closeDate: normalizeDate(raw.closeDate),
    allotmentDate: normalizeDate(raw.allotmentDate),
    listingDate: normalizeDate(raw.listingDate),
    refundDate: normalizeDate(raw.refundDate),
    dematDate: normalizeDate(raw.dematDate),

    priceBandMin: normalizeRequiredNumber(raw.priceBandMin, 0),
    priceBandMax: normalizeRequiredNumber(raw.priceBandMax, 0),
    lotSize: normalizeRequiredNumber(raw.lotSize, 0),
    issueSize: raw.issueSize ?? null,
    issueSizeCrore: normalizeRequiredNumber(raw.issueSizeCrore, 0),
    faceValue: normalizeRequiredNumber(raw.faceValue, 10),
    freshIssue: raw.freshIssue ?? null,
    ofs: raw.ofs ?? null,

    gmp: normalizeRequiredNumber(raw.gmp, 0),

    subTotal: normalizeRequiredNumber(raw.subTotal, 0),
    subRetail: normalizeRequiredNumber(raw.subRetail, 0),
    subQib: normalizeRequiredNumber(raw.subQib, 0),
    subNii: normalizeRequiredNumber(raw.subNii, 0),
    subEmployee: normalizeRequiredNumber(raw.subEmployee, 0),

    listingPrice: normalizeNumber(raw.listingPrice),

    revenue: normalizeNumber(raw.revenue),
    profit: normalizeNumber(raw.profit),
    ebitda: normalizeNumber(raw.ebitda),
    totalAssets: normalizeNumber(raw.totalAssets),
    netWorth: normalizeNumber(raw.netWorth),
    eps: normalizeNumber(raw.eps),
    roe: normalizeNumber(raw.roe),
    roce: normalizeNumber(raw.roce),
    debtToEquity: normalizeNumber(raw.debtToEquity),

    exchange: raw.exchange ?? null,
    marketMaker: raw.marketMaker ?? null,
    industry: normalizeString(raw.industry),
    sector: normalizeString(raw.sector),
    about: normalizeString(raw.about),
    promoters: raw.promoters ?? [],
    registrar: normalizeString(raw.registrar),
    leadManagers: raw.leadManagers ?? [],
    location: normalizeString(raw.location),
  };
}
