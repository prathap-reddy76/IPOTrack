import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IPO } from '@/types';
import { CalendarIcon, TrendingUpIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IPOCardProps {
  ipo: IPO;
}

export function IPOCard({ ipo }: IPOCardProps) {
  const isPositiveGmp = ipo.gmp > 0;
  const isNegativeGmp = ipo.gmp < 0;
  
  // Calculate percentage roughly if max price is available
  const maxPriceMatch = ipo.priceBand.match(/₹?(\d+)/g);
  const maxPrice = maxPriceMatch ? parseInt(maxPriceMatch[maxPriceMatch.length - 1].replace('₹', '')) : 0;
  const gmpPercent = maxPrice > 0 ? ((ipo.gmp / maxPrice) * 100).toFixed(1) : "0.0";
  
  const statusColor = 
    ipo.status.toLowerCase() === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
    ipo.status.toLowerCase() === 'upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';

  return (
    <Card className="hover:shadow-md transition-shadow dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
      <CardHeader className="pb-3 flex-none">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-xs font-semibold">{ipo.type}</Badge>
          <Badge className={cn("text-xs", statusColor)} variant="secondary">{ipo.status.toUpperCase()}</Badge>
        </div>
        <CardTitle className="text-lg line-clamp-1" title={ipo.name}>{ipo.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-3 flex-grow">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">Price Band</span>
          <span className="font-medium">{ipo.priceBand || 'TBA'}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">Est. Listing (GMP)</span>
          <div className="text-right">
            <div className="font-semibold flex items-center gap-1 justify-end">
               <TrendingUpIcon className={cn("w-4 h-4", isPositiveGmp ? "text-green-600 dark:text-green-400" : isNegativeGmp ? "text-red-600 dark:text-red-400" : "text-gray-500")} />
               <span className={cn(isPositiveGmp ? "text-green-700 dark:text-green-400" : isNegativeGmp ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300")}>
                 ₹{ipo.gmp} {ipo.gmp !== 0 && `(${gmpPercent}%)`}
               </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-sm items-center">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <CalendarIcon className="w-4 h-4" />
            <span>{ipo.openDate ? `${ipo.openDate.split(',')[0]} - ${ipo.closeDate?.split(',')[0]}` : 'Dates TBA'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild className="w-full text-sm font-medium" variant="outline">
          <Link href={`/ipos/${ipo.slug}`}>
            View Details &rarr;
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
