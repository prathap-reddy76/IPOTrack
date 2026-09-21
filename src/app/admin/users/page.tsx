'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
  _count: {
    watchlist: number;
  };
}

export default function AdminUsersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/admin/users')
        .then(res => res.json())
        .then((data) => {
          setUsers(data);
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

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">View registered users and their activities</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>List of all users registered on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-6 text-slate-500">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Created Date</th>
                      <th className="px-6 py-3">Watchlist Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="bg-white border-b dark:bg-slate-950 dark:border-slate-800">
                        <td className="px-6 py-4 font-medium">{user.name || 'N/A'}</td>
                        <td className="px-6 py-4">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4">{format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm')}</td>
                        <td className="px-6 py-4">{user._count?.watchlist || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
