import 'server-only';

export interface DataFreshness {
  label: string;
  isStale: boolean;
  minutesAgo: number;
}

export function getDataFreshness(updatedAt: Date | string | null | undefined): DataFreshness {
  if (!updatedAt) {
    return { label: 'No data', isStale: true, minutesAgo: -1 };
  }
  
  const updated = new Date(updatedAt);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
  
  if (minutesAgo < 0) {
    return { label: 'Just updated', isStale: false, minutesAgo: 0 };
  }
  if (minutesAgo < 5) {
    return { label: 'Just updated', isStale: false, minutesAgo };
  }
  if (minutesAgo < 15) {
    return { label: `Updated ${minutesAgo} min ago`, isStale: false, minutesAgo };
  }
  if (minutesAgo < 60) {
    return { label: `Updated ${minutesAgo} min ago`, isStale: false, minutesAgo };
  }
  if (minutesAgo < 120) {
    return { label: 'Updated 1 hour ago', isStale: true, minutesAgo };
  }
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return { label: `Updated ${hoursAgo} hours ago`, isStale: true, minutesAgo };
  }
  
  const daysAgo = Math.floor(hoursAgo / 24);
  return { label: `Updated ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`, isStale: true, minutesAgo };
}
