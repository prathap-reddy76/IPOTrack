import 'server-only';
import { prisma } from '@/lib/db';
import { getProvider } from '@/lib/providers';
import type { SyncResult, SyncOptions, SyncCounts, DryRunChange } from '@/lib/providers/types';
import { normalizeIpoData } from './normalizer';
import { validateIpoData, validateGmpData, validateSubscriptionData } from './validator';
import { diffIpoData } from './differ';
import { calculateIpoStatus } from '@/lib/status-calculator';

// ── Helpers ────────────────────────────────────────────────

async function createSyncLog(type: string, dryRun: boolean) {
  return prisma.syncLog.create({
    data: {
      type,
      status: 'running',
      dryRun,
      startedAt: new Date(),
    },
  });
}

async function completeSyncLog(
  id: string,
  counts: SyncCounts,
  startTime: number,
  error?: string
) {
  const durationMs = Date.now() - startTime;
  await prisma.syncLog.update({
    where: { id },
    data: {
      status: error ? 'FAILED' : 'SUCCESS',
      recordsCreated: counts.created,
      recordsUpdated: counts.updated,
      recordsUnchanged: counts.unchanged,
      recordsFailed: counts.failed,
      duration: durationMs,
      error: error ?? null,
      completedAt: new Date(),
    },
  });
}

function buildSyncResult(
  type: string,
  counts: SyncCounts,
  errors: string[],
  dryRun: boolean,
  durationMs: number,
  changes?: DryRunChange[]
): SyncResult {
  return {
    type,
    status: errors.length > 0 && counts.updated + counts.created === 0 ? 'FAILED'
      : errors.length > 0 ? 'PARTIAL' : 'SUCCESS',
    counts,
    errors,
    dryRun,
    durationMs,
    changes,
  };
}

// ── Sync IPOs ──────────────────────────────────────────────

