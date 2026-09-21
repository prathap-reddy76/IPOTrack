'use client';

import { useState, useEffect } from 'react';
import { getGMPUpdates, getGMPHistory, getIPOs } from '@/lib/api';
import { GMPRecord, GMPHistoryPoint, IPO } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, ArrowDown, ArrowUp, Minus, Search } from 'lucide-react';
import Link from 'next/link';

export default function GMPPage() {
  const [filter, setFilter] = useState<'all' | 'mainboard' | 'sme'>('all');
  const [search, setSearch] = useState('');
  const [gmpRecords, setGmpRecords] = useState<GMPRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [selectedIpoSlug, setSelectedIpoSlug] = useState<string>('');
  const [gmpHistory, setGmpHistory] = useState<GMPHistoryPoint[]>([]);
  const [historyRange, setHistoryRange] = useState('1m');

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      const data = await getGMPUpdates(filter !== 'all' ? filter : undefined);
      setGmpRecords(data);
      setLoading(false);
    };
    fetchUpdates();
  }, [filter]);

  useEffect(() => {
    const fetchIpos = async () => {
      const data = await getIPOs();
      setIpos(data);
      if (data.length > 0) {
        setSelectedIpoSlug(data[0].slug);
      }
    };
    fetchIpos();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (selectedIpoSlug) {
        const data = await getGMPHistory(selectedIpoSlug, historyRange);
        setGmpHistory(data);
      }
    };
    fetchHistory();
  }, [selectedIpoSlug, historyRange]);

  const filteredRecords = gmpRecords.filter(r => 
    r.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIpoName = ipos.find(i => i.slug === selectedIpoSlug)?.name || 'IPO';
  
  const currentGmp = gmpHistory.length > 0 ? gmpHistory[gmpHistory.length - 1].gmp : 0;
  const highestGmp = gmpHistory.length > 0 ? Math.max(...gmpHistory.map(h => h.gmp)) : 0;
  const lowestGmp = gmpHistory.length > 0 ? Math.min(...gmpHistory.map(h => h.gmp)) : 0;
  const avgGmp = gmpHistory.length > 0 
    ? (gmpHistory.reduce((sum, h) => sum + h.gmp, 0) / gmpHistory.length).toFixed(2)
    : 0;

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">GMP Updates</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Track daily Grey Market Premium (GMP) to understand market sentiment.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Disclaimer:</strong> GMP is an unofficial market indicator and may change without notice. It is not a guarantee of listing price or investment returns.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'sme' | 'mainboard' | 'all')} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All IPOs</TabsTrigger>
            <TabsTrigger value="mainboard">Mainboard</TabsTrigger>
            <TabsTrigger value="sme">SME</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search company..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <p className="text-sm text-slate-500">Date: {currentDate}</p>

      <div className="rounded-md border bg-white dark:bg-slate-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">#</th>
                <th className="px-4 py-3 font-medium text-slate-500">Company</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-right">GMP (₹)</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-right">Prev. (₹)</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-right">Change (₹)</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-right">Change %</th>
                <th className="px-4 py-3 font-medium text-slate-500 text-center">Trend</th>
                <th className="px-4 py-3 font-medium text-slate-500">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No records found</td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <tr key={record.slug} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/ipos/${record.slug}`} className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
                        {record.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{record.currentGmp}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{record.previousGmp}</td>
                    <td className={`px-4 py-3 text-right ${record.change > 0 ? 'text-green-600' : record.change < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {record.change > 0 ? '+' : ''}{record.change}
                    </td>
                    <td className={`px-4 py-3 text-right ${record.changePercent > 0 ? 'text-green-600' : record.changePercent < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                      {record.changePercent > 0 ? '+' : ''}{record.changePercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center">
                        {record.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                        {record.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                        {record.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{record.lastUpdated}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6 pt-8">
        <h2 className="text-2xl font-bold tracking-tight">GMP History</h2>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="w-full md:w-64">
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-800 dark:bg-slate-950"
              value={selectedIpoSlug}
              onChange={(e) => setSelectedIpoSlug(e.target.value)}
            >
              {ipos.map(ipo => (
                <option key={ipo.slug} value={ipo.slug}>{ipo.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {['7d', '1m', '3m', '6m', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setHistoryRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  historyRange === range 
                    ? 'bg-white dark:bg-slate-950 shadow-sm text-emerald-700 dark:text-emerald-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedIpoName} - GMP History</CardTitle>
            <CardDescription>Historical trend of Grey Market Premium</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {gmpHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gmpHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGmp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
                      formatter={(value) => [`₹${value}`, 'GMP']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="gmp" 
                      stroke="#059669" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorGmp)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No history data available for this IPO
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Current GMP</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{currentGmp}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Highest GMP</p>
                <p className="text-2xl font-bold text-green-600">₹{highestGmp}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Lowest GMP</p>
                <p className="text-2xl font-bold text-red-600">₹{lowestGmp}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Average GMP</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{avgGmp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
