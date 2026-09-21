'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function IPOsPage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [tab, setTab] = useState('all'); // all, upcoming, open, closed, mainboard, sme
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [sort, setSort] = useState('opening_date');
  
  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    let active = true;
    const fetchIPOs = async () => {
      setLoading(true);
      
      // Map tab to status or type filter based on value
      let statusFilter = 'all';
      let typeFilter = 'all';
      
      if (['open', 'upcoming', 'closed'].includes(tab)) {
        statusFilter = tab;
      } else if (['mainboard', 'sme'].includes(tab)) {
        typeFilter = tab;
      }
      
      try {
        const data = await getIPOs({
          status: statusFilter,
          type: typeFilter,
          sector: sector,
          search: search,
          sort: sort
        });
        
        if (active) {
          setIpos(data);
          setPage(1); // reset to page 1 on filter change
        }
      } catch (error) {
        console.error('Error fetching IPOs', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    // Add small debounce for search
    const timer = setTimeout(() => {
      fetchIPOs();
    }, 300);
    
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [tab, search, sector, sort]);

  const totalPages = Math.ceil(ipos.length / itemsPerPage);
  const paginatedIpos = ipos.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'closed': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const parseMaxPrice = (priceBand: string) => {
    const nums = priceBand.replace(/[₹,]/g, '').split('-').map(s => parseFloat(s.trim()));
    return nums[1] || nums[0] || 0;
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">IPO Market</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Explore upcoming, ongoing and closed IPOs with real-time GMP and subscription data.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full overflow-x-auto">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="mainboard">Mainboard</TabsTrigger>
            <TabsTrigger value="sme">SME</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search companies..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger>
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="infrastructure">Infrastructure</SelectItem>
              <SelectItem value="chemicals">Chemicals</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="opening_date">Opening Date</SelectItem>
              <SelectItem value="closing_date">Closing Date</SelectItem>
              <SelectItem value="gmp">GMP</SelectItem>
              <SelectItem value="gmp_percent">GMP %</SelectItem>
              <SelectItem value="issue_size">Issue Size</SelectItem>
              <SelectItem value="company_name">Company Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block border rounded-lg overflow-hidden bg-white dark:bg-slate-950">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Company</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Price Band (₹)</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">GMP (₹)</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Est. Listing</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Gain %</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Dates</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="px-4 py-4"><Skeleton className="h-10 w-full" /></td>
                    </tr>
                  ))
                ) : paginatedIpos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No IPOs found matching your criteria.</td>
                  </tr>
                ) : (
                  paginatedIpos.map((ipo) => {
                    const maxPrice = parseMaxPrice(ipo.priceBand);
                    const estListing = maxPrice > 0 ? maxPrice + ipo.gmp : 0;
                    const gainPercent = maxPrice > 0 ? (ipo.gmp / maxPrice) * 100 : 0;
                    const isPositive = ipo.gmp >= 0;

                    return (
                      <tr key={ipo.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-4">
                          <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-emerald-900 dark:text-emerald-400 hover:underline">
                            {ipo.name}
                          </Link>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ipo.type}</div>
                        </td>
                        <td className="px-4 py-4">{ipo.priceBand}</td>
                        <td className={`px-4 py-4 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ₹{ipo.gmp}
                        </td>
                        <td className="px-4 py-4">
                          {estListing > 0 ? `₹${estListing.toFixed(2)}` : 'N/A'}
                        </td>
                        <td className={`px-4 py-4 font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {gainPercent.toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-xs">Open: {ipo.openDate}</div>
                          <div className="text-xs">Close: {ipo.closeDate}</div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className={`${getStatusColor(ipo.status)} border-transparent`}>
                            {ipo.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/ipos/${ipo.slug}`}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent>
              </Card>
            ))
          ) : paginatedIpos.length === 0 ? (
            <div className="py-8 text-center text-slate-500 border rounded-lg bg-slate-50 dark:bg-slate-900">
              No IPOs found matching your criteria.
            </div>
          ) : (
            paginatedIpos.map((ipo) => {
              const maxPrice = parseMaxPrice(ipo.priceBand);
              const estListing = maxPrice > 0 ? maxPrice + ipo.gmp : 0;
              const gainPercent = maxPrice > 0 ? (ipo.gmp / maxPrice) * 100 : 0;
              const isPositive = ipo.gmp >= 0;
              
              return (
                <Card key={ipo.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/ipos/${ipo.slug}`} className="font-semibold text-lg text-emerald-900 dark:text-emerald-400 hover:underline line-clamp-1">
                          {ipo.name}
                        </Link>
                        <div className="text-xs text-slate-500">{ipo.type}</div>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(ipo.status)} border-transparent ml-2`}>
                        {ipo.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-4 text-sm">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Price Band</div>
                        <div className="font-medium">{ipo.priceBand}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Dates</div>
                        <div className="font-medium">{ipo.openDate.substring(0, 6)} - {ipo.closeDate.substring(0, 6)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">GMP</div>
                        <div className={`font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ₹{ipo.gmp} ({gainPercent.toFixed(2)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Est. Listing</div>
                        <div className="font-medium">{estListing > 0 ? `₹${estListing.toFixed(2)}` : 'N/A'}</div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 bg-emerald-900 hover:bg-emerald-800 text-white" asChild>
                      <Link href={`/ipos/${ipo.slug}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, ipos.length)} of {ipos.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <div className="text-sm font-medium px-2">
                Page {page} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
