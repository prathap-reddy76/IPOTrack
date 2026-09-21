'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { RefreshCw, AlertTriangle, Activity, CheckCircle, XCircle } from 'lucide-react';

interface SyncLog {
  id: string;
  type: string;
  status: string;
  recordsCreated: number;
  recordsUpdated: number;
  recordsUnchanged: number;
  recordsFailed: number;
  dryRun: boolean;
  duration: number | null;
  error: string | null;
  startedAt: string;
  completedAt: string | null;
}

interface SyncLogGroup {
  type: string;
  log: SyncLog | null;
}

export default function AdminSyncPage() {
  const { status } = useSession();
  const router = useRouter();
  const [syncLogs, setSyncLogs] = useState<SyncLogGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [providerInfo, setProviderInfo] = useState<{ mode: string; ipoProvider: string; gmpProvider: string } | null>(null);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [healthStatus, setHealthStatus] = useState<{
    mode: string;
    upstox: { status: string; message: string; latencyMs?: number };
    ipoalerts: { status: string; message: string; latencyMs?: number };
  } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/admin/sync/health');
      if (res.ok) {
        const data = await res.json();
        setHealthStatus(data);
        const upOk = data.upstox?.status === 'CONNECTED';
        const gmpOk = data.ipoalerts?.status === 'CONNECTED';
        toast.success(`Health: Upstox ${upOk ? '✅' : '❌'} | ipoalerts ${gmpOk ? '✅' : '❌'}`);
      } else {
        toast.error('Health check failed');
      }
    } catch {
      toast.error('Failed to run health check');
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const fetchLogs = () => {
    fetch('/api/admin/sync')
      .then(res => res.json())
      .then((data) => {
        // Handle new format { logs, provider } or legacy array format
        if (data.logs) {
          setSyncLogs(data.logs);
          setProviderInfo(data.provider ?? null);
        } else if (Array.isArray(data)) {
          setSyncLogs(data);
        }
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLogs();
    }
  }, [status]);

  const handleSync = async (type: string, isDryRun: boolean = false) => {
    setSyncing(prev => ({ ...prev, [`${type}-${isDryRun ? 'dry' : 'run'}`]: true }));
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, dryRun: isDryRun }),
      });

      const data = await res.json();

      if (res.ok) {
        const result = data.results?.[0];
        if (isDryRun) {
          toast.success(`Dry run complete: ${result?.counts?.unchanged ?? 0} unchanged, ${result?.counts?.updated ?? 0} would update`);
        } else {
          toast.success(
            `Sync complete: ${result?.counts?.created ?? 0} created, ${result?.counts?.updated ?? 0} updated, ${result?.counts?.failed ?? 0} failed`
          );
        }
        fetchLogs();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch {
      toast.error('Failed to connect to sync service');
    } finally {
      setSyncing(prev => ({ ...prev, [`${type}-${isDryRun ? 'dry' : 'run'}`]: false }));
    }
  };

  const handleSyncAll = async () => {
    setSyncing(prev => ({ ...prev, 'ALL-run': true }));
    try {
      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: false }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Full sync completed successfully');
        fetchLogs();
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch {
      toast.error('Failed to connect to sync service');
    } finally {
      setSyncing(prev => ({ ...prev, 'ALL-run': false }));
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Data Synchronization</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage data sync from external providers</p>
          </div>
          <Button
            className="bg-[#0F3D2E] hover:bg-emerald-800 text-white"
            onClick={handleSyncAll}
            disabled={syncing['ALL-run']}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing['ALL-run'] ? 'animate-spin' : ''}`} />
            {syncing['ALL-run'] ? 'Syncing...' : 'Sync All'}
          </Button>
          <Button
            variant="outline"
            onClick={checkHealth}
            disabled={checkingHealth}
          >
            <Activity className={`w-4 h-4 mr-2 ${checkingHealth ? 'animate-pulse' : ''}`} />
            {checkingHealth ? 'Checking...' : 'Health Check'}
          </Button>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Data Mode: {providerInfo?.mode?.toUpperCase() || 'DEMO'}</p>
              {providerInfo && (
                <div className="mt-1 space-y-0.5">
                  <p>IPO Provider: <span className="font-medium">{providerInfo.ipoProvider || 'none'}</span></p>
                  <p>GMP Provider: <span className="font-medium">{providerInfo.gmpProvider || 'none'}</span></p>
                </div>
              )}
              <p className="mt-1">
                {providerInfo?.mode === 'live'
                  ? 'Live mode active. Sync will fetch from the configured providers.'
                  : 'Demo mode — sync reads existing database data. Configure providers and set DATA_MODE=live to enable real sync.'}
              </p>
            </div>
          </div>
        </div>

        {healthStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[healthStatus.upstox, healthStatus.ipoalerts].map((h) => (
              <Card key={h.message} className="border-l-4" style={{ borderLeftColor: h.status === 'CONNECTED' ? '#22c55e' : h.status === 'NOT_CONFIGURED' ? '#eab308' : '#ef4444' }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    {h.status === 'CONNECTED' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : h.status === 'NOT_CONFIGURED' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium text-sm">{h.status}</span>
                    {h.latencyMs != null && (
                      <span className="text-xs text-slate-400 ml-auto">{h.latencyMs}ms</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{h.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['IPO', 'GMP', 'SUBSCRIPTION', 'LISTING', 'NEWS'].map((syncType) => {
            const logGroup = syncLogs.find(l => l.type === syncType);
            const log = logGroup?.log;
            const isSyncing = syncing[`${syncType}-run`];
            const isDryRunning = syncing[`${syncType}-dry`];

            return (
              <Card key={syncType}>
                <CardHeader>
                  <CardTitle className="text-lg">{syncType} Sync</CardTitle>
                  <CardDescription>Sync {syncType.toLowerCase()} data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span>
                        {log ? (
                          <Badge variant={log.status === 'SUCCESS' ? 'default' : log.status === 'FAILED' ? 'destructive' : 'secondary'}
                                 className={log.status === 'SUCCESS' ? 'bg-green-500' : ''}>
                            {log.status}{log.dryRun ? ' (dry)' : ''}
                          </Badge>
                        ) : 'Never synced'}
                      </span>
                    </div>
                    {log && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Last Sync</span>
                          <span>{format(new Date(log.startedAt), 'MMM dd, HH:mm')}</span>
                        </div>
                        {log.duration != null && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Duration</span>
                            <span>{log.duration < 1000 ? `${log.duration}ms` : `${(log.duration / 1000).toFixed(1)}s`}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Created</span>
                          <span className="text-blue-600 font-medium">{log.recordsCreated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Updated</span>
                          <span className="text-green-600 font-medium">{log.recordsUpdated}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Unchanged</span>
                          <span className="text-slate-600 font-medium">{log.recordsUnchanged}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Failed</span>
                          <span className="text-red-600 font-medium">{log.recordsFailed}</span>
                        </div>
                        {log.error && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300 break-all">
                            {log.error}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-[#0F3D2E] hover:bg-emerald-800 text-white"
                      onClick={() => handleSync(syncType, false)}
                      disabled={isSyncing || isDryRunning}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleSync(syncType, true)}
                      disabled={isSyncing || isDryRunning}
                    >
                      {isDryRunning ? 'Running...' : 'Dry Run'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
