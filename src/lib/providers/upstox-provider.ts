import 'server-only';

import { BaseProvider } from './base-provider';
import type {
  ProviderIpoData,
  ProviderGmpData,
  ProviderSubscriptionData,
  ProviderListingData,
} from './types';

// ── Upstox API Response Types ──────────────────────────────

interface UpstoxIpoListResponse {
  status: string;
  data: UpstoxIpoItem[];
}

interface UpstoxIpoItem {
  id: string;
  symbol?: string;
  name: string;
  status: string;
  issue_type?: string; // 'regular' | 'sme'
  price_band?: {
    min_price?: number;
    max_price?: number;
    currency?: string;
  };
  lot_size?: number;
  issue_size?: string;
  min_investment_amount?: number;
  timeline?: {
    issue_start_date?: string;
    issue_end_date?: string;
    listing_date?: string;
    allotment_date?: string;
    refund_initiation_date?: string;
    credit_shares_date?: string;
  };
  subscription_data?: {
    category_wise?: Array<{
      category: string;
      subscription_ratio: number;
    }>;
    total_subscription_ratio?: number;
  };
  registrar?: {
    name?: string;
  };
  lead_managers?: string[];
  prospectus_url?: string;
  listing_price?: number;
}

// ── Upstox Provider ────────────────────────────────────────

/**
 * Upstox IPO Provider — fetches IPO data from Upstox Developer API v2.
 *
 * Authentication: Bearer token via UPSTOX_ACCESS_TOKEN.
 *
 * Token options:
 *   1. Analytics Token (RECOMMENDED) — read-only, valid 1 year,
 *      generate from Upstox Developer Console → app → Analytics Token
 *   2. OAuth Access Token — full access, expires daily at 3:30 AM IST
 *
 * Endpoints used:
 *   GET /v2/ipos          — list IPOs (filter by status, issue_type)
 *   GET /v2/ipos/{id}     — IPO details with subscription data
 *
 * Does NOT provide: GMP (SEBI-regulated broker)
 */
export class UpstoxProvider extends BaseProvider {
  readonly name = 'Upstox';

  private readonly baseUrl = 'https://api.upstox.com/v2';
  private readonly accessToken: string;

  constructor() {
    super();

    const token = process.env['UPSTOX_ACCESS_TOKEN'];
    if (!token) {
      throw new Error(
        'UPSTOX_ACCESS_TOKEN is not configured. ' +
        'Obtain an access token via Upstox OAuth 2.0 flow and set it in .env.local.'
      );
    }
    this.accessToken = token;

    // Upstox-specific settings
    this.minRequestIntervalMs = 300;  // ~3 req/sec
    this.timeoutMs = 20_000;
    this.maxRetries = 2;
    this.cacheTtlMs = 120_000; // 2 min cache
  }

