import 'server-only';

import type { GmpDataProvider, ProviderGmpData } from './types';

// ── ipoalerts.in API Response Types ────────────────────────

interface IpoAlertsIpoListResponse {
  data: IpoAlertsIpo[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

interface IpoAlertsIpo {
  id: string;
  name: string;
  symbol?: string;
  slug?: string;
  type?: string;       // 'EQ' | 'SME' | 'DEBT'
  status?: string;     // 'open' | 'upcoming' | 'listed' | 'closed' | 'announced'
  priceRange?: string; // e.g. "₹100 - ₹105"
  startDate?: string;
  endDate?: string;
  listingDate?: string;
  minQty?: number;
  minAmount?: number;
  issueSize?: string;
  gmp?: IpoAlertsGmpData | null;
}

interface IpoAlertsGmpData {
  value?: number;
  estimated_listing?: number;
  percentage?: number;
  updated_at?: string;
}

// ── ipoalerts.in GMP Provider ──────────────────────────────

/**
 * ipoalerts.in GMP Provider — fetches Grey Market Premium data.
 *
 * Authentication: x-api-key header.
 * GMP data requires Pro plan addon.
 *
 * Endpoints used:
 *   GET /ipos?includeGmp=true  — all IPOs with GMP data
 *
 * Base URL: https://api.ipoalerts.in
 */
export class IpoAlertsGmpProvider implements GmpDataProvider {
  readonly name = 'ipoalerts.in';

  private readonly baseUrl = 'https://api.ipoalerts.in';
  private readonly apiKey: string;
  private readonly timeoutMs = 15_000;
  private readonly maxRetries = 2;

  constructor() {
    const key = process.env.IPOALERTS_API_KEY;
    if (!key) {
      throw new Error(
        'IPOALERTS_API_KEY is not configured. ' +
        'Obtain an API key from https://ipoalerts.in dashboard and set it in .env.local.'
      );
    }
    this.apiKey = key;
  }

  private get authHeaders(): Record<string, string> {
    return {
      'x-api-key': this.apiKey,
      'Accept': 'application/json',
    };
  }

  // ── HTTP helper ────────────────────────────────────────

  private async fetchWithRetry<T>(url: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          headers: this.authHeaders,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
        }
      }
    }

    throw lastError ?? new Error('Request failed');
  }

  // ── fetchGMPs ──────────────────────────────────────────

  async fetchGMPs(): Promise<ProviderGmpData[]> {
    const results: ProviderGmpData[] = [];

    // Fetch IPOs with GMP included for relevant statuses
    for (const status of ['upcoming', 'open']) {
      try {
        const response = await this.fetchWithRetry<IpoAlertsIpoListResponse>(
          `${this.baseUrl}/ipos?status=${status}&includeGmp=true`
        );

        if (Array.isArray(response.data)) {
          for (const ipo of response.data) {
            const gmpData = this.extractGmp(ipo);
            if (gmpData) {
              results.push(gmpData);
            }
          }
        }
      } catch (error) {
        console.error(`ipoalerts: Failed to fetch ${status} GMP data:`, error instanceof Error ? error.message : error);
      }
    }

    return results;
  }

  // ── Mapping helpers ────────────────────────────────────

  private extractGmp(ipo: IpoAlertsIpo): ProviderGmpData | null {
    // GMP might be null if user doesn't have Pro addon
    if (!ipo.gmp || ipo.gmp.value === undefined || ipo.gmp.value === null) {
      return null;
    }

    const gmpValue = Number(ipo.gmp.value);
    if (!Number.isFinite(gmpValue)) {
      return null;
    }

    const slug = ipo.slug || this.generateSlug(ipo.name);

    return {
      slug,
      gmp: gmpValue,
      updatedAt: ipo.gmp.updated_at ?? null,
    };
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s*ipo$/i, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
