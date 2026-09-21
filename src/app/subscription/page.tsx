'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubscriptionPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpenIPOs = async () => {
      try {
        const data = await getIPOs({ status: 'Open' });
        setIpos(data);
      } catch (error) {
        console.error('Error fetching Open IPOs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpenIPOs();
  }, []);

  const getSubColor = (val: number | string | undefined) => {
    const num = Number(val) || 0;
    if (num >= 10) return "bg-emerald-500";
    if (num >= 1) return "bg-blue-500";
    return "bg-amber-500";
  };

  const SubProgress = ({ label, value, color }: { label: string, value: string | number | undefined, color: string }) => {
    const numValue = Number(value) || 0;
    const displayValue = numValue > 0 ? `${numValue.toFixed(2)}x` : '-';
    // cap width at 100% visually
    const width = Math.min(100, Math.max(0, (numValue / 20) * 100)); // arbitrary scale where 20x is 100% width

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{displayValue}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-500`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Subscription Intelligence</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Live subscription status for open IPOs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))
        ) : ipos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
            No IPOs are currently open for subscription.
          </div>
        ) : (
          ipos.map((ipo) => (
            <Card key={ipo.id} className="flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-lg">
                  <Link href={`/ipos/${ipo.slug}`} className="hover:text-emerald-600 transition-colors">
                    {ipo.name}
                  </Link>
                </CardTitle>
                <div className="text-sm text-slate-500 mt-1">Closes: {ipo.closeDate}</div>
              </CardHeader>
              <CardContent className="pt-4 flex-grow space-y-5">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Total Subscription</div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {ipo.subscription?.total || '0'}x
                  </div>
                </div>

                <div className="space-y-4">
                  <SubProgress label="QIB" value={ipo.subscription?.qib} color={getSubColor(ipo.subscription?.qib)} />
                  <SubProgress label="NII" value={ipo.subscription?.nii} color={getSubColor(ipo.subscription?.nii)} />
                  <SubProgress label="Retail" value={ipo.subscription?.retail} color={getSubColor(ipo.subscription?.retail)} />
                  {ipo.subscription?.employee && Number(ipo.subscription.employee) > 0 && (
                    <SubProgress label="Employee" value={ipo.subscription?.employee} color="bg-purple-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
