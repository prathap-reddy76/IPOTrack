'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function AllotmentPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllotmentIPOs = async () => {
      try {
        const data = await getIPOs({ status: 'Closed' });
        setIpos(data);
      } catch (error) {
        console.error('Error fetching allotment IPOs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllotmentIPOs();
  }, []);

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Allotment Status</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Check allotment status for recently closed IPOs.
        </p>
      </div>

      <div className="hidden md:block border rounded-lg overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Company</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Close Date</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Allotment Date</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Listing Date</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4"><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : ipos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No IPOs currently in allotment phase.</td>
                </tr>
              ) : (
                ipos.map((ipo) => (
                  <tr key={ipo.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-4">
                      <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-emerald-900 dark:text-emerald-400 hover:underline">
                        {ipo.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{ipo.closeDate}</td>
                    <td className="px-4 py-4 font-medium">{ipo.allotmentDate || 'TBA'}</td>
                    <td className="px-4 py-4">{ipo.listingDate || 'TBA'}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="bg-slate-100 text-slate-800 border-transparent dark:bg-slate-800 dark:text-slate-300">
                        {ipo.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/ipos/${ipo.slug}`}>
                          View <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
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
            No IPOs currently in allotment phase.
          </div>
        ) : (
          ipos.map((ipo) => (
            <Card key={ipo.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-lg text-emerald-900 dark:text-emerald-400 hover:underline">
                    {ipo.name}
                  </Link>
                  <Badge variant="outline" className="bg-slate-100 text-slate-800 border-transparent dark:bg-slate-800 dark:text-slate-300 ml-2">
                    {ipo.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Close Date</div>
                    <div className="font-medium">{ipo.closeDate}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Allotment Date</div>
                    <div className="font-medium text-emerald-700 dark:text-emerald-500">{ipo.allotmentDate || 'TBA'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Listing Date</div>
                    <div className="font-medium">{ipo.listingDate || 'TBA'}</div>
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline" asChild>
                  <Link href={`/ipos/${ipo.slug}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
