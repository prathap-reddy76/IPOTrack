import { ipos } from './ipos';
import { GMPRecord } from '@/types';

function parsePriceBandMax(priceBand: string): number {
  const parts = priceBand.replace(/[₹,]/g, '').split('-');
  const max = parseFloat(parts[parts.length - 1]?.trim() || '0');
  return isNaN(max) ? 0 : max;
}

export function getGMPRecords(): GMPRecord[] {
  return ipos.filter(ipo => parsePriceBandMax(ipo.priceBand) > 0).map(ipo => {
    const priceBandMax = parsePriceBandMax(ipo.priceBand);
    return {
      ipoId: ipo.id,
      companyName: ipo.name,
      slug: ipo.slug,
      ipoType: ipo.type,
      currentGmp: ipo.gmp,
      previousGmp: ipo.previousGmp,
      change: ipo.gmp - ipo.previousGmp,
      changePercent: ipo.previousGmp > 0 ? parseFloat((((ipo.gmp - ipo.previousGmp) / ipo.previousGmp) * 100).toFixed(1)) : 0,
      trend: (ipo.gmp > ipo.previousGmp ? 'up' : ipo.gmp < ipo.previousGmp ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      lastUpdated: 'Sep 7, 2026 10:30 AM',
      priceBandMax,
    };
  });
}
