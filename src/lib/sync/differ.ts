import 'server-only';
import { Ipo } from '@prisma/client';
import { NormalizedIpoData } from './normalizer';
import { Decimal } from '@prisma/client/runtime/library';

export interface DiffResult {
  changed: boolean;
  changedFields: Record<string, { old: unknown; new: unknown }>;
}

/** Fields to skip when comparing — metadata, relations, auto-generated */
const SKIP_FIELDS = new Set([
  'id', 'createdAt', 'updatedAt', 'isDeleted',
  'source', 'sourceUpdatedAt', 'lastVerifiedAt',
  'gmpHistory', 'subscriptionHistory', 'watchlistItems', 'alerts',
  'previousGmp', 'gmpUpdatedAt',
]);

export function diffIpoData(existing: Ipo, incoming: NormalizedIpoData): DiffResult {
  const changedFields: Record<string, { old: unknown; new: unknown }> = {};

  const keysToCompare = Object.keys(incoming) as Array<keyof NormalizedIpoData>;

  for (const key of keysToCompare) {
    if (SKIP_FIELDS.has(key)) continue;

    const existingVal = existing[key as keyof Ipo];
    const incomingVal = incoming[key];

    let isDifferent = false;
    let oldValToLog: unknown = existingVal;

    if (existingVal instanceof Decimal) {
      const existingNum = existingVal.toNumber();
      oldValToLog = existingNum;
      if (existingNum !== incomingVal) {
        isDifferent = true;
      }
    } else if (Array.isArray(existingVal) && Array.isArray(incomingVal)) {
      if (JSON.stringify(existingVal) !== JSON.stringify(incomingVal)) {
        isDifferent = true;
      }
    } else if (existingVal instanceof Date && incomingVal instanceof Date) {
      if (existingVal.toISOString() !== incomingVal.toISOString()) {
        isDifferent = true;
      }
    } else if (existingVal instanceof Date && !incomingVal) {
      isDifferent = true;
    } else if (!existingVal && incomingVal instanceof Date) {
      isDifferent = true;
    } else if (typeof existingVal === 'string' && typeof incomingVal === 'string') {
      if (existingVal.trim() !== incomingVal.trim()) {
        isDifferent = true;
      }
    } else if (existingVal !== incomingVal) {
      // Handle null vs undefined equivalence
      if (existingVal == null && incomingVal == null) {
        isDifferent = false;
      } else {
        isDifferent = true;
      }
    }

    if (isDifferent) {
      changedFields[key] = { old: oldValToLog, new: incomingVal };
    }
  }

  return {
    changed: Object.keys(changedFields).length > 0,
    changedFields,
  };
}
