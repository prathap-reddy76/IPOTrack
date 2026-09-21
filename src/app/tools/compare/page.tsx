'use client';

import { useState, useEffect } from 'react';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GitCompare, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  useEffect(() => {
    getIPOs().then(data => {
      setIpos(data);
      if (data.length >= 2) {
        setSelectedSlugs([data[0].slug, data[1].slug]);
      }
    });
  }, []);

  const addIpo = () => {
    if (selectedSlugs.length < 4) {
      // Find first unselected IPO
      const unselected = ipos.find(ipo => !selectedSlugs.includes(ipo.slug));
      if (unselected) {
        setSelectedSlugs([...selectedSlugs, unselected.slug]);
      }
    }
  };

  const removeIpo = (index: number) => {
    if (selectedSlugs.length > 2) {
      const newSlugs = [...selectedSlugs];
      newSlugs.splice(index, 1);
      setSelectedSlugs(newSlugs);
    }
  };

  const updateIpo = (index: number, slug: string) => {
    const newSlugs = [...selectedSlugs];
    newSlugs[index] = slug;
    setSelectedSlugs(newSlugs);
  };

  const clearAll = () => {
    if (ipos.length >= 2) {
      setSelectedSlugs([ipos[0].slug, ipos[1].slug]);
    }
  };

  const selectedIpos = selectedSlugs.map(slug => ipos.find(i => i.slug === slug)).filter(Boolean) as IPO[];

  const formatPriceBand = (priceBand: string) => priceBand;
  
  const getGmpPercent = (ipo: IPO) => {
    if (!ipo.priceBand || ipo.gmp === undefined) return 'N/A';
    const nums = ipo.priceBand.replace(/[₹,]/g, '').split('-').map(s => parseFloat(s.trim()));
    const max = nums[1] || nums[0] || 0;
    if (max === 0) return '0%';
    return ((ipo.gmp / max) * 100).toFixed(2) + '%';
  };

  const getEstListingPrice = (ipo: IPO) => {
    if (!ipo.priceBand || ipo.gmp === undefined) return 'N/A';
    const nums = ipo.priceBand.replace(/[₹,]/g, '').split('-').map(s => parseFloat(s.trim()));
    const max = nums[1] || nums[0] || 0;
    if (max === 0) return 'N/A';
    return `₹${(max + ipo.gmp).toLocaleString('en-IN')}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/tools" className="text-emerald-600 hover:underline text-sm mb-1 block">
            &larr; Back to Tools
          </Link>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <GitCompare className="w-8 h-8 text-emerald-600" />
              IPO Comparison Tool
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
              Compare multiple IPOs side by side.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={addIpo} 
              disabled={selectedSlugs.length >= 4}
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <Plus className="w-4 h-4 mr-2" /> Add IPO
            </Button>
            <Button variant="ghost" onClick={clearAll} className="text-slate-500">
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="col-span-1"></div>
            {selectedSlugs.map((slug, index) => (
              <div key={`selector-${index}`} className="col-span-1 flex flex-col gap-2">
                <Select value={slug} onValueChange={(val) => updateIpo(index, val)}>
                  <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                    <SelectValue placeholder="Select IPO" />
                  </SelectTrigger>
                  <SelectContent>
                    {ipos.map(ipo => (
                      <SelectItem 
                        key={ipo.slug} 
                        value={ipo.slug}
                        disabled={selectedSlugs.includes(ipo.slug) && selectedSlugs[index] !== ipo.slug}
                      >
                        {ipo.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSlugs.length > 2 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeIpo(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 self-end dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {/* Name Row */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 flex items-center">
                  Company
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`name-${i}`} className="p-4 font-bold text-emerald-700 dark:text-emerald-400 text-lg flex items-center justify-center text-center border-l border-slate-100 dark:border-slate-800/50">
                    <Link href={`/ipos/${ipo.slug}`} className="hover:underline">{ipo.name}</Link>
                  </div>
                ))}
              </div>

              {/* Price Band */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  Price Band
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`price-${i}`} className="p-4 text-center border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    {formatPriceBand(ipo.priceBand)}
                  </div>
                ))}
              </div>

              {/* GMP */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  GMP (₹)
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`gmp-${i}`} className="p-4 text-center font-bold text-green-600 border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    ₹{ipo.gmp ?? 'N/A'}
                  </div>
                ))}
              </div>

              {/* GMP % */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  GMP %
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`gmpp-${i}`} className="p-4 text-center font-bold text-green-600 border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    {getGmpPercent(ipo)}
                  </div>
                ))}
              </div>

              {/* Issue Size */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  Issue Size
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`size-${i}`} className="p-4 text-center border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    {ipo.issueSize}
                  </div>
                ))}
              </div>

              {/* Lot Size */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  Lot Size
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`lot-${i}`} className="p-4 text-center border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    {ipo.lotSize || `${ipo.sharesPerLot} Shares`}
                  </div>
                ))}
              </div>

              {/* IPO Type */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  IPO Type
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`type-${i}`} className="p-4 text-center border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium uppercase">
                      {ipo.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  Opening Date
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`open-${i}`} className="p-4 text-center border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    {ipo.openDate ? new Date(ipo.openDate).toLocaleDateString() : 'TBA'}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div className="p-4 font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 flex items-center">
                  Closing Date
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`close-${i}`} className="p-4 text-center border-l border-slate-100 dark:border-slate-800/50 flex items-center justify-center">
                    {ipo.closeDate ? new Date(ipo.closeDate).toLocaleDateString() : 'TBA'}
                  </div>
                ))}
              </div>

              {/* Est Listing Price */}
              <div className="grid grid-cols-5 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors bg-emerald-50/30 dark:bg-emerald-900/10">
                <div className="p-4 font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center">
                  Est. Listing Price
                </div>
                {selectedIpos.map((ipo, i) => (
                  <div key={`est-${i}`} className="p-4 text-center font-bold text-lg text-emerald-700 dark:text-emerald-400 border-l border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center">
                    {getEstListingPrice(ipo)}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
