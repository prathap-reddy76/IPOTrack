import 'server-only';
import { Prisma } from '@prisma/client';

type PrismaIpo = Prisma.IpoGetPayload<object>;
type PrismaGmpHistory = Prisma.GmpHistoryGetPayload<object>;
type PrismaSubscriptionHistory = Prisma.SubscriptionHistoryGetPayload<object>;

const toNum = (val: unknown): number => (val != null ? Number(val) : 0);
const toNumOrNull = (val: unknown): number | null => (val != null ? Number(val) : null);
const toDateStr = (val: unknown): string | null => (val instanceof Date ? val.toISOString() : val ? String(val) : null);

export function serializeIpo(ipo: PrismaIpo | null) {
  if (!ipo) return null;
  return {
    ...ipo,
    priceBandMin: toNum(ipo.priceBandMin),
    priceBandMax: toNum(ipo.priceBandMax),
    issueSizeCrore: toNum(ipo.issueSizeCrore),
    faceValue: toNum(ipo.faceValue),
    subTotal: toNum(ipo.subTotal),
    subRetail: toNum(ipo.subRetail),
    subQib: toNum(ipo.subQib),
    subNii: toNum(ipo.subNii),
    subEmployee: toNum(ipo.subEmployee),
    listingPrice: toNumOrNull(ipo.listingPrice),
    // Financial fields
    revenue: toNumOrNull(ipo.revenue),
    profit: toNumOrNull(ipo.profit),
    ebitda: toNumOrNull(ipo.ebitda),
    totalAssets: toNumOrNull(ipo.totalAssets),
    netWorth: toNumOrNull(ipo.netWorth),
    eps: toNumOrNull(ipo.eps),
    roe: toNumOrNull(ipo.roe),
    roce: toNumOrNull(ipo.roce),
    debtToEquity: toNumOrNull(ipo.debtToEquity),
    // Date fields
    openDate: toDateStr(ipo.openDate),
    closeDate: toDateStr(ipo.closeDate),
    allotmentDate: toDateStr(ipo.allotmentDate),
    listingDate: toDateStr(ipo.listingDate),
    refundDate: toDateStr(ipo.refundDate),
    dematDate: toDateStr(ipo.dematDate),
    gmpUpdatedAt: toDateStr(ipo.gmpUpdatedAt),
    // Source tracking
    sourceUpdatedAt: toDateStr(ipo.sourceUpdatedAt),
    lastVerifiedAt: toDateStr(ipo.lastVerifiedAt),
    createdAt: toDateStr(ipo.createdAt),
    updatedAt: toDateStr(ipo.updatedAt),
  };
}

export function serializeGmpHistory(item: PrismaGmpHistory | null) {
  if (!item) return null;
  return {
    ...item,
    estimatedListingPrice: toNumOrNull(item.estimatedListingPrice),
    estimatedGainPercent: toNumOrNull(item.estimatedGainPercent),
    recordedAt: toDateStr(item.recordedAt),
  };
}

export function serializeSubscriptionHistory(item: PrismaSubscriptionHistory) {
  return {
    id: item.id,
    ipoId: item.ipoId,
    date: item.date.toISOString().split('T')[0],
    qib: toNum(item.qib),
    nii: toNum(item.nii),
    retail: toNum(item.retail),
    employee: toNum(item.employee),
    total: toNum(item.total),
    recordedAt: toDateStr(item.recordedAt),
  };
}

export function serializeIpos(ipos: PrismaIpo[]) {
  return ipos.map(serializeIpo);
}

export function serializeGmpHistoryArray(items: PrismaGmpHistory[]) {
  return items.map(serializeGmpHistory);
}

export function serializeSubscriptionHistoryArray(items: PrismaSubscriptionHistory[]) {
  return items.map(serializeSubscriptionHistory);
}
