'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import { LayoutDashboard, List, PlusCircle, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminLayoutClient({ 
  session, 
  children 
}: { 
  session: Session | null; 
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!session && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [session, pathname, router]);

  // If there's no session and we're not on the login page, render nothing while redirecting
  if (!session && pathname !== '/admin/login') {
    return null; 
  }

  // If we are on the login page, render children directly without sidebar
  if (pathname === '/admin/login') {
    return (
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    );
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        {/* Mobile sidebar overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed top-0 left-0 z-50 h-full w-64 bg-[#0F3D2E] text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
              <span className="text-xl font-bold">IPOTrack Admin</span>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <nav className="flex-1 space-y-1 px-4 py-6">
              <Link href="/admin">
                <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === '/admin' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </span>
              </Link>
              <Link href="/admin/ipos">
                <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === '/admin/ipos' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <List className="h-5 w-5" />
                  IPOs
                </span>
              </Link>
              <Link href="/admin/ipos/new">
                <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === '/admin/ipos/new' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <PlusCircle className="h-5 w-5" />
                  Add IPO
                </span>
              </Link>
              <Link href="/admin/users">
                <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === '/admin/users' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Users
                </span>
              </Link>
              <Link href="/admin/sync">
                <span className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${pathname === '/admin/sync' ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Sync
                </span>
              </Link>
            </nav>

            <div className="border-t border-white/10 p-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-white hover:bg-white/10 hover:text-white"
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-16 items-center gap-4 border-b bg-white px-6 md:hidden dark:bg-slate-900 dark:border-slate-800">
            <button onClick={toggleSidebar} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-semibold text-slate-900 dark:text-white">IPOTrack Admin</span>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
