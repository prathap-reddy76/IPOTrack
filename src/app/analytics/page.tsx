'use client';

import { useState, useEffect } from 'react';
import { getIPOs } from '@/lib/api';
import { IPO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AnalyticsPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (ipos.length === 0) {
    return (
      <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 text-center text-slate-500">
        Not enough historical data yet.
      </div>
    );
  }

  // Calculate metrics
  const totalIpos = ipos.length;
  const mainboardCount = ipos.filter(i => i.type.toLowerCase().includes('mainboard')).length;
  const smeCount = ipos.filter(i => i.type.toLowerCase().includes('sme')).length;

  const statusCount = ipos.reduce((acc, ipo) => {
    acc[ipo.status] = (acc[ipo.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  const statusColors = ['#059669', '#3b82f6', '#f59e0b', '#64748b'];

  const totalGmp = ipos.reduce((sum, ipo) => sum + (Number(ipo.gmp) || 0), 0);
  const avgGmp = totalIpos > 0 ? (totalGmp / totalIpos).toFixed(2) : '0';

  const positiveGmpCount = ipos.filter(i => (Number(i.gmp) || 0) > 0).length;
  const negativeGmpCount = ipos.filter(i => (Number(i.gmp) || 0) < 0).length;

  const listedIpos = ipos.filter(i => i.status.toLowerCase() === 'listed' && Number(i.listingPrice || 0) > 0);
  const totalListingGain = listedIpos.reduce((sum, ipo) => {
    // simplified calculation using gmp for est since we don't have price band parsed fully here
    // In a real app we'd parse the issue price
    const issuePrice = parseFloat(ipo.priceBand.replace(/[₹,]/g, '').split('-').pop() || '0');
    const listingPrice = Number(ipo.listingPrice) || 0;
    if (issuePrice > 0) {
       return sum + ((listingPrice - issuePrice) / issuePrice * 100);
    }
    return sum;
  }, 0);
  
  const avgListingGain = listedIpos.length > 0 ? (totalListingGain / listedIpos.length).toFixed(2) : '0.00';

  const sectorCount = ipos.reduce((acc, ipo) => {
    if (ipo.sector) {
      acc[ipo.sector] = (acc[ipo.sector] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const sectorData = Object.entries(sectorCount).map(([name, count]) => ({ name, count }));

  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Analytics Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Insights and trends from IPO data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total IPOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIpos}</div>
            <p className="text-xs text-slate-500 mt-1">{mainboardCount} Mainboard / {smeCount} SME</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Average GMP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{avgGmp}</div>
            <p className="text-xs text-slate-500 mt-1">{positiveGmpCount} Positive / {negativeGmpCount} Negative</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Listed IPOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listedIpos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Avg Listing Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${Number(avgListingGain) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Number(avgListingGain) > 0 ? '+' : ''}{avgListingGain}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Based on {listedIpos.length} listings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>IPO Status Distribution</CardTitle>
            <CardDescription>Breakdown by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props) => `${props.name ?? ''} ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sector Distribution</CardTitle>
            <CardDescription>Number of IPOs per sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
