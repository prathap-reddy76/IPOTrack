import 'server-only';
import { NormalizedIpoData } from './normalizer';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateIpoData(data: NormalizedIpoData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.slug) errors.push('Slug is required');
  if (!data.ipoName) errors.push('IPO Name is required');
  
  if (data.priceBandMin !== null && data.priceBandMax !== null && data.priceBandMin > data.priceBandMax) {
    errors.push('priceBandMin must be less than or equal to priceBandMax');
  }
  
  if (data.lotSize !== null) {
    if (data.lotSize < 0) errors.push('lotSize cannot be negative');
    if (data.lotSize === 0) warnings.push('lotSize is zero');
  }

  if (data.issueSizeCrore !== null) {
    if (data.issueSizeCrore < 0) errors.push('issueSizeCrore cannot be negative');
  } else {
    warnings.push('issueSizeCrore is missing');
  }

  if (data.openDate && data.closeDate && data.openDate > data.closeDate) {
    errors.push('openDate must be before closeDate');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateGmpData(gmp: number): ValidationResult {
  const errors: string[] = [];
  if (!Number.isFinite(gmp)) {
    errors.push('GMP must be a finite number');
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}

export function validateSubscriptionData(data: { qib: number; nii: number; retail: number; total: number }): ValidationResult {
  const errors: string[] = [];
  if (data.qib < 0) errors.push('QIB subscription cannot be negative');
  if (data.nii < 0) errors.push('NII subscription cannot be negative');
  if (data.retail < 0) errors.push('Retail subscription cannot be negative');
  if (data.total < 0) errors.push('Total subscription cannot be negative');

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
  };
}
