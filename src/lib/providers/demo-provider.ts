import 'server-only';

import { prisma } from '@/lib/db';
import type {
  IpoDataProvider,
  ProviderIpoData,
  ProviderGmpData,
  ProviderSubscriptionData,
  ProviderListingData,
} from './types';

/**
 * Demo provider — returns existing database data as-is.
 * Used when DATA_MODE=demo (default).
 * Does NOT contact any external API.
 * All data is explicitly marked as "Demo".
 */
export class DemoProvider implements IpoDataProvider {
  readonly name = 'Demo (Local Database)';

  async fetchIPOs(): Promise<ProviderIpoData[]> {
    const ipos = await prisma.ipo.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    return ipos.map(ipo => ({
      slug: ipo.slug,
      ipoName: ipo.ipoName,
      companyName: ipo.companyName,
      ipoType: ipo.ipoType,
      status: ipo.status,
      openDate: ipo.openDate?.toISOString() ?? null,
      closeDate: ipo.closeDate?.toISOString() ?? null,
      allotmentDate: ipo.allotmentDate?.toISOString() ?? null,
      listingDate: ipo.listingDate?.toISOString() ?? null,
      refundDate: ipo.refundDate?.toISOString() ?? null,
      dematDate: ipo.dematDate?.toISOString() ?? null,
      priceBandMin: Number(ipo.priceBandMin),
      priceBandMax: Number(ipo.priceBandMax),
      lotSize: ipo.lotSize,
      issueSize: ipo.issueSize,
      issueSizeCrore: Number(ipo.issueSizeCrore),
      faceValue: Number(ipo.faceValue),
      freshIssue: ipo.freshIssue,
      ofs: ipo.ofs,
      gmp: ipo.gmp,
      subTotal: Number(ipo.subTotal),
      subRetail: Number(ipo.subRetail),
      subQib: Number(ipo.subQib),
      subNii: Number(ipo.subNii),
      subEmployee: Number(ipo.subEmployee),
      listingPrice: ipo.listingPrice ? Number(ipo.listingPrice) : null,
      revenue: ipo.revenue ? Number(ipo.revenue) : null,
      profit: ipo.profit ? Number(ipo.profit) : null,
      ebitda: ipo.ebitda ? Number(ipo.ebitda) : null,
      totalAssets: ipo.totalAssets ? Number(ipo.totalAssets) : null,
      netWorth: ipo.netWorth ? Number(ipo.netWorth) : null,
      eps: ipo.eps ? Number(ipo.eps) : null,
      roe: ipo.roe ? Number(ipo.roe) : null,
      roce: ipo.roce ? Number(ipo.roce) : null,
      debtToEquity: ipo.debtToEquity ? Number(ipo.debtToEquity) : null,
      exchange: ipo.exchange,
      marketMaker: ipo.marketMaker,
      industry: ipo.industry,
      sector: ipo.sector,
      about: ipo.about,
      promoters: ipo.promoters,
      registrar: ipo.registrar,
      leadManagers: ipo.leadManagers,
      location: ipo.location,
    }));
  }

  async fetchGMPs(): Promise<ProviderGmpData[]> {
    const ipos = await prisma.ipo.findMany({
      where: {
        isDeleted: false,
        status: { in: ['Upcoming', 'Open', 'Closing Soon'] },
      },
      select: { slug: true, gmp: true, gmpUpdatedAt: true },
    });

    return ipos.map(ipo => ({
      slug: ipo.slug,
      gmp: ipo.gmp,
      updatedAt: ipo.gmpUpdatedAt?.toISOString() ?? null,
    }));
  }

  async fetchSubscriptions(): Promise<ProviderSubscriptionData[]> {
    const ipos = await prisma.ipo.findMany({
      where: {
        isDeleted: false,
        status: { in: ['Open', 'Closing Soon'] },
      },
      select: {
        slug: true,
        subQib: true,
        subNii: true,
        subRetail: true,
        subEmployee: true,
        subTotal: true,
      },
    });

    const today = new Date().toISOString().split('T')[0];

    return ipos.map(ipo => ({
      slug: ipo.slug,
      date: today,
      qib: Number(ipo.subQib),
      nii: Number(ipo.subNii),
      retail: Number(ipo.subRetail),
      employee: Number(ipo.subEmployee),
      total: Number(ipo.subTotal),
    }));
  }

  async fetchListings(): Promise<ProviderListingData[]> {
    const ipos = await prisma.ipo.findMany({
      where: {
        isDeleted: false,
        status: 'Listed',
        listingPrice: { not: null },
      },
      select: {
        slug: true,
        listingPrice: true,
        listingDate: true,
      },
    });

    return ipos
      .filter(ipo => ipo.listingPrice !== null)
      .map(ipo => ({
        slug: ipo.slug,
        listingPrice: Number(ipo.listingPrice),
        listingDate: ipo.listingDate?.toISOString() ?? null,
      }));
  }
}
