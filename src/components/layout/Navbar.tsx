"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, User, LayoutDashboard, Bookmark, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F3D2E] text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile Menu & Logo */}
        <div className="flex items-center gap-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#1a5c47]">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#0F3D2E] text-white border-r-[#1a5c47]">
              <div className="flex flex-col gap-6 py-6">
                <Link href="/" className="text-2xl font-bold text-white">
                  IPOTrack
                </Link>
                <nav className="flex flex-col gap-4 overflow-y-auto">
                  <Link href="/" className="text-lg font-medium hover:text-emerald-400">Home</Link>
                  <Link href="/ipos" className="text-lg font-medium hover:text-emerald-400">IPOs</Link>
                  <Link href="/gmp" className="text-lg font-medium hover:text-emerald-400">GMP</Link>
                  <Link href="/subscription" className="text-lg font-medium hover:text-emerald-400">Subscription</Link>
                  <Link href="/calendar" className="text-lg font-medium hover:text-emerald-400">Calendar</Link>
                  <Link href="/allotment" className="text-lg font-medium hover:text-emerald-400">Allotment</Link>
                  <Link href="/analytics" className="text-lg font-medium hover:text-emerald-400">Analytics</Link>
                  <Link href="/news" className="text-lg font-medium hover:text-emerald-400">News</Link>
                  <Link href="/tools" className="text-lg font-medium hover:text-emerald-400">Tools</Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" className="text-xl font-bold tracking-tight">
            IPOTrack
          </Link>
        </div>

        {/* Desktop Logo & Nav */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-2xl font-bold tracking-tight mr-2">
            IPOTrack
          </Link>
          <nav className="flex items-center gap-4 lg:gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-emerald-400 ${pathname === "/" ? "text-emerald-400" : "text-white/90"}`}>
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400 ${pathname.startsWith("/ipos") ? "text-emerald-400" : "text-white/90"}`}>
                IPOs <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link href="/ipos">All IPOs</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/ipos?tab=mainboard">Mainboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/ipos?tab=sme">SME</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/ipos?tab=upcoming">Upcoming</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/ipos?tab=open">Open</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/ipos?tab=closed">Closed</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/ipos?tab=listed">Listed</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400 ${pathname.startsWith("/gmp") ? "text-emerald-400" : "text-white/90"}`}>
                GMP <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link href="/gmp">Live GMP</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/gmp/vs-listing">GMP vs Listing</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/subscription" className={`text-sm font-medium transition-colors hover:text-emerald-400 ${pathname === "/subscription" ? "text-emerald-400" : "text-white/90"}`}>
              Subscription
            </Link>

            <Link href="/calendar" className={`text-sm font-medium transition-colors hover:text-emerald-400 ${pathname === "/calendar" ? "text-emerald-400" : "text-white/90"}`}>
              Calendar
            </Link>

            <Link href="/allotment" className={`text-sm font-medium transition-colors hover:text-emerald-400 ${pathname === "/allotment" ? "text-emerald-400" : "text-white/90"}`}>
              Allotment
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400 ${pathname.startsWith("/analytics") ? "text-emerald-400" : "text-white/90"}`}>
                Analytics <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link href="/analytics">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/analytics/rankings">Rankings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/companies">Companies</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/news" className={`text-sm font-medium transition-colors hover:text-emerald-400 ${pathname === "/news" ? "text-emerald-400" : "text-white/90"}`}>
              News
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-emerald-400 ${pathname.startsWith("/tools") ? "text-emerald-400" : "text-white/90"}`}>
                Tools <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link href="/tools">All Tools</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/tools/calculator">IPO Calculator</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/tools/gmp-calculator">GMP Calculator</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/tools/allotment-calculator">Allotment Calculator</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/tools/compare">Compare IPOs</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#1a5c47]"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative text-white hover:bg-[#1a5c47]">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </Link>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-[#1a5c47]">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/watchlist" className="cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Watchlist</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2 ml-2">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:bg-[#1a5c47] hover:text-white">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  );
}
