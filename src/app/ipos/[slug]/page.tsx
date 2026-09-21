'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getIPOBySlug, getNews } from '@/lib/api';
import { IPO, NewsArticle } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, Share2, Heart, Download, Info, Scale } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useWatchlist } from '@/hooks/use-watchlist';

export default function IPODetailPage() {
  const { slug } = useParams() as { slug: string };
  const [ipo, setIpo] = useState<IPO | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [gmpRange, setGmpRange] = useState('1M');
  const [score, setScore] = useState<{
    total: number;
    gmpTrend: number;
    subscription: number;
    financials: number;
    valuation: number;
    profitability: number;
    industry: number;
    growth: number;
    maxScores: Record<string, number>;
    disclaimer: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const ipoData = await getIPOBySlug(slug);
        if (ipoData) {
          setIpo(ipoData);
          // fetch news related to this ipo
          const allNews = await getNews();
          const relatedNews = allNews.filter(n => n.relatedIpoSlug === slug || n.title.toLowerCase().includes(ipoData.name.toLowerCase()));
          setNews(relatedNews);
          fetch(`/api/ipos/${slug}/score`).then(r => r.json()).then(setScore).catch(() => {});
        }
      } catch (error) {
        console.error('Error fetching IPO details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);
  const filteredGmpHistory = useMemo(() => {
    if (!ipo?.gmpHistory?.length) return [];
    const cutoff = new Date();
    switch (gmpRange) {
      case '7D': cutoff.setDate(cutoff.getDate() - 7); break;
      case '1M': cutoff.setMonth(cutoff.getMonth() - 1); break;
      case '3M': cutoff.setMonth(cutoff.getMonth() - 3); break;
      case '6M': cutoff.setMonth(cutoff.getMonth() - 6); break;
      case '1Y': cutoff.setFullYear(cutoff.getFullYear() - 1); break;
    }
    return ipo.gmpHistory.filter(p => new Date(p.date) >= cutoff);
  }, [ipo, gmpRange]);

  if (loading) {
    return (
      <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-20 w-3/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!ipo) {
    return (
      <div className="container py-20 text-center flex flex-col items-center max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">IPO Not Found</h1>
        <p className="text-slate-500 mb-8">The IPO you are looking for does not exist or has been removed.</p>
        <Button asChild bg-emerald-900 text-white>
          <Link href="/ipos">Back to IPO Market</Link>
        </Button>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${ipo.name} IPO Details`,
          text: `Check out ${ipo.name} IPO details on IPOTrack`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWatchlist = () => {
    if (isInWatchlist(slug)) {
      removeFromWatchlist(slug);
      toast.success("Removed from watchlist");
    } else {
      addToWatchlist(slug);
      toast.success("Added to watchlist");
    }
  };

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

  const maxPrice = parseMaxPrice(ipo.priceBand);
  const estListing = ipo.estimatedListing || (maxPrice > 0 ? Number(maxPrice) + Number(ipo.gmp) : 0);
  const gainPercent = ipo.expectedGainPercent || (maxPrice > 0 ? (Number(ipo.gmp) / Number(maxPrice)) * 100 : 0);
  const isPositiveGmp = Number(ipo.gmp) >= 0;
  const minInvestment = ipo.minInvestment || (maxPrice > 0 && ipo.lotSize ? Number(maxPrice) * Number(ipo.lotSize) : 0);



  const gmpValues = ipo.gmpHistory?.map(h => h.gmp) || [];
  const highestGmp = gmpValues.length ? Math.max(...gmpValues) : ipo.gmp;
  const lowestGmp = gmpValues.length ? Math.min(...gmpValues) : ipo.gmp;
  const avgGmp = gmpValues.length ? gmpValues.reduce((a,b)=>a+b,0) / gmpValues.length : ipo.gmp;

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6">
      <Link href="/ipos" className="inline-flex items-center text-sm text-emerald-900 dark:text-emerald-400 hover:underline mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to IPOs
      </Link>

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant="outline" className="border-emerald-200 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300 uppercase">
              {ipo.type}
            </Badge>
            <Badge variant="outline" className={`${getStatusColor(ipo.status)} border-transparent uppercase`}>
              {ipo.status}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{ipo.name}</h1>
          <p className="text-slate-500 mt-2">{ipo.industry} • {ipo.sector}</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={handleWatchlist}>
            <Heart className={`h-5 w-5 ${isInWatchlist(slug) ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/tools/compare?ipo=${slug}`}>
              <Scale className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none bg-emerald-900 hover:bg-emerald-800 text-white">Apply Now</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for {ipo.name} IPO</DialogTitle>
                <DialogDescription className="pt-4 text-base">
                  IPOTrack does not process IPO applications directly. To apply for this IPO, please use your broker or bank account through ASBA.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md flex items-start gap-3 mt-2">
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Make sure you have an active Demat account and sufficient funds blocked in your bank account before applying.
                </p>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => toast.info('Navigating to registrar website...')}>Visit Registrar Website</Button>
                <Button className="bg-emerald-900 text-white hover:bg-emerald-800" type="submit">Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Price Band</div>
            <div className="text-lg font-semibold">{ipo.priceBand}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">GMP (Today)</div>
            <div className={`text-lg font-semibold ${isPositiveGmp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ₹{ipo.gmp} <span className="text-sm font-normal">({gainPercent.toFixed(2)}%)</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Est. Listing Price</div>
            <div className="text-lg font-semibold">{estListing > 0 ? `₹${estListing.toFixed(2)}` : 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Min. Investment</div>
            <div className="text-lg font-semibold">₹{minInvestment.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">({ipo.lotSize} sh)</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">IPOTrack Score</div>
            <div className="text-lg font-semibold">{score ? `${score.total}/100` : 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Score Card */}
      {score && (
        <Card className="mb-8 overflow-hidden border-emerald-100 dark:border-emerald-900/50">
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-6 flex flex-col md:flex-row items-center justify-between text-white">
            <div className="flex items-center gap-6 mb-4 md:mb-0">
              <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center rounded-full border-4 border-emerald-700 bg-emerald-950">
                <span className="text-3xl font-bold">{score.total}</span>
                <span className="text-sm absolute bottom-2 text-emerald-400">/100</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  IPOTrack Score
                  <div className={`w-3 h-3 rounded-full ${score.total >= 70 ? 'bg-green-400' : score.total >= 40 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                </h3>
                <p className="text-emerald-200 mt-1">Based on financials, GMP, and subscription data</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm w-full md:w-auto">
              <div className="flex justify-between gap-4">
                <span className="text-emerald-300">Financials:</span>
                <span className="font-semibold">{score.financials}/{score.maxScores.financials}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-emerald-300">Valuation:</span>
                <span className="font-semibold">{score.valuation}/{score.maxScores.valuation}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-emerald-300">GMP Trend:</span>
                <span className="font-semibold">{score.gmpTrend}/{score.maxScores.gmpTrend}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-emerald-300">Subscription:</span>
                <span className="font-semibold">{score.subscription}/{score.maxScores.subscription}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main content tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap mb-6 pb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gmp">GMP History</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Dates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Open Date</span>
                    <span className="font-medium">{ipo.openDate}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Close Date</span>
                    <span className="font-medium">{ipo.closeDate}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Basis of Allotment</span>
                    <span className="font-medium">{ipo.allotmentDate || 'TBA'}</span>
                  </div>
                  {ipo.refundDate && (
                    <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Initiation of Refunds</span>
                      <span className="font-medium">{ipo.refundDate}</span>
                    </div>
                  )}
                  {ipo.dematDate && (
                    <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Credit of Shares to Demat</span>
                      <span className="font-medium">{ipo.dematDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Listing Date</span>
                    <span className="font-medium">{ipo.listingDate || 'TBA'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Issue Size</span>
                    <span className="font-medium">{ipo.issueSize}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Face Value</span>
                    <span className="font-medium">₹{ipo.faceValue || 10} per share</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Fresh Issue</span>
                    <span className="font-medium">{ipo.freshIssue || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Offer for Sale</span>
                    <span className="font-medium">{ipo.ofs || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registrar</span>
                    <span className="font-medium">{ipo.registrar}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Company Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">About the Company</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {ipo.about}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Promoters</h3>
                  <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400">
                    {ipo.promoters?.map((promoter, i) => (
                      <li key={i}>{promoter}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Lead Managers</h3>
                  <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400">
                    {ipo.leadManagers?.map((manager, i) => (
                      <li key={i}>{manager}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-slate-600 dark:text-slate-400">{ipo.location}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gmp" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Grey Market Premium (GMP) Trend</CardTitle>
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                {['7D', '1M', '3M', '6M', '1Y'].map(range => (
                  <button
                    key={range}
                    className={`px-3 py-1 text-xs font-medium rounded-sm ${gmpRange === range ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                    onClick={() => setGmpRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {filteredGmpHistory.length > 0 ? (
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredGmpHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip 
                        formatter={(value) => [`₹${value}`, 'GMP']}
                        labelStyle={{color: 'black'}}
                      />
                      <Line type="monotone" dataKey="gmp" stroke="#0F4C35" strokeWidth={2} dot={{r: 4, fill: '#0F4C35'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No GMP history available for this timeframe.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current GMP</div>
                <div className={`text-xl font-semibold ${isPositiveGmp ? 'text-green-600' : 'text-red-600'}`}>₹{ipo.gmp}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Highest GMP</div>
                <div className="text-xl font-semibold text-green-600">₹{highestGmp}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Lowest GMP</div>
                <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">₹{lowestGmp}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col justify-center h-full text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Average GMP</div>
                <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">₹{avgGmp.toFixed(0)}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-md border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
            <strong>Disclaimer:</strong> Grey Market Premium (GMP) is an unofficial premium traded in the unlisted market. It is highly volatile and does not guarantee the actual listing price. Please consult a SEBI registered financial advisor before investing.
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              {ipo.subscription ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Qualified Institutional Buyers (QIB)</span>
                      <span className="font-bold">{ipo.subscription.qib}x</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(ipo.subscription.qib * 10, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Non-Institutional Investors (NII)</span>
                      <span className="font-bold">{ipo.subscription.nii}x</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(ipo.subscription.nii * 10, 100)}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Retail Investors</span>
                      <span className="font-bold">{ipo.subscription.retail}x</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(ipo.subscription.retail * 10, 100)}%` }}></div>
                    </div>
                  </div>
                  
                  {ipo.subscription.employee > 0 && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Employees</span>
                        <span className="font-bold">{ipo.subscription.employee}x</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(ipo.subscription.employee * 10, 100)}%` }}></div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-lg text-slate-900 dark:text-slate-50">Total Subscription</span>
                      <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{ipo.subscription.total}x</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  Subscription data is not available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information (₹ in Crores)</CardTitle>
            </CardHeader>
            <CardContent>
              {ipo.financials && ipo.financials.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Period Ended</th>
                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Total Assets</th>
                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Revenue</th>
                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Profit After Tax</th>
                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Net Worth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {ipo.financials.map((fin, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-4 py-4 font-medium">{fin.year}</td>
                          <td className="px-4 py-4 text-right">₹{fin.totalAssets.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-4 text-right">₹{fin.revenue.toLocaleString('en-IN')}</td>
                          <td className={`px-4 py-4 text-right font-medium ${fin.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            ₹{fin.profit.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-4 text-right">₹{fin.netWorth.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : ipo.revenue != null ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Metric</th>
                        <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-4 font-medium">Revenue</td>
                        <td className="px-4 py-4 text-right">₹{Number(ipo.revenue).toLocaleString('en-IN')}</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <td className="px-4 py-4 font-medium">Profit After Tax</td>
                        <td className={`px-4 py-4 text-right font-medium ${Number(ipo.profit) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ₹{Number(ipo.profit || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      {ipo.ebitda != null && (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-4 py-4 font-medium">EBITDA</td>
                          <td className="px-4 py-4 text-right">₹{Number(ipo.ebitda).toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {ipo.totalAssets != null && (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-4 py-4 font-medium">Total Assets</td>
                          <td className="px-4 py-4 text-right">₹{Number(ipo.totalAssets).toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                      {ipo.netWorth != null && (
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                          <td className="px-4 py-4 font-medium">Net Worth</td>
                          <td className="px-4 py-4 text-right">₹{Number(ipo.netWorth).toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  Financial data is not available for this IPO.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>IPO Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {ipo.documents && ipo.documents.length > 0 ? (
                <div className="space-y-4">
                  {ipo.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-md">
                          <Download className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-slate-50">{doc.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">PDF Document</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    </div>
                  ))}
                  <p className="text-sm text-slate-500 italic mt-4">*Demo documents for illustration purposes</p>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  No documents are available for this IPO yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news">
          <Card>
            <CardHeader>
              <CardTitle>Related News & Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {news && news.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {news.map((item) => (
                    <div key={item.id} className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg flex flex-col hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.date} • {item.category}</div>
                      <h4 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">{item.excerpt || item.summary}</p>
                      <Button variant="link" className="mt-auto self-start p-0 h-auto text-emerald-700 dark:text-emerald-400" asChild>
                        <Link href={`/news/${item.slug}`}>Read Full Article</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500">
                  No related news found for this IPO.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
