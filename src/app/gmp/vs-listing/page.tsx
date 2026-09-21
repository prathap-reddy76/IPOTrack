'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function GmpVsListingPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListedIPOs = async () => {
      try {
        const data = await getIPOs({ status: 'Listed' });
        // Only keep those with listing price
        setIpos(data.filter(ipo => Number(ipo.listingPrice) > 0));
      } catch (error) {
        console.error('Error fetching Listed IPOs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListedIPOs();
  }, []);

  const parseMaxPrice = (priceBand: string) => {
    const nums = priceBand.replace(/[₹,]/g, '').split('-').map(s => parseFloat(s.trim()));
    return nums[1] || nums[0] || 0;
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">GMP vs Actual Listing</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Compare the expected listing price (based on GMP) with the actual listing price.
        </p>
      </div>

      <div className="hidden md:block border rounded-lg overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Company</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Price Band</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Final GMP</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Expected Listing</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Actual Listing</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4"><Skeleton className="h-8 w-full" /></td>
                  </tr>
                ))
              ) : ipos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No listing data available yet.</td>
                </tr>
              ) : (
                ipos.map((ipo) => {
                  const maxPrice = parseMaxPrice(ipo.priceBand);
                  const expected = maxPrice > 0 ? maxPrice + (Number(ipo.gmp) || 0) : 0;
                  const actual = Number(ipo.listingPrice) || 0;
                  const diff = actual - expected;
                  const isPositiveDiff = diff >= 0;

                  return (
                    <tr key={ipo.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-4">
                        <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-emerald-900 dark:text-emerald-400 hover:underline">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-right">{ipo.priceBand}</td>
                      <td className="px-4 py-4 text-right">₹{ipo.gmp}</td>
                      <td className="px-4 py-4 text-right font-medium">₹{expected.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-bold">₹{actual.toFixed(2)}</td>
                      <td className={`px-4 py-4 text-right font-medium ${isPositiveDiff ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositiveDiff ? '+' : ''}₹{diff.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent>
            </Card>
          ))
        ) : ipos.length === 0 ? (
          <div className="py-8 text-center text-slate-500 border rounded-lg bg-slate-50 dark:bg-slate-900">
            No listing data available yet.
          </div>
        ) : (
          ipos.map((ipo) => {
            const maxPrice = parseMaxPrice(ipo.priceBand);
            const expected = maxPrice > 0 ? maxPrice + (Number(ipo.gmp) || 0) : 0;
            const actual = Number(ipo.listingPrice) || 0;
            const diff = actual - expected;
            const isPositiveDiff = diff >= 0;

            return (
              <Card key={ipo.id}>
                <CardContent className="p-4 space-y-4">
                  <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-lg text-emerald-900 dark:text-emerald-400 hover:underline">
                    {ipo.name}
                  </Link>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs">Expected</div>
                      <div className="font-medium">₹{expected.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Actual Listing</div>
                      <div className="font-bold text-slate-900 dark:text-white">₹{actual.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Difference</div>
                      <div className={`font-medium ${isPositiveDiff ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositiveDiff ? '+' : ''}₹{diff.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