export async function syncIPOs(options: SyncOptions = {}): Promise<SyncResult> {
  const { dryRun = false } = options;
  const startTime = Date.now();
  const syncLog = await createSyncLog('IPO', dryRun);
  const counts: SyncCounts = { created: 0, updated: 0, unchanged: 0, failed: 0 };
  const errors: string[] = [];
  const changes: DryRunChange[] = [];

  try {
    const provider = getProvider();
    const providerData = await provider.fetchIPOs();

    for (const raw of providerData) {
      try {
        const normalized = normalizeIpoData(raw);
        const validation = validateIpoData(normalized);

        if (!validation.valid) {
          counts.failed++;
          errors.push(`${normalized.slug}: ${validation.errors.join(', ')}`);
          continue;
        }

        const existing = await prisma.ipo.findUnique({
          where: { slug: normalized.slug },
        });

        if (!existing) {
          // New IPO
          if (dryRun) {
            changes.push({
              slug: normalized.slug,
              ipoName: normalized.ipoName,
              action: 'CREATE',
            });
          } else {
            // Calculate status from dates
            const status = calculateIpoStatus({
              openDate: normalized.openDate,
              closeDate: normalized.closeDate,
              allotmentDate: normalized.allotmentDate,
              listingDate: normalized.listingDate,
              listingPrice: normalized.listingPrice,
              currentStatus: normalized.status,
            });

            await prisma.ipo.create({
              data: {
                slug: normalized.slug,
                ipoName: normalized.ipoName,
                companyName: normalized.companyName,
                ipoType: normalized.ipoType,
                status,
                openDate: normalized.openDate,
                closeDate: normalized.closeDate,
                allotmentDate: normalized.allotmentDate,
                listingDate: normalized.listingDate,
                refundDate: normalized.refundDate,
                dematDate: normalized.dematDate,
                priceBandMin: normalized.priceBandMin,
                priceBandMax: normalized.priceBandMax,
                lotSize: normalized.lotSize,
                issueSize: normalized.issueSize,
                issueSizeCrore: normalized.issueSizeCrore,
                faceValue: normalized.faceValue,
                freshIssue: normalized.freshIssue,
                ofs: normalized.ofs,
                gmp: normalized.gmp,
                subTotal: normalized.subTotal,
                subRetail: normalized.subRetail,
                subQib: normalized.subQib,
                subNii: normalized.subNii,
                subEmployee: normalized.subEmployee,
                listingPrice: normalized.listingPrice,
                revenue: normalized.revenue,
                profit: normalized.profit,
                ebitda: normalized.ebitda,
                totalAssets: normalized.totalAssets,
                netWorth: normalized.netWorth,
                eps: normalized.eps,
                roe: normalized.roe,
                roce: normalized.roce,
                debtToEquity: normalized.debtToEquity,
                exchange: normalized.exchange,
                marketMaker: normalized.marketMaker,
                industry: normalized.industry,
                sector: normalized.sector,
                about: normalized.about,
                promoters: normalized.promoters,
                registrar: normalized.registrar,
                leadManagers: normalized.leadManagers,
                location: normalized.location,
                source: provider.name,
                sourceUpdatedAt: new Date(),
              },
            });
          }
          counts.created++;
        } else {
          // Existing IPO — diff
          const diff = diffIpoData(existing, normalized);

          if (!diff.changed) {
            counts.unchanged++;
            if (dryRun) {
              changes.push({
                slug: normalized.slug,
                ipoName: normalized.ipoName,
                action: 'UNCHANGED',
              });
            }
          } else {
            if (dryRun) {
              changes.push({
                slug: normalized.slug,
                ipoName: normalized.ipoName,
                action: 'UPDATE',
                changedFields: diff.changedFields,
              });
            } else {
              // Build update data from changed fields only
              const updateData: Record<string, unknown> = {};
              for (const field of Object.keys(diff.changedFields)) {
                updateData[field] = diff.changedFields[field].new;
              }

              // Recalculate status
              const status = calculateIpoStatus({
                openDate: normalized.openDate,
                closeDate: normalized.closeDate,
                allotmentDate: normalized.allotmentDate,
                listingDate: normalized.listingDate,
                listingPrice: normalized.listingPrice,
                currentStatus: existing.status,
              });
              updateData.status = status;
              updateData.source = provider.name;
              updateData.sourceUpdatedAt = new Date();

              await prisma.ipo.update({
                where: { id: existing.id },
                data: updateData,
              });
            }
            counts.updated++;
          }
        }
      } catch (err) {
        counts.failed++;
        errors.push(`${raw.slug}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await completeSyncLog(syncLog.id, counts, startTime);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    errors.push(errorMsg);
    await completeSyncLog(syncLog.id, counts, startTime, errorMsg);
  }

  return buildSyncResult('IPO', counts, errors, dryRun, Date.now() - startTime, changes);
}

// ── Sync GMP ───────────────────────────────────────────────

export async function syncGMP(options: SyncOptions = {}): Promise<SyncResult> {
  const { dryRun = false } = options;
  const startTime = Date.now();
  const syncLog = await createSyncLog('GMP', dryRun);
  const counts: SyncCounts = { created: 0, updated: 0, unchanged: 0, failed: 0 };
  const errors: string[] = [];
  const changes: DryRunChange[] = [];

  try {
    const provider = getProvider();
    const gmpData = await provider.fetchGMPs();

    for (const item of gmpData) {
      try {
        const gmpValidation = validateGmpData(item.gmp);
        if (!gmpValidation.valid) {
          counts.failed++;
          errors.push(`${item.slug}: ${gmpValidation.errors.join(', ')}`);
          continue;
        }

        const ipo = await prisma.ipo.findUnique({
          where: { slug: item.slug },
        });

        if (!ipo) {
          counts.failed++;
          errors.push(`${item.slug}: IPO not found`);
          continue;
        }

        if (ipo.gmp === item.gmp) {
          counts.unchanged++;
          if (dryRun) {
            changes.push({ slug: item.slug, ipoName: ipo.ipoName, action: 'UNCHANGED' });
          }
          continue;
        }

        if (dryRun) {
          changes.push({
            slug: item.slug,
            ipoName: ipo.ipoName,
            action: 'UPDATE',
            changedFields: { gmp: { old: ipo.gmp, new: item.gmp } },
          });
        } else {
          const priceBandMax = Number(ipo.priceBandMax);
          const estimatedListingPrice = priceBandMax > 0 ? priceBandMax + item.gmp : null;
          const estimatedGainPercent = priceBandMax > 0 ? (item.gmp / priceBandMax) * 100 : null;

          await prisma.$transaction([
            prisma.ipo.update({
              where: { id: ipo.id },
              data: {
                previousGmp: ipo.gmp,
                gmp: item.gmp,
                gmpUpdatedAt: new Date(),
                source: provider.name,
                sourceUpdatedAt: new Date(),
              },
            }),
            prisma.gmpHistory.create({
              data: {
                ipoId: ipo.id,
                gmp: item.gmp,
                estimatedListingPrice,
                estimatedGainPercent,
              },
            }),
          ]);
        }
        counts.updated++;
      } catch (err) {
        counts.failed++;
        errors.push(`${item.slug}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await completeSyncLog(syncLog.id, counts, startTime);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    errors.push(errorMsg);
    await completeSyncLog(syncLog.id, counts, startTime, errorMsg);
  }

  return buildSyncResult('GMP', counts, errors, dryRun, Date.now() - startTime, changes);
}

// ── Sync Subscriptions ─────────────────────────────────────

export async function syncSubscriptions(options: SyncOptions = {}): Promise<SyncResult> {
  const { dryRun = false } = options;
  const startTime = Date.now();
  const syncLog = await createSyncLog('SUBSCRIPTION', dryRun);
  const counts: SyncCounts = { created: 0, updated: 0, unchanged: 0, failed: 0 };
  const errors: string[] = [];
  const changes: DryRunChange[] = [];

  try {
    const provider = getProvider();
    const subData = await provider.fetchSubscriptions();

    for (const item of subData) {
      try {
        const qib = typeof item.qib === 'string' ? parseFloat(item.qib) : (item.qib ?? 0);
        const nii = typeof item.nii === 'string' ? parseFloat(item.nii) : (item.nii ?? 0);
        const retail = typeof item.retail === 'string' ? parseFloat(item.retail) : (item.retail ?? 0);
        const employee = typeof item.employee === 'string' ? parseFloat(item.employee) : (item.employee ?? 0);
        const total = typeof item.total === 'string' ? parseFloat(item.total) : (item.total ?? 0);

        const subValidation = validateSubscriptionData({ qib, nii, retail, total });
        if (!subValidation.valid) {
          counts.failed++;
          errors.push(`${item.slug}: ${subValidation.errors.join(', ')}`);
          continue;
        }

        const ipo = await prisma.ipo.findUnique({
          where: { slug: item.slug },
        });

        if (!ipo) {
          counts.failed++;
          errors.push(`${item.slug}: IPO not found`);
          continue;
        }

        const dateObj = new Date(item.date);
        if (isNaN(dateObj.getTime())) {
          counts.failed++;
          errors.push(`${item.slug}: Invalid date`);
          continue;
        }
        // Strip time for date-only comparison
        const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

        if (dryRun) {
          changes.push({
            slug: item.slug,
            ipoName: ipo.ipoName,
            action: 'UPDATE',
            changedFields: {
              subTotal: { old: Number(ipo.subTotal), new: total },
              date: { old: null, new: dateOnly.toISOString().split('T')[0] },
            },
          });
        } else {
          // Upsert subscription history snapshot
          await prisma.subscriptionHistory.upsert({
            where: {
              ipoId_date: { ipoId: ipo.id, date: dateOnly },
            },
            create: {
              ipoId: ipo.id,
              date: dateOnly,
              qib,
              nii,
              retail,
              employee,
              total,
            },
            update: {
              qib,
              nii,
              retail,
              employee,
              total,
            },
          });

          // Update IPO's current subscription fields
          await prisma.ipo.update({
            where: { id: ipo.id },
            data: {
              subQib: qib,
              subNii: nii,
              subRetail: retail,
              subEmployee: employee,
              subTotal: total,
              sourceUpdatedAt: new Date(),
            },
          });
        }
        counts.updated++;
      } catch (err) {
        counts.failed++;
        errors.push(`${item.slug}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await completeSyncLog(syncLog.id, counts, startTime);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    errors.push(errorMsg);
    await completeSyncLog(syncLog.id, counts, startTime, errorMsg);
  }

  return buildSyncResult('SUBSCRIPTION', counts, errors, dryRun, Date.now() - startTime, changes);
}

// ── Sync Listings ──────────────────────────────────────────

export async function syncListings(options: SyncOptions = {}): Promise<SyncResult> {
  const { dryRun = false } = options;
  const startTime = Date.now();
  const syncLog = await createSyncLog('LISTING', dryRun);
  const counts: SyncCounts = { created: 0, updated: 0, unchanged: 0, failed: 0 };
  const errors: string[] = [];
  const changes: DryRunChange[] = [];

  try {
    const provider = getProvider();
    const listingData = await provider.fetchListings();

    for (const item of listingData) {
      try {
        const ipo = await prisma.ipo.findUnique({
          where: { slug: item.slug },
        });

        if (!ipo) {
          counts.failed++;
          errors.push(`${item.slug}: IPO not found`);
          continue;
        }

        const currentListingPrice = ipo.listingPrice ? Number(ipo.listingPrice) : null;
        if (currentListingPrice === item.listingPrice) {
          counts.unchanged++;
          continue;
        }

        if (dryRun) {
          changes.push({
            slug: item.slug,
            ipoName: ipo.ipoName,
            action: 'UPDATE',
            changedFields: {
              listingPrice: { old: currentListingPrice, new: item.listingPrice },
            },
          });
        } else {
          const listingDate = item.listingDate ? new Date(item.listingDate) : null;
          await prisma.ipo.update({
            where: { id: ipo.id },
            data: {
              listingPrice: item.listingPrice,
              listingDate: listingDate && !isNaN(listingDate.getTime()) ? listingDate : ipo.listingDate,
              status: 'Listed',
              source: provider.name,
              sourceUpdatedAt: new Date(),
            },
          });
        }
        counts.updated++;
      } catch (err) {
        counts.failed++;
        errors.push(`${item.slug}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await completeSyncLog(syncLog.id, counts, startTime);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    errors.push(errorMsg);
    await completeSyncLog(syncLog.id, counts, startTime, errorMsg);
  }

  return buildSyncResult('LISTING', counts, errors, dryRun, Date.now() - startTime, changes);
}

// ── Sync All ───────────────────────────────────────────────

export async function syncAll(options: SyncOptions = {}): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  results.push(await syncIPOs(options));
  results.push(await syncGMP(options));
  results.push(await syncSubscriptions(options));
  results.push(await syncListings(options));
  return results;
}
