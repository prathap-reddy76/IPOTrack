'use client';
import { useState, useEffect } from 'react';
import { AppNotification } from '@/types';
import { useLocalStorage } from './use-local-storage';
import { defaultNotifications } from '@/data/notifications';

export function useNotifications() {
  const [localNotifications, setLocalNotifications] = useLocalStorage<AppNotification[]>('ipotrack-notifications', defaultNotifications);
  const [serverNotifications, setServerNotifications] = useState<AppNotification[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [reloadKey, _setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.status === 401) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        } else if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setIsAuthenticated(true);
            setServerNotifications(data);
            setIsLoading(false);
          }
        } else {
          if (!cancelled) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  const notifications = isAuthenticated ? serverNotifications : localNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    if (isAuthenticated) {
      // Optimistic update
      setServerNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      try {
        await fetch('/api/alerts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId: id }),
        });
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    } else {
      setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    if (isAuthenticated) {
      setServerNotifications(prev => prev.map(n => ({ ...n, read: true })));
      try {
        await fetch('/api/alerts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAllRead: true }),
        });
      } catch (error) {
        console.error('Failed to mark all as read:', error);
      }
    } else {
      setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (id: string) => {
    if (isAuthenticated) {
      setServerNotifications(prev => prev.filter(n => n.id !== id));
      try {
        await fetch(`/api/alerts?id=${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    } else {
      setLocalNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const deleteAll = async () => {
    if (isAuthenticated) {
      setServerNotifications([]);
      try {
        await fetch(`/api/alerts?all=true`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to delete all notifications:', error);
      }
    } else {
      setLocalNotifications([]);
    }
  };

  return { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAll,
    isLoading 
  };
}
