import 'server-only';

import { getDataMode, getProviderInfo } from '@/lib/providers';

// ── Health Status Types ────────────────────────────────────

export type ProviderStatus =
  | 'CONNECTED'
  | 'NOT_CONFIGURED'
  | 'AUTH_FAILED'
  | 'RATE_LIMITED'
  | 'ERROR';

export interface ProviderHealthResult {
  provider: string;
  status: ProviderStatus;
  message: string;
  latencyMs?: number;
  /** ISO timestamp of the check */
  checkedAt: string;
}

export interface HealthCheckResult {
  mode: string;
  upstox: ProviderHealthResult;
  ipoalerts: ProviderHealthResult;
}

// ── Health Check ───────────────────────────────────────────

/**
 * Check the health/connectivity of configured providers.
 * Makes a lightweight API request to verify credentials and connectivity.
 * Never exposes credentials in the result.
 */
export async function checkProviderHealth(): Promise<HealthCheckResult> {
  const info = getProviderInfo();
  const mode = getDataMode();

  const [upstox, ipoalerts] = await Promise.all([
    checkUpstox(info.hasUpstoxToken),
    checkIpoAlerts(info.hasIpoAlertsKey),
  ]);

  return { mode, upstox, ipoalerts };
}

// ── Upstox Check ───────────────────────────────────────────

async function checkUpstox(hasToken: boolean): Promise<ProviderHealthResult> {
  const checkedAt = new Date().toISOString();

  if (!hasToken) {
    return {
      provider: 'Upstox',
      status: 'NOT_CONFIGURED',
      message: 'UPSTOX_ACCESS_TOKEN not set. Generate an Analytics Token from Upstox Developer Console.',
      checkedAt,
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    // Lightweight check: fetch upcoming IPOs (should be fast)
    const response = await fetch('https://api.upstox.com/v2/ipos?status=upcoming', {
      headers: {
        'Authorization': `Bearer ${process.env['UPSTOX_ACCESS_TOKEN']}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);
    const latencyMs = Date.now() - start;

    if (response.status === 401 || response.status === 403) {
      return {
        provider: 'Upstox',
        status: 'AUTH_FAILED',
        message: `Authentication failed (HTTP ${response.status}). Token may be expired or invalid.`,
        latencyMs,
        checkedAt,
      };
    }

    if (response.status === 429) {
      return {
        provider: 'Upstox',
        status: 'RATE_LIMITED',
        message: 'Rate limited by Upstox. Try again later.',
        latencyMs,
        checkedAt,
      };
    }

    if (!response.ok) {
      return {
        provider: 'Upstox',
        status: 'ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
        checkedAt,
      };
    }

    return {
      provider: 'Upstox',
      status: 'CONNECTED',
      message: 'Connected and authenticated.',
      latencyMs,
      checkedAt,
    };
  } catch (error) {
    return {
      provider: 'Upstox',
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Connection failed',
      latencyMs: Date.now() - start,
      checkedAt,
    };
  }
}

// ── ipoalerts Check ────────────────────────────────────────

async function checkIpoAlerts(hasKey: boolean): Promise<ProviderHealthResult> {
  const checkedAt = new Date().toISOString();

  if (!hasKey) {
    return {
      provider: 'ipoalerts.in',
      status: 'NOT_CONFIGURED',
      message: 'IPOALERTS_API_KEY not set. Register at ipoalerts.in and create an API key.',
      checkedAt,
    };
  }

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);

    // Lightweight check: fetch a small list of IPOs
    const response = await fetch('https://api.ipoalerts.in/ipos?status=upcoming', {
      headers: {
        'x-api-key': process.env['IPOALERTS_API_KEY']!,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);
    const latencyMs = Date.now() - start;

    if (response.status === 401 || response.status === 403) {
      return {
        provider: 'ipoalerts.in',
        status: 'AUTH_FAILED',
        message: `Authentication failed (HTTP ${response.status}). Check your API key.`,
        latencyMs,
        checkedAt,
      };
    }

    if (response.status === 429) {
      return {
        provider: 'ipoalerts.in',
        status: 'RATE_LIMITED',
        message: 'Rate limited. Fair usage policy may apply.',
        latencyMs,
        checkedAt,
      };
    }

    if (!response.ok) {
      return {
        provider: 'ipoalerts.in',
        status: 'ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
        checkedAt,
      };
    }

    return {
      provider: 'ipoalerts.in',
      status: 'CONNECTED',
      message: 'Connected and authenticated. (GMP requires Pro plan addon.)',
      latencyMs,
      checkedAt,
    };
  } catch (error) {
    return {
      provider: 'ipoalerts.in',
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Connection failed',
      latencyMs: Date.now() - start,
      checkedAt,
    };
  }
}
