'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function RankingsPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllIPOs = async () => {
      try {
        const data = await getIPOs();
        setIpos(data);
      } catch (error) {
        console.error('Error fetching IPOs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllIPOs();
  }, []);

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  // Data processing
  const parseSize = (sizeStr: string) => {
    if (!sizeStr) return 0;
    const num = parseFloat(sizeStr.replace(/[^\d.]/g, ''));
    if (sizeStr.toLowerCase().includes('cr')) return num * 10000000;
    return num;
  };

  const parseIssuePrice = (priceBand: string) => {
    return parseFloat(priceBand.replace(/[₹,]/g, '').split('-').pop() || '0');
  };

  const topGmp = [...ipos]
    .sort((a, b) => (Number(b.gmp) || 0) - (Number(a.gmp) || 0))
    .slice(0, 10);

  const topSubscription = [...ipos]
    .filter(i => i.subscription && i.subscription.total)
    .sort((a, b) => {
      const subA = parseFloat(a.subscription?.total?.toString() || '0');
      const subB = parseFloat(b.subscription?.total?.toString() || '0');
      return subB - subA;
    })
    .slice(0, 10);

  const bestGainPercent = [...ipos]
    .filter(i => parseIssuePrice(i.priceBand) > 0)
    .sort((a, b) => {
      const priceA = parseIssuePrice(a.priceBand);
      const priceB = parseIssuePrice(b.priceBand);
      const gainA = priceA > 0 ? ((Number(a.gmp) || 0) / priceA) * 100 : 0;
      const gainB = priceB > 0 ? ((Number(b.gmp) || 0) / priceB) * 100 : 0;
      return gainB - gainA;
    })
    .slice(0, 10);

  const largestIpos = [...ipos]
    .sort((a, b) => parseSize(b.issueSize) - parseSize(a.issueSize))
    .slice(0, 10);

  const renderTable = (items: IPO[], metricLabel: string, getMetric: (ipo: IPO) => React.ReactNode) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b">
          <tr>
            <th className="px-4 py-2 w-12 text-center text-slate-500">#</th>
            <th className="px-4 py-2 font-medium text-slate-500">Company</th>
            <th className="px-4 py-2 font-medium text-slate-500 text-right">{metricLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((ipo, idx) => (
            <tr key={ipo.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <td className="px-4 py-3 text-center text-slate-400 font-medium">{idx + 1}</td>
              <td className="px-4 py-3">
                <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-emerald-900 dark:text-emerald-400 hover:underline">
                  {ipo.name}
                </Link>
                <div className="mt-1">
                  <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 border-slate-200 dark:border-slate-700">
                    {ipo.type}
                  </Badge>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium">{getMetric(ipo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">IPO Rankings</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Top 10 lists across various metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Highest GMP</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderTable(topGmp, 'GMP (₹)', (ipo) => (
              <span className="text-green-600 dark:text-green-400">₹{ipo.gmp}</span>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Highest Subscription</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderTable(topSubscription, 'Total Sub (x)', (ipo) => (
              <span>{ipo.subscription?.total || '0'}x</span>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Expected Gain %</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderTable(bestGainPercent, 'Expected Gain', (ipo) => {
              const price = parseIssuePrice(ipo.priceBand);
              const gain = price > 0 ? ((Number(ipo.gmp) || 0) / price) * 100 : 0;
              return <span className="text-green-600 dark:text-green-400">{gain.toFixed(2)}%</span>;
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Largest IPOs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {renderTable(largestIpos, 'Issue Size', (ipo) => (
              <span>{ipo.issueSize}</span>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
