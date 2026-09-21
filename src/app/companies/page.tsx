'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CompaniesPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getIPOs();
        setIpos(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredIpos = ipos.filter(ipo => 
    ipo.name.toLowerCase().includes(search.toLowerCase()) || 
    (ipo.sector && ipo.sector.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Company Directory</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Browse all companies tracked by IPOTrack.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search company or sector..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="hidden md:block border rounded-lg overflow-hidden bg-white dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Company Name</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Sector</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">IPO Type</th>
                <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-4 py-4"><Skeleton className="h-8 w-full" /></td>
                  </tr>
                ))
              ) : filteredIpos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No companies found.</td>
                </tr>
              ) : (
                filteredIpos.map((ipo) => (
                  <tr key={ipo.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-4">
                      <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-emerald-900 dark:text-emerald-400 hover:underline">
                        {ipo.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{ipo.sector || 'N/A'}</td>
                    <td className="px-4 py-4">{ipo.type}</td>
                    <td className="px-4 py-4">
                      <Badge variant="outline">{ipo.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))
        ) : filteredIpos.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 border rounded-lg bg-slate-50 dark:bg-slate-900">
            No companies found.
          </div>
        ) : (
          filteredIpos.map((ipo) => (
            <Card key={ipo.id}>
              <CardContent className="p-4">
                <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-emerald-900 dark:text-emerald-400 hover:underline block mb-2">
                  {ipo.name}
                </Link>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">{ipo.sector || 'N/A'}</span>
                  <Badge variant="outline">{ipo.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
