import 'server-only';

/**
 * IPOTrack Score Engine
 * 
 * Calculates a 0-100 score based on available IPO data.
 * This is an informational analytics score and is NOT investment advice.
 * 
 * Components:
 * - GMP Trend       (0-20 pts)
 * - Subscription    (0-20 pts)
 * - Financials      (0-20 pts)
 * - Valuation       (0-15 pts)
 * - Profitability   (0-10 pts)
 * - Industry        (0-10 pts)
 * - Growth          (0-5 pts)
 */

export interface ScoreBreakdown {
  total: number;
  gmpTrend: number;
  subscription: number;
  financials: number;
  valuation: number;
  profitability: number;
  industry: number;
  growth: number;
  maxScores: {
    gmpTrend: number;
    subscription: number;
    financials: number;
    valuation: number;
    profitability: number;
    industry: number;
    growth: number;
  };
  disclaimer: string;
}

interface IpoScoreInput {
  gmp: number;
  previousGmp: number;
  priceBandMax: number;
  subTotal: number;
  subRetail: number;
  subQib: number;
  subNii: number;
  revenue: number | null;
  profit: number | null;
  ebitda: number | null;
  eps: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  industry: string;
  sector: string;
  ipoType: string;
}

const STRONG_SECTORS = ['Technology', 'Healthcare', 'Financial Services', 'Consumer', 'Infrastructure'];

export function calculateIpoTrackScore(ipo: IpoScoreInput): ScoreBreakdown {
  const maxScores = {
    gmpTrend: 20,
    subscription: 20,
    financials: 20,
    valuation: 15,
    profitability: 10,
    industry: 10,
    growth: 5,
  };

  // 1. GMP Trend Score (0-20)
  let gmpTrend = 0;
  if (ipo.priceBandMax > 0) {
    const gmpPercent = (ipo.gmp / ipo.priceBandMax) * 100;
    if (gmpPercent > 50) gmpTrend = 20;
    else if (gmpPercent > 30) gmpTrend = 17;
    else if (gmpPercent > 20) gmpTrend = 14;
    else if (gmpPercent > 10) gmpTrend = 11;
    else if (gmpPercent > 5) gmpTrend = 8;
    else if (gmpPercent > 0) gmpTrend = 5;
    else if (gmpPercent === 0) gmpTrend = 3;
    else gmpTrend = 0; // Negative GMP

    // Bonus for rising trend
    if (ipo.gmp > ipo.previousGmp && ipo.previousGmp > 0) {
      gmpTrend = Math.min(20, gmpTrend + 2);
    }
    // Penalty for falling trend
    if (ipo.gmp < ipo.previousGmp && ipo.previousGmp > 0) {
      gmpTrend = Math.max(0, gmpTrend - 2);
    }
  }

  // 2. Subscription Score (0-20)
  let subscription = 0;
  if (ipo.subTotal > 0) {
    if (ipo.subTotal > 50) subscription = 20;
    else if (ipo.subTotal > 20) subscription = 17;
    else if (ipo.subTotal > 10) subscription = 14;
    else if (ipo.subTotal > 5) subscription = 11;
    else if (ipo.subTotal > 2) subscription = 8;
    else if (ipo.subTotal > 1) subscription = 5;
    else subscription = 2;

    // QIB subscription is a quality signal
    if (ipo.subQib > 10) subscription = Math.min(20, subscription + 2);
  }

  // 3. Financial Strength Score (0-20)
  let financials = 0;
  let financialDataPoints = 0;

  if (ipo.revenue != null && ipo.revenue > 0) {
    financials += 5;
    financialDataPoints++;
  }
  if (ipo.profit != null && ipo.profit > 0) {
    financials += 5;
    financialDataPoints++;
  }
  if (ipo.ebitda != null && ipo.ebitda > 0) {
    financials += 4;
    financialDataPoints++;
  }
  if (ipo.debtToEquity != null) {
    if (ipo.debtToEquity < 0.5) financials += 4;
    else if (ipo.debtToEquity < 1) financials += 3;
    else if (ipo.debtToEquity < 2) financials += 2;
    else financials += 1;
    financialDataPoints++;
  }
  if (financialDataPoints === 0) {
    financials = 10; // Neutral score if no data
  }
  financials = Math.min(20, financials);

  // 4. Valuation Score (0-15)
  let valuation = 7; // Default neutral
  if (ipo.eps != null && ipo.eps > 0 && ipo.priceBandMax > 0) {
    const pe = ipo.priceBandMax / ipo.eps;
    if (pe < 15) valuation = 15;
    else if (pe < 25) valuation = 12;
    else if (pe < 40) valuation = 9;
    else if (pe < 60) valuation = 6;
    else valuation = 3;
  }

  // 5. Profitability Score (0-10)
  let profitability = 5; // Default neutral
  if (ipo.roe != null) {
    if (ipo.roe > 20) profitability = 10;
    else if (ipo.roe > 15) profitability = 8;
    else if (ipo.roe > 10) profitability = 6;
    else if (ipo.roe > 5) profitability = 4;
    else profitability = 2;
  }
  if (ipo.roce != null && ipo.roce > 15) {
    profitability = Math.min(10, profitability + 1);
  }

  // 6. Industry Score (0-10)
  let industry = 5; // Default neutral
  if (ipo.sector && STRONG_SECTORS.some(s => ipo.sector.toLowerCase().includes(s.toLowerCase()))) {
    industry = 8;
  }
  if (ipo.ipoType === 'Mainboard') {
    industry = Math.min(10, industry + 2);
  }

  // 7. Growth Score (0-5)
  let growth = 2; // Default neutral
  if (ipo.revenue != null && ipo.revenue > 0 && ipo.profit != null && ipo.profit > 0) {
    const margin = (ipo.profit / ipo.revenue) * 100;
    if (margin > 20) growth = 5;
    else if (margin > 10) growth = 4;
    else if (margin > 5) growth = 3;
    else growth = 2;
  }

  const total = gmpTrend + subscription + financials + valuation + profitability + industry + growth;

  return {
    total: Math.min(100, total),
    gmpTrend,
    subscription,
    financials,
    valuation,
    profitability,
    industry,
    growth,
    maxScores,
    disclaimer: 'IPOTrack Score is an informational analytics score and is not investment advice.',
  };
}
