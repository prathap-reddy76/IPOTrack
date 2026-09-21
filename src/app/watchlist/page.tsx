'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/hooks/use-watchlist';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { toast } from 'sonner';
import { HeartCrack, Heart, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist, isLoading: watchlistLoading } = useWatchlist();
  const [watchlistedIpos, setWatchlistedIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      if (watchlist.length > 0) {
        const allIpos = await getIPOs();
        setWatchlistedIpos(allIpos.filter(ipo => watchlist.includes(ipo.slug)));
      } else {
        setWatchlistedIpos([]);
      }
      setLoading(false);
    };
    fetchWatchlist();
  }, [watchlist]);

  const handleRemove = (slug: string, name: string) => {
    removeFromWatchlist(slug);
    toast.success(`${name} removed from watchlist`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100';
      case 'Upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'Closed': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100';
      case 'Listed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading || watchlistLoading) {
    return <div className="container mx-auto py-12 text-center">Loading watchlist...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
          <Heart className="mr-3 h-8 w-8 text-emerald-600 fill-emerald-600" />
          My Watchlist
        </h1>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {watchlist.length} {watchlist.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      {watchlistedIpos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <HeartCrack className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-6" />
          <h2 className="text-2xl font-semibold mb-2">Your watchlist is empty</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Keep track of IPOs you&apos;re interested in by adding them to your watchlist.
          </p>
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white">
            <Link href="/ipos">Explore IPOs</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlistedIpos.map(ipo => (
            <Card key={ipo.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getStatusColor(ipo.status)}>{ipo.status}</Badge>
                    <div className="text-sm font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded">
                      GMP: ₹{ipo.gmp || '--'}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mt-3 mb-1 line-clamp-1">{ipo.name}</h3>
                  <p className="text-sm text-slate-500">{ipo.openDate} to {ipo.closeDate}</p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Price Band</p>
                    <p className="font-medium">{ipo.priceBand}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/ipos/${ipo.slug}`}>
                        <Eye className="h-4 w-4 mr-2" /> View
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemove(ipo.slug, ipo.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
