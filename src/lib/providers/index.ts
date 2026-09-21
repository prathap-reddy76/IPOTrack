import 'server-only';

import type { IpoDataProvider, GmpDataProvider } from './types';
import { DemoProvider } from './demo-provider';
import { UpstoxProvider } from './upstox-provider';
import { IpoAlertsGmpProvider } from './ipoalerts-provider';
import { ComposedProvider } from './composed-provider';

/**
 * Provider Factory — creates the configured data provider(s) based on environment variables.
 *
 * DATA_MODE:
 *  - 'demo' (default) → DemoProvider (reads existing DB, no external API)
 *  - 'live' → requires configured provider(s), fails clearly if missing
 *
 * IPO_DATA_PROVIDER:
 *  - 'upstox' → UpstoxProvider (requires UPSTOX_ACCESS_TOKEN)
 *
 * GMP is sourced separately via:
 *  - IpoAlertsGmpProvider (requires IPOALERTS_API_KEY)
 *
 * Architecture:
 *  ComposedProvider(UpstoxProvider, IpoAlertsGmpProvider)
 *  → fetchIPOs() delegated to Upstox
 *  → fetchGMPs() delegated to ipoalerts.in
 */

let cachedProvider: IpoDataProvider | null = null;
let cachedGmpProvider: GmpDataProvider | null = null;

// ── Data Mode ──────────────────────────────────────────────

export function getDataMode(): 'demo' | 'live' {
  const mode = process.env['DATA_MODE']?.toLowerCase();
  if (mode === 'live') return 'live';
  return 'demo';
}

export function isLiveMode(): boolean {
  return getDataMode() === 'live';
}

// ── GMP Provider ───────────────────────────────────────────

/**
 * Get the GMP provider (if configured).
 * Returns null if IPOALERTS_API_KEY is not set.
 */
export function getGmpProvider(): GmpDataProvider | null {
  if (cachedGmpProvider) return cachedGmpProvider;

  const apiKey = process.env['IPOALERTS_API_KEY'];
  if (!apiKey) return null;

  try {
    cachedGmpProvider = new IpoAlertsGmpProvider();
    return cachedGmpProvider;
  } catch {
    return null;
  }
}

// ── Main Provider ──────────────────────────────────────────

export function getProvider(): IpoDataProvider {
  if (cachedProvider) return cachedProvider;

  const mode = getDataMode();

  if (mode === 'demo') {
    cachedProvider = new DemoProvider();
    return cachedProvider;
  }

  // Live mode — check for configured provider
  const providerName = process.env['IPO_DATA_PROVIDER']?.toLowerCase();

  if (!providerName) {
    throw new Error(
      'Live data provider is not configured. ' +
      'Set IPO_DATA_PROVIDER in your environment variables, or use DATA_MODE=demo.'
    );
  }

  // Create the IPO data provider
  let ipoProvider: IpoDataProvider;

  switch (providerName) {
    case 'upstox':
      ipoProvider = new UpstoxProvider();
      break;

    default:
      throw new Error(
        `Unknown data provider: "${providerName}". ` +
        'Available providers: upstox. ' +
        'Use DATA_MODE=demo for development.'
      );
  }

  // Try to create a GMP provider (optional — not required for live mode)
  const gmpProvider = getGmpProvider();

  // Compose: IPO provider + GMP provider
  cachedProvider = new ComposedProvider(ipoProvider, gmpProvider);
  return cachedProvider;
}

// ── Provider Info ──────────────────────────────────────────

/** Get a summary of the current provider configuration */
export function getProviderInfo(): {
  mode: string;
  ipoProvider: string;
  gmpProvider: string;
  hasUpstoxToken: boolean;
  hasIpoAlertsKey: boolean;
} {
  return {
    mode: getDataMode(),
    ipoProvider: process.env['IPO_DATA_PROVIDER'] ?? 'none',
    gmpProvider: process.env['IPOALERTS_API_KEY'] ? 'ipoalerts.in' : 'none',
    hasUpstoxToken: !!process.env['UPSTOX_ACCESS_TOKEN'],
    hasIpoAlertsKey: !!process.env['IPOALERTS_API_KEY'],
  };
}

/** Reset cached providers (useful for testing) */
export function resetProvider(): void {
  cachedProvider = null;
  cachedGmpProvider = null;
}
