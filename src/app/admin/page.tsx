'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  List, Plus, LogOut, Activity, 
  Calendar, CheckCircle, AlertCircle, Users, Bookmark
} from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminStats {
  totalIpos: number;
  upcoming: number;
  open: number;
  closed: number;
  listed: number;
  totalUsers: number;
  totalWatchlist: number;
  recentIpos: { id: string; ipoName: string; status: string; priceBandMin: number; priceBandMax: number; slug: string; createdAt: string }[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        }).catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!session) return null;

  const chartData = [
    { name: 'Upcoming', count: stats?.upcoming || 0, color: '#3b82f6' },
    { name: 'Open', count: stats?.open || 0, color: '#22c55e' },
    { name: 'Closed', count: stats?.closed || 0, color: '#64748b' },
    { name: 'Listed', count: stats?.listed || 0, color: '#a855f7' },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Welcome back, {session.user?.name || 'Admin'}!</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/ipos/new">
              <Button className="bg-[#0F3D2E] hover:bg-emerald-800 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add New IPO
              </Button>
            </Link>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/admin/login' })}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total IPOs</CardTitle>
              <List className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalIpos || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.upcoming || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.open || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Closed</CardTitle>
              <AlertCircle className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.closed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Listed</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.listed || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
              <Bookmark className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalWatchlist || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recently Added IPOs</CardTitle>
                <CardDescription>The latest IPOs added to the platform</CardDescription>
              </div>
              <Link href="/admin/ipos">
                <Button variant="ghost" size="sm" className="text-emerald-700 dark:text-emerald-400">View all</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {stats?.recentIpos?.length === 0 ? (
                <div className="text-center py-6 text-slate-500">No IPOs yet. Add your first IPO!</div>
              ) : (
                <div className="space-y-4">
                  {stats?.recentIpos?.map((ipo) => (
                    <div key={ipo.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{ipo.ipoName}</div>
                        <div className="text-sm text-slate-500">
                          ₹{ipo.priceBandMin} - ₹{ipo.priceBandMax}
                        </div>
                      </div>
                      <Badge variant="outline" className={
                        ipo.status === 'Open' ? 'border-green-500 text-green-700' :
                        ipo.status === 'Upcoming' ? 'border-blue-500 text-blue-700' :
                        ipo.status === 'Listed' ? 'border-purple-500 text-purple-700' :
                        'border-slate-500 text-slate-700'
                      }>
                        {ipo.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IPOs by Status</CardTitle>
              <CardDescription>Overview of IPOs distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
