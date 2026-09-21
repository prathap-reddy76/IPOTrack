'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getIPOGmpHistory } from '@/lib/actions/admin-stats';
import { updateGMP } from '@/lib/actions/gmp-actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogClose 
} from '@/components/ui/dialog';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

export default function GMPHistory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ipo: { id: string; ipoName: string; gmp: number; priceBandMax: number } | null, history: { id: string; gmp: number; estimatedListingPrice: number | null; estimatedGainPercent: number | null; recordedAt: string }[]}>({ ipo: null, history: [] });
  
  const [gmpDialogOpen, setGmpDialogOpen] = useState(false);
  const [newGmp, setNewGmp] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getIPOGmpHistory(id);
        if (cancelled) return;
        if (!res.ipo) {
          toast.error('IPO not found');
          router.push('/admin/ipos');
          return;
        }
        setData(res);
        setNewGmp(res.ipo.gmp?.toString() || '0');
      } catch {
        if (!cancelled) toast.error('Failed to load GMP history');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status, id, reloadKey, router]);

  const handleUpdateGMP = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateGMP(id, Number(newGmp));
      toast.success('GMP updated successfully');
      setGmpDialogOpen(false);
      setReloadKey(k => k + 1); // Trigger data refresh
    } catch {
      toast.error('Failed to update GMP');
    } finally {
      setActionLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!data.ipo) return null;

  const chartData = [...data.history].reverse().map(item => ({
    date: format(new Date(item.recordedAt), 'MMM dd'),
    fullDate: format(new Date(item.recordedAt), 'MMM dd, yyyy HH:mm'),
    gmp: item.gmp
  }));

  const maxPrice = data.ipo.priceBandMax || 0;

  return (
    <div className="flex-1 p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/ipos">
            <Button variant="ghost" size="sm" className="text-slate-500">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to IPOs
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              GMP History: {data.ipo.ipoName}
            </h1>
            <p className="text-slate-500">Track grey market premium trends</p>
          </div>
          <Button 
            onClick={() => setGmpDialogOpen(true)}
            className="bg-[#0F3D2E] hover:bg-emerald-800 text-white"
          >
            <TrendingUp className="h-4 w-4 mr-2" /> Update GMP
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Current GMP</CardTitle>
              <CardDescription>Latest estimated market premium</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                ₹{data.ipo.gmp || 0}
              </div>
              <div className="space-y-2 mt-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Base Price (Max)</span>
                  <span className="font-medium">₹{maxPrice}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Est. Listing Price</span>
                  <span className="font-medium">₹{maxPrice + (data.ipo.gmp || 0)}</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-500">Est. Gain</span>
                  <span className={`font-medium ${data.ipo.gmp > 0 ? 'text-green-600' : data.ipo.gmp < 0 ? 'text-red-600' : ''}`}>
                    {maxPrice > 0 ? (((data.ipo.gmp || 0) / maxPrice) * 100).toFixed(2) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>GMP Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{fontSize: 12}} />
                      <YAxis tick={{fontSize: 12}} />
                      <Tooltip 
                        labelFormatter={(value) => String(value)}
                        formatter={(value) => [`₹${value}`, 'GMP']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="gmp" 
                        stroke="#0F3D2E" 
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#0F3D2E' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-500">
                  No GMP history available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>History Log</CardTitle>
          </CardHeader>
          <CardContent>
            {data.history.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No GMP updates recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-6 py-3 font-medium">Date & Time</th>
                      <th className="px-6 py-3 font-medium">GMP (₹)</th>
                      <th className="px-6 py-3 font-medium">Est. Listing Price (₹)</th>
                      <th className="px-6 py-3 font-medium">Est. Gain (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.history.map((item) => {
                      const estListing = maxPrice + item.gmp;
                      const estGain = maxPrice > 0 ? ((item.gmp / maxPrice) * 100).toFixed(2) : 0;
                      
                      return (
                        <tr key={item.id} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-6 py-4">
                            {format(new Date(item.recordedAt), 'MMM dd, yyyy HH:mm')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${item.gmp > 0 ? 'text-green-600' : item.gmp < 0 ? 'text-red-600' : ''}`}>
                              {item.gmp > 0 ? '+' : ''}₹{item.gmp}
                            </span>
                          </td>
                          <td className="px-6 py-4">₹{estListing}</td>
                          <td className="px-6 py-4">
                            <span className={Number(estGain) > 0 ? 'text-green-600' : Number(estGain) < 0 ? 'text-red-600' : ''}>
                              {Number(estGain) > 0 ? '+' : ''}{estGain}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GMP Update Dialog */}
      <Dialog open={gmpDialogOpen} onOpenChange={setGmpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update GMP</DialogTitle>
            <DialogDescription>
              Enter the latest grey market premium for this IPO.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateGMP} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gmp">Current GMP (₹)</Label>
              <Input 
                id="gmp" 
                type="number" 
                value={newGmp} 
                onChange={(e) => setNewGmp(e.target.value)} 
                required 
              />
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Base Price (Max):</span>
                <span className="font-medium">₹{maxPrice}</span>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>Estimated Listing:</span>
                <span>₹{maxPrice + Number(newGmp || 0)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                <span>Estimated Gain:</span>
                <span>{maxPrice > 0 ? ((Number(newGmp || 0) / maxPrice) * 100).toFixed(2) : 0}%</span>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={actionLoading} className="bg-[#0F3D2E] hover:bg-emerald-800 text-white">
                {actionLoading ? 'Updating...' : 'Update GMP'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
