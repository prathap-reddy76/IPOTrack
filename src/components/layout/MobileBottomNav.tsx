"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, BarChart3, CalendarDays, MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ipos", label: "IPOs", icon: TrendingUp },
  { href: "/gmp", label: "GMP", icon: BarChart3 },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-white px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:border-slate-800 dark:bg-slate-950 md:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? "text-emerald-700 dark:text-emerald-500" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "fill-emerald-700/20" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
      
      <Sheet>
        <SheetTrigger className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 dark:text-slate-400">
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-medium">More</span>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-xl h-[60vh]">
          <div className="grid grid-cols-2 gap-4 py-6 px-2 overflow-y-auto h-full">
            <Link href="/subscription" className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="font-medium text-sm">Subscription</span>
            </Link>
            <Link href="/allotment" className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="font-medium text-sm">Allotment</span>
            </Link>
            <Link href="/analytics" className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="font-medium text-sm">Analytics</span>
            </Link>
            <Link href="/tools" className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="font-medium text-sm">Tools</span>
            </Link>
            <Link href="/companies" className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="font-medium text-sm">Companies</span>
            </Link>
            <Link href="/news" className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900">
              <span className="font-medium text-sm">News</span>
            </Link>
            <Link href="/profile" className="p-4 border rounded-lg flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900 col-span-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900">
              <span className="font-medium text-sm">My Profile & Watchlist</span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
