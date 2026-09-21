import 'server-only';

// ============================================================
// Provider Data Types — what providers return
// ============================================================

/** Raw IPO data from a provider (all fields optional except slug/name) */
export interface ProviderIpoData {
  slug: string;
  ipoName: string;
  companyName?: string;
  ipoType?: string; // 'Mainboard' | 'SME'
  status?: string;

  openDate?: string | Date | null;
  closeDate?: string | Date | null;
  allotmentDate?: string | Date | null;
  listingDate?: string | Date | null;
  refundDate?: string | Date | null;
  dematDate?: string | Date | null;

  priceBandMin?: number | string | null;
  priceBandMax?: number | string | null;
  lotSize?: number | string | null;
  issueSize?: string | null;
  issueSizeCrore?: number | string | null;
  faceValue?: number | string | null;
  freshIssue?: string | null;
  ofs?: string | null;

  gmp?: number | string | null;

  subTotal?: number | string | null;
  subRetail?: number | string | null;
  subQib?: number | string | null;
  subNii?: number | string | null;
  subEmployee?: number | string | null;

  listingPrice?: number | string | null;

  // Financial data
  revenue?: number | string | null;
  profit?: number | string | null;
  ebitda?: number | string | null;
  totalAssets?: number | string | null;
  netWorth?: number | string | null;
  eps?: number | string | null;
  roe?: number | string | null;
  roce?: number | string | null;
  debtToEquity?: number | string | null;

  // Company info
  exchange?: string | null;
  marketMaker?: string | null;
  industry?: string | null;
  sector?: string | null;
  about?: string | null;
  promoters?: string[] | null;
  registrar?: string | null;
  leadManagers?: string[] | null;
  location?: string | null;
}

/** Raw GMP data from a provider */
export interface ProviderGmpData {
  slug: string;
  gmp: number;
  /** Optional: when the provider recorded this GMP */
  updatedAt?: string | Date | null;
}

/** Raw subscription data from a provider */
export interface ProviderSubscriptionData {
  slug: string;
  date: string | Date;
  qib?: number | string | null;
  nii?: number | string | null;
  retail?: number | string | null;
  employee?: number | string | null;
  total?: number | string | null;
}

/** Raw listing data from a provider */
export interface ProviderListingData {
  slug: string;
  listingPrice: number;
  listingDate?: string | Date | null;
}

// ============================================================
// Sync Result Types
// ============================================================

export interface SyncCounts {
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
}

export interface SyncResult {
  type: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  counts: SyncCounts;
  errors: string[];
  dryRun: boolean;
  durationMs: number;
  /** For dry-run mode: what would change */
  changes?: DryRunChange[];
}

export interface DryRunChange {
  slug: string;
  ipoName: string;
  action: 'CREATE' | 'UPDATE' | 'UNCHANGED';
  changedFields?: Record<string, { old: unknown; new: unknown }>;
}

// ============================================================
// Provider Interface
// ============================================================

export interface IpoDataProvider {
  /** Human-readable name of the provider */
  readonly name: string;

  /** Fetch all upcoming/open IPOs */
  fetchIPOs(): Promise<ProviderIpoData[]>;

  /** Fetch current GMP for all relevant IPOs */
  fetchGMPs(): Promise<ProviderGmpData[]>;

  /** Fetch subscription data (daily snapshots) for all open IPOs */
  fetchSubscriptions(): Promise<ProviderSubscriptionData[]>;

  /** Fetch listing data for recently listed IPOs */
  fetchListings(): Promise<ProviderListingData[]>;
}

/**
 * Separate interface for GMP-only providers.
 * Used for composition when GMP comes from a different source than IPO data.
 */
export interface GmpDataProvider {
  /** Human-readable name of the GMP provider */
  readonly name: string;

  /** Fetch current GMP for all relevant IPOs */
  fetchGMPs(): Promise<ProviderGmpData[]>;
}

// ============================================================
// Data Freshness
// ============================================================

export interface DataFreshness {
  label: string;
  isStale: boolean;
  minutesAgo: number;
}

// ============================================================
// Sync Options
// ============================================================

export interface SyncOptions {
  dryRun?: boolean;
  /** Provider name override (defaults to configured provider) */
  providerName?: string;
}