  private get authHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
    };
  }

  // ── fetchIPOs ──────────────────────────────────────────

  async fetchIPOs(): Promise<ProviderIpoData[]> {
    const results: ProviderIpoData[] = [];

    // Fetch all statuses
    for (const status of ['upcoming', 'open', 'closed', 'listed']) {
      try {
        const response = await this.fetchJson<UpstoxIpoListResponse>(
          `${this.baseUrl}/ipos?status=${status}`,
          { headers: this.authHeaders }
        );

        if (response.status === 'success' && Array.isArray(response.data)) {
          for (const item of response.data) {
            results.push(this.mapIpoData(item));
          }
        }
      } catch (error) {
        // Log but don't fail entirely — some statuses may work
        console.error(`Upstox: Failed to fetch ${status} IPOs:`, error instanceof Error ? error.message : error);
      }
    }

    return results;
  }

  // ── fetchGMPs ──────────────────────────────────────────

  async fetchGMPs(): Promise<ProviderGmpData[]> {
    // Upstox does NOT provide GMP data (SEBI-regulated broker)
    return [];
  }

  // ── fetchSubscriptions ─────────────────────────────────

  async fetchSubscriptions(): Promise<ProviderSubscriptionData[]> {
    const results: ProviderSubscriptionData[] = [];

    try {
      const response = await this.fetchJson<UpstoxIpoListResponse>(
        `${this.baseUrl}/ipos?status=open`,
        { headers: this.authHeaders }
      );

      if (response.status === 'success' && Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.subscription_data) {
            const sub = this.extractSubscription(item);
            if (sub) {
              results.push({
                slug: this.generateSlug(item.name),
                date: new Date().toISOString().split('T')[0],
                qib: sub.qib,
                nii: sub.nii,
                retail: sub.retail,
                total: sub.total,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Upstox: Failed to fetch subscriptions:', error instanceof Error ? error.message : error);
    }

    return results;
  }

  // ── fetchListings ──────────────────────────────────────

  async fetchListings(): Promise<ProviderListingData[]> {
    const results: ProviderListingData[] = [];

    try {
      const response = await this.fetchJson<UpstoxIpoListResponse>(
        `${this.baseUrl}/ipos?status=listed`,
        { headers: this.authHeaders }
      );

      if (response.status === 'success' && Array.isArray(response.data)) {
        for (const item of response.data) {
          if (item.listing_price != null) {
            results.push({
              slug: this.generateSlug(item.name),
              listingPrice: item.listing_price,
              listingDate: item.timeline?.listing_date ?? null,
            });
          }
        }
      }
    } catch (error) {
      console.error('Upstox: Failed to fetch listings:', error instanceof Error ? error.message : error);
    }

    return results;
  }

  // ── Mapping helpers ────────────────────────────────────

  private mapIpoData(item: UpstoxIpoItem): ProviderIpoData {
    const sub = this.extractSubscription(item);

    return {
      slug: this.generateSlug(item.name),
      ipoName: item.name,
      companyName: item.name.replace(/\s*IPO$/i, '').trim(),
      ipoType: item.issue_type === 'sme' ? 'SME' : 'Mainboard',
      status: this.mapStatus(item.status),

      openDate: item.timeline?.issue_start_date ?? null,
      closeDate: item.timeline?.issue_end_date ?? null,
      allotmentDate: item.timeline?.allotment_date ?? null,
      listingDate: item.timeline?.listing_date ?? null,
      refundDate: item.timeline?.refund_initiation_date ?? null,
      dematDate: item.timeline?.credit_shares_date ?? null,

      priceBandMin: item.price_band?.min_price ?? null,
      priceBandMax: item.price_band?.max_price ?? null,
      lotSize: item.lot_size ?? null,
      issueSize: item.issue_size ?? null,

      subTotal: sub?.total ?? null,
      subRetail: sub?.retail ?? null,
      subQib: sub?.qib ?? null,
      subNii: sub?.nii ?? null,

      listingPrice: item.listing_price ?? null,

      registrar: item.registrar?.name ?? null,
      leadManagers: item.lead_managers ?? null,
    };
  }

  private extractSubscription(item: UpstoxIpoItem): { qib: number; nii: number; retail: number; total: number } | null {
    if (!item.subscription_data?.category_wise) return null;

    let qib = 0;
    let nii = 0;
    let retail = 0;

    for (const cat of item.subscription_data.category_wise) {
      const category = cat.category.toLowerCase();
      if (category.includes('retail') || category === 'rii') {
        retail = cat.subscription_ratio;
      } else if (category.includes('qib') || category.includes('qualified')) {
        qib = cat.subscription_ratio;
      } else if (category.includes('nii') || category.includes('non-institutional') || category.includes('hni')) {
        nii = cat.subscription_ratio;
      }
    }

    const total = item.subscription_data.total_subscription_ratio ?? 0;

    return { qib, nii, retail, total };
  }

  private mapStatus(upstoxStatus: string): string {
    switch (upstoxStatus.toLowerCase()) {
      case 'upcoming': return 'Upcoming';
      case 'open': return 'Open';
      case 'closed': return 'Closed';
      case 'listed': return 'Listed';
      default: return 'Upcoming';
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
