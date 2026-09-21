'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, TrendingUp, CalendarDays, Calculator, BarChart3, Newspaper, BookOpen, ArrowRight, TrendingDown, Minus } from 'lucide-react';
import { IPOCard } from '@/components/ipo/IPOCard';
import { searchAll, getIPOs } from '@/lib/api';
import { newsArticles } from '@/data/news';
import { learnArticles } from '@/data/learn';
import { cn } from '@/lib/utils';
import { IPO, NewsArticle } from '@/types';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ ipos: IPO[]; news: NewsArticle[] }>({ ipos: [], news: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [stats, setStats] = useState<{ total: number; upcoming: number; open: number; listed: number; closingToday: number; listingToday: number } | null>(null);

  useEffect(() => {
    getIPOs().then(setIpos);
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        const results = await searchAll(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowResults(true);
      } else {
        setSearchResults({ ipos: [], news: [] });
        setShowResults(false);
      }
    };
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const trendingIPOs = ipos.filter(ipo => !ipo.slug.includes('phonepe')).slice(0, 4);
  const openIPOs = ipos.filter(ipo => ipo.status.toLowerCase() === 'open').slice(0, 4);
  const upcomingIPOs = ipos.filter(ipo => ipo.status.toLowerCase() === 'upcoming').slice(0, 4);
  const listedIPOs = ipos.filter(ipo => ipo.status.toLowerCase() === 'listed').slice(0, 4);
  const topSubscriptionIPOs = [...ipos].filter(ipo => ipo.subscription?.total).sort((a, b) => (b.subscription?.total || 0) - (a.subscription?.total || 0)).slice(0, 4);
  
  // Calculate top GMP movers
  const gmpMovers = [...ipos].sort((a, b) => {
    const changeA = a.gmp - a.previousGmp;
    const changeB = b.gmp - b.previousGmp;
    return Math.abs(changeB) - Math.abs(changeA); // Sort by absolute change
  }).slice(0, 5);

  const features = [
    { title: 'Upcoming IPOs', icon: Clock, href: '/ipos?status=upcoming', desc: 'Find next big launches' },
    { title: 'Live GMP Updates', icon: TrendingUp, href: '/gmp', desc: 'Track premium rates' },
    { title: 'IPO Calendar', icon: CalendarDays, href: '/calendar', desc: 'Key dates & deadlines' },
    { title: 'IPO Calculator', icon: Calculator, href: '/tools/calculator', desc: 'Calculate your gains' },
    { title: 'Subscription Data', icon: BarChart3, href: '/tools/subscription', desc: 'Live bidding status' },
    { title: 'Latest News', icon: Newspaper, href: '/news', desc: 'Market updates' },
    { title: 'Learn & Guides', icon: BookOpen, href: '/learn', desc: 'Master IPO investing' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F3D2E] to-[#1a5c3a] py-20 lg:py-32">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight whitespace-pre-line leading-tight">
                Track IPOs.{'\n'}Track GMP.{'\n'}Invest Smarter.
              </h1>
              <p className="text-lg md:text-xl text-emerald-100 max-w-lg">
                Real-time IPO information, GMP updates, subscription data, analysis and more – all in one place.
              </p>
              
              <div className="relative max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    type="text"
                    placeholder="Search for IPOs, News, or Companies..."
                    className="w-full pl-10 pr-4 py-6 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus-visible:ring-emerald-500 backdrop-blur-sm text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.length > 1) setShowResults(true); }}
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden z-50 border border-slate-200 dark:border-slate-800">
                    {isSearching ? (
                      <div className="p-4 text-center text-slate-500">Searching...</div>
                    ) : searchResults.ipos.length > 0 || searchResults.news.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        {searchResults.ipos.length > 0 && (
                          <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">IPOs</div>
                            {searchResults.ipos.slice(0, 5).map(ipo => (
                              <Link key={ipo.id} href={`/ipos/${ipo.slug}`} className="block px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">
                                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{ipo.name}</div>
                                <div className="text-xs text-slate-500">{ipo.status} • {ipo.type}</div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-500">No results found</div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 font-semibold rounded-full px-8">
                  <Link href="/ipos">Explore IPOs <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 font-semibold rounded-full px-8">
                  <Link href="/tools/calculator">IPO Calculator</Link>
                </Button>
              </div>

              <div className="pt-8 flex flex-wrap gap-6 md:gap-12 border-t border-white/20">
                <div>
                  <div className="text-2xl font-bold">{stats?.total || "250+"}</div>
                  <div className="text-sm text-emerald-200">IPOs Tracked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.open || 0}</div>
                  <div className="text-sm text-emerald-200">Open IPOs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.upcoming || 0}</div>
                  <div className="text-sm text-emerald-200">Upcoming IPOs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats?.listed || 0}</div>
                  <div className="text-sm text-emerald-200">Listed IPOs</div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex justify-center relative">
               {/* Abstract visual element */}
               <div className="w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/20 to-white/10 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
               <div className="relative z-10 w-full max-w-md aspect-square bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
                 <div className="space-y-4">
                   <div className="h-4 w-24 bg-white/20 rounded-full animate-pulse"></div>
                   <div className="h-8 w-48 bg-white/20 rounded-lg animate-pulse"></div>
                   <div className="h-4 w-32 bg-white/20 rounded-full animate-pulse delay-75"></div>
                 </div>
                 <div className="flex-grow flex items-end justify-between gap-4 py-8">
                   <div className="w-full bg-white/20 rounded-t-lg h-24 animate-pulse"></div>
                   <div className="w-full bg-emerald-400/40 rounded-t-lg h-32 animate-pulse delay-75"></div>
                   <div className="w-full bg-emerald-300/60 rounded-t-lg h-48 animate-pulse delay-150"></div>
                   <div className="w-full bg-emerald-200/80 rounded-t-lg h-36 animate-pulse delay-200"></div>
                 </div>
                 <div className="space-y-4 pt-4 border-t border-white/10">
                   <div className="flex justify-between items-center">
                     <div className="h-4 w-16 bg-white/20 rounded-full"></div>
                     <div className="h-4 w-16 bg-emerald-400/50 rounded-full"></div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Navigation Cards */}
      <section className="container mx-auto px-4 md:px-6 -mt-12 relative z-20 mb-20">
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory hide-scrollbar">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Link key={i} href={feature.href} className="snap-start shrink-0 w-64">
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{feature.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 3. Trending IPOs Section */}
      <section className="container mx-auto px-4 md:px-6 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Trending IPOs</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">The most anticipated upcoming and open IPOs.</p>
          </div>
          <Link href="/ipos" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline hidden sm:block">
            View All &rarr;
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingIPOs.map(ipo => (
            <IPOCard key={ipo.id} ipo={ipo} />
          ))}
        </div>
        <Link href="/ipos" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline block sm:hidden mt-6 text-center">
          View All &rarr;
        </Link>
      </section>

      {/* IPOs Open Now Section */}
      {openIPOs.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">IPOs Open Now</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Currently accepting bids.</p>
            </div>
            <Link href="/ipos?status=Open" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline hidden sm:block">
              View All Open &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {openIPOs.map(ipo => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
          <Link href="/ipos?status=Open" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline block sm:hidden mt-6 text-center">
            View All Open &rarr;
          </Link>
        </section>
      )}

      {/* Upcoming IPOs Section */}
      {upcomingIPOs.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Upcoming IPOs</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Get ready for these upcoming launches.</p>
            </div>
            <Link href="/ipos?status=Upcoming" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline hidden sm:block">
              View All Upcoming &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingIPOs.map(ipo => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
          <Link href="/ipos?status=Upcoming" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline block sm:hidden mt-6 text-center">
            View All Upcoming &rarr;
          </Link>
        </section>
      )}

      {/* Highest Subscription Section */}
      {topSubscriptionIPOs.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Highest Subscription</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">IPOs with the most investor interest.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topSubscriptionIPOs.map(ipo => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Listed Section */}
      {listedIPOs.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Recently Listed</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">Check the performance of newly listed companies.</p>
            </div>
            <Link href="/ipos?status=Listed" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline hidden sm:block">
              View All Listed &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listedIPOs.map(ipo => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </div>
          <Link href="/ipos?status=Listed" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline block sm:hidden mt-6 text-center">
            View All Listed &rarr;
          </Link>
        </section>
      )}

      {/* 4. GMP Movers Section */}
      <section className="container mx-auto px-4 md:px-6 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">GMP Updates</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Latest grey market premium movements as of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.</p>
          </div>
          <Link href="/gmp" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline hidden sm:block">
            View All GMP &rarr;
          </Link>
        </div>

        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">#</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">GMP (₹)</th>
                  <th className="px-6 py-4 font-medium">Previous (₹)</th>
                  <th className="px-6 py-4 font-medium">Change (₹)</th>
                  <th className="px-6 py-4 font-medium text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {gmpMovers.map((ipo, idx) => {
                  const change = ipo.gmp - ipo.previousGmp;
                  const changePercent = ipo.previousGmp > 0 ? ((change / ipo.previousGmp) * 100).toFixed(2) : 0;
                  const isUp = change > 0;
                  const isDown = change < 0;
                  
                  return (
                    <tr key={ipo.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        <Link href={`/ipos/${ipo.slug}`} className="hover:text-emerald-700 dark:hover:text-emerald-400">
                          {ipo.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">₹{ipo.gmp}</td>
                      <td className="px-6 py-4 text-slate-500">₹{ipo.previousGmp}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium",
                          isUp ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          isDown ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {isUp ? '+' : ''}{change}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 font-medium">
                          {isUp && <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />}
                          {isDown && <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />}
                          {!isUp && !isDown && <Minus className="w-4 h-4 text-slate-400" />}
                          <span className={cn(
                            isUp ? "text-green-700 dark:text-green-400" :
                            isDown ? "text-red-700 dark:text-red-400" : "text-slate-500"
                          )}>
                            {Math.abs(Number(changePercent))}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* 5. IPO Calculator Quick Access */}
      <section className="container mx-auto px-4 md:px-6 mb-20">
        <div className="bg-emerald-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-2">
            <div className="p-10 lg:p-16 flex flex-col justify-center text-white space-y-6">
              <Badge className="w-fit bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border-none">Free Tool</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">Plan Better. Invest Smarter.</h2>
              <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
                Use our IPO calculator to estimate your potential listing gains before you apply. Make data-driven decisions on lot sizes and bidding prices.
              </p>
              <div className="pt-4">
                <Button asChild size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                  <Link href="/tools/calculator">Try Calculator &rarr;</Link>
                </Button>
              </div>
            </div>
            <div className="bg-emerald-950 p-8 lg:p-12 flex items-center justify-center">
              {/* Mini Calculator Preview */}
              <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-none shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center mb-6">
                     <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                     <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse border border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/50 rounded-lg animate-pulse border border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
                    <div className="flex justify-between items-end">
                      <div className="h-4 w-20 bg-emerald-100 dark:bg-emerald-900 rounded animate-pulse"></div>
                      <div className="h-8 w-32 bg-emerald-200 dark:bg-emerald-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Latest News Section */}
      <section className="container mx-auto px-4 md:px-6 mb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Latest IPO News</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Stay updated with market movements and announcements.</p>
          </div>
          <Link href="/news" className="text-emerald-700 dark:text-emerald-400 font-medium hover:underline hidden sm:block">
            View All News &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsArticles.slice(0, 3).map(article => (
            <Card key={article.id} className="hover:shadow-md transition-shadow dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <Badge className="w-fit mb-4" variant="secondary">{article.category}</Badge>
                <h3 className="text-xl font-bold mb-3 line-clamp-2 text-slate-900 dark:text-slate-100">{article.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-grow">{article.excerpt}</p>
                <div className="flex justify-between items-center text-sm font-medium pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                  <span className="text-slate-400">{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <Link href={`/news/${article.slug}`} className="text-emerald-700 dark:text-emerald-400 hover:underline">
                    Read More &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. Learn Section */}
      <section className="container mx-auto px-4 md:px-6 mb-24">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Learn About IPOs</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-4">New to investing? Check out our guides to master the basics and advanced strategies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {learnArticles.slice(0, 4).map(article => (
            <Link key={article.id} href={`/learn/${article.slug}`} className="group block h-full">
              <Card className="h-full hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{article.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">{article.excerpt}</p>
                  <div className="flex items-center text-xs font-medium text-slate-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {article.readTime}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. Disclaimer Section */}
      <section className="bg-slate-100 dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Financial Disclaimer</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The information provided on IPOTrack is for educational and informational purposes only and does not constitute financial, investment, or legal advice. Grey Market Premium (GMP) data is purely speculative and derived from unregulated markets. It does not reflect the official listing price of any IPO and should not be considered a reliable indicator of actual market performance.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Investments in the securities market are subject to market risks. Please read all scheme-related documents carefully and consult with a certified financial advisor before making any investment decisions. IPOTrack is not a SEBI registered investment advisor.
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
