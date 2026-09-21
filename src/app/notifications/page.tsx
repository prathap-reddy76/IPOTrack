'use client';

import { useNotifications } from '@/hooks/use-notifications';
import { toast } from 'sonner';
import { Bell, BellRing, Check, Trash2, Info, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteAll, isLoading } = useNotifications();

  const handleMarkAll = () => {
    markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const handleClearAll = () => {
    deleteAll();
    toast.success('All notifications cleared');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'gmp_update': return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'ipo_open': return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'ipo_close': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'allotment': return <Check className="h-5 w-5 text-purple-500" />;
      default: return <Info className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center">
          <Bell className="mr-3 h-8 w-8 text-emerald-600" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h1>
        
        {notifications.length > 0 && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={unreadCount === 0}>
              <Check className="h-4 w-4 mr-2" /> Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll} className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" /> Clear all
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <BellRing className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-medium mb-2">You&apos;re all caught up!</h2>
          <p className="text-slate-500">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notif => (
            <Card key={notif.id} className={`transition-colors ${!notif.read ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900' : ''}`}>
              <CardContent className="p-4 sm:p-5 flex gap-4">
                <div className={`mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${!notif.read ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                    <h3 className={`font-semibold ${!notif.read ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(notif.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {notif.message}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    {notif.ipoSlug ? (
                      <Link href={`/ipos/${notif.ipoSlug}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                        View IPO &rarr;
                      </Link>
                    ) : <div></div>}
                    
                    {!notif.read && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAsRead(notif.id)}>
                        Mark as read
                      </Button>
                    )}
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
