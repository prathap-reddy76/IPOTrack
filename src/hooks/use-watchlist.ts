'use client';
import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

export function useWatchlist() {
  const [localWatchlist, setLocalWatchlist] = useLocalStorage<string[]>('ipotrack-watchlist', []);
  const [watchlistSlugs, setWatchlistSlugs] = useState<string[]>(localWatchlist);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [reloadKey, _setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/watchlist');
        if (res.status === 401) {
          if (!cancelled) {
            setIsAuthenticated(false);
            setWatchlistSlugs(localWatchlist);
            setIsLoading(false);
          }
        } else if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setIsAuthenticated(true);
            const slugs = data.map((item: { ipo: { slug: string } }) => item.ipo.slug);
            setWatchlistSlugs(slugs);
            setLocalWatchlist(slugs);
            setIsLoading(false);
          }
        } else {
          if (!cancelled) {
            setWatchlistSlugs(localWatchlist);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch watchlist:', error);
        if (!cancelled) {
          setWatchlistSlugs(localWatchlist);
          setIsLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey, localWatchlist, setLocalWatchlist]);

  const addToWatchlist = async (slug: string) => {
    // Optimistic update
    if (!watchlistSlugs.includes(slug)) {
      setWatchlistSlugs(prev => [...prev, slug]);
      if (isAuthenticated === false) {
        setLocalWatchlist([...localWatchlist, slug]);
      }
    }

    if (isAuthenticated) {
      try {
        await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ipoSlug: slug }),
        });
      } catch (error) {
        console.error('Failed to add to watchlist:', error);
        // Revert optimistic update if needed, simple approach just ignores error
      }
    } else {
      if (!localWatchlist.includes(slug)) {
        setLocalWatchlist([...localWatchlist, slug]);
      }
    }
  };

  const removeFromWatchlist = async (slug: string) => {
    // Optimistic update
    setWatchlistSlugs(prev => prev.filter(s => s !== slug));
    
    if (isAuthenticated) {
      try {
        await fetch(`/api/watchlist?ipoSlug=${slug}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Failed to remove from watchlist:', error);
      }
    }
    
    // Always update local as fallback
    setLocalWatchlist(localWatchlist.filter(s => s !== slug));
  };

  const isInWatchlist = (slug: string) => watchlistSlugs.includes(slug);

  const clearWatchlist = async () => {
    setWatchlistSlugs([]);
    setLocalWatchlist([]);
    // To clear all on server we would need an endpoint, but keeping it simple for now
  };

  return { 
    watchlist: watchlistSlugs, 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist, 
    clearWatchlist,
    isLoading
  };
}
