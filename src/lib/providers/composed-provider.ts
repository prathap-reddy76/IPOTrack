import 'server-only';

import type {
  IpoDataProvider,
  GmpDataProvider,
  ProviderIpoData,
  ProviderGmpData,
  ProviderSubscriptionData,
  ProviderListingData,
} from './types';

/**
 * ComposedProvider — combines an IPO data provider with a separate GMP provider.
 *
 * Architecture:
 *   fetchIPOs()         → delegates to ipoProvider
 *   fetchGMPs()         → delegates to gmpProvider
 *   fetchSubscriptions() → delegates to ipoProvider
 *   fetchListings()     → delegates to ipoProvider
 *
 * This allows IPO master data and GMP data to come from different sources
 * (e.g., Upstox for IPO data + ipoalerts.in for GMP).
 */
export class ComposedProvider implements IpoDataProvider {
  readonly name: string;

  private readonly ipoProvider: IpoDataProvider;
  private readonly gmpProvider: GmpDataProvider | null;

  constructor(
    ipoProvider: IpoDataProvider,
    gmpProvider?: GmpDataProvider | null
  ) {
    this.ipoProvider = ipoProvider;
    this.gmpProvider = gmpProvider ?? null;

    const parts = [ipoProvider.name];
    if (gmpProvider) {
      parts.push(`GMP: ${gmpProvider.name}`);
    }
    this.name = parts.join(' + ');
  }

  async fetchIPOs(): Promise<ProviderIpoData[]> {
    return this.ipoProvider.fetchIPOs();
  }

  async fetchGMPs(): Promise<ProviderGmpData[]> {
    // Prefer dedicated GMP provider if available
    if (this.gmpProvider) {
      return this.gmpProvider.fetchGMPs();
    }
    // Fall back to IPO provider's GMP (may return empty for providers like Upstox)
    return this.ipoProvider.fetchGMPs();
  }

  async fetchSubscriptions(): Promise<ProviderSubscriptionData[]> {
    return this.ipoProvider.fetchSubscriptions();
  }

  async fetchListings(): Promise<ProviderListingData[]> {
    return this.ipoProvider.fetchListings();
  }
}
