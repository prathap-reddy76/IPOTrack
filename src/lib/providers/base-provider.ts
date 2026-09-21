import 'server-only';

import type {
  IpoDataProvider,
  ProviderIpoData,
  ProviderGmpData,
  ProviderSubscriptionData,
  ProviderListingData,
} from './types';

/**
 * Abstract base class for data providers.
 * Provides common utilities: HTTP fetch with timeout/retry, response caching,
 * and rate-limit-aware request throttling.
 */
export abstract class BaseProvider implements IpoDataProvider {
  abstract readonly name: string;

  abstract fetchIPOs(): Promise<ProviderIpoData[]>;
  abstract fetchGMPs(): Promise<ProviderGmpData[]>;
  abstract fetchSubscriptions(): Promise<ProviderSubscriptionData[]>;
  abstract fetchListings(): Promise<ProviderListingData[]>;

  // ── HTTP helpers ─────────────────────────────────────────

  private cache = new Map<string, { data: unknown; expiresAt: number }>();
  private lastRequestAt = 0;

  /** Minimum interval between requests in ms (default 500ms) */
  protected minRequestIntervalMs = 500;

  /** Request timeout in ms (default 15s) */
  protected timeoutMs = 15_000;

  /** Max retries on failure (default 2) */
  protected maxRetries = 2;

  /** Cache TTL in ms (default 60s) */
  protected cacheTtlMs = 60_000;

  /**
   * Fetch JSON from a URL with timeout, retry, throttling, and caching.
   */
  protected async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    // Check cache
    const cached = this.cache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    // Throttle requests
    const elapsed = Date.now() - this.lastRequestAt;
    if (elapsed < this.minRequestIntervalMs) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestIntervalMs - elapsed));
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        this.lastRequestAt = Date.now();
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as T;

        // Cache result
        this.cache.set(url, { data, expiresAt: Date.now() + this.cacheTtlMs });

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.maxRetries) {
          // Exponential backoff: 1s, 2s
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
        }
      }
    }

    throw lastError ?? new Error('Request failed');
  }

  /** Clear the in-memory cache */
  protected clearCache(): void {
    this.cache.clear();
  }
}
