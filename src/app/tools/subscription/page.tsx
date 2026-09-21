'use client';

import { useState, useEffect } from 'react';
import { getIPOs, getSubscriptionData, getSubscriptionHistory } from '@/lib/api';
import { IPO, SubscriptionData, SubscriptionHistory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SubscriptionPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [subData, setSubData] = useState<SubscriptionData | null>(null);
  const [historyData, setHistoryData] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIpos = async () => {
      const data = await getIPOs();
      setIpos(data);
      if (data.length > 0) {
        setSelectedSlug(data[0].slug);
      }
    };
    fetchIpos();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSlug) return;
      setLoading(true);
      const [data, hist] = await Promise.all([
        getSubscriptionData(selectedSlug),
        getSubscriptionHistory(selectedSlug)
      ]);
      setSubData(data || null);
      setHistoryData(hist || []);
      setLoading(false);
    };
    fetchData();
  }, [selectedSlug]);

  const getProgressBar = (value: number, max: number, colorClass: string) => {
    const percent = Math.min((value / max) * 100, 100);
    return (
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-2 overflow-hidden">
        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${percent}%` }}></div>
      </div>
    );
  };

  const categories = [
    { key: 'qib', label: 'QIB', color: 'bg-blue-500', barColor: '#3b82f6' },
    { key: 'nii', label: 'NII', color: 'bg-purple-500', barColor: '#a855f7' },
    { key: 'retail', label: 'Retail', color: 'bg-green-500', barColor: '#22c55e' },
    { key: 'employee', label: 'Employee', color: 'bg-amber-500', barColor: '#f59e0b' },
    { key: 'total', label: 'Total', color: 'bg-emerald-600', barColor: '#059669' },
  ];

  // Determine max value to scale progress bars reasonably
  const maxSub = subData ? Math.max(
    subData.qib || 0, 
    subData.nii || 0, 
    subData.retail || 0, 
    subData.employee || 0, 
    subData.total || 0,
    10 // minimum scale
  ) : 100;

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-5xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/tools" className="text-emerald-600 hover:underline text-sm mb-1 block">
            &larr; Back to Tools
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <Activity className="w-8 h-8 text-emerald-600" />
              Subscription Tracker
              <Badge variant="secondary" className="ml-3 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">Demo Data</Badge>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
              Track IPO subscription status across categories.
            </p>
          </div>
          
          <div className="w-full md:w-72">
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger className="bg-white dark:bg-slate-950">
                <SelectValue placeholder="Select IPO" />
              </SelectTrigger>
              <SelectContent>
                {ipos.map(ipo => (
                  <SelectItem key={ipo.slug} value={ipo.slug}>
                    {ipo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-500">
          Loading subscription data...
        </div>
      ) : subData ? (
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription Status</CardTitle>
              <CardDescription>Live update as of {new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.map(cat => {
                const val = subData[cat.key as keyof typeof subData] as number || 0;
                // Only show employee if it's > 0 or it's totally missing
                if (cat.key === 'employee' && !val) return null;
                
                return (
                  <div key={cat.key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{val.toFixed(2)}x</span>
                    </div>
                    {getProgressBar(val, maxSub, cat.color)}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historical Subscription</CardTitle>
              <CardDescription>Day by day progression</CardDescription>
            </CardHeader>
            <CardContent>
              {historyData.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => `Day ${historyData.findIndex(h => h.date === v) + 1}`}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => `${v}x`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value}x`]}
                      />
                      <Legend />
                      <Bar dataKey="qib" name="QIB" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="nii" name="NII" stackId="a" fill="#a855f7" />
                      <Bar dataKey="retail" name="Retail" stackId="a" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center text-slate-500">
                  No historical data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          No subscription data available for this IPO.
        </div>
      )}
    </div>
  );
}
