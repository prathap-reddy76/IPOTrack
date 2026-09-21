import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'IPOTrack — India\'s IPO Intelligence Platform',
    template: '%s | IPOTrack',
  },
  description: 'Track IPOs, GMP, subscription status, allotment, and listing performance. Real-time IPO analytics and intelligence for Indian stock market investors.',
  keywords: ['IPO', 'GMP', 'Grey Market Premium', 'IPO Subscription', 'IPO Allotment', 'Indian Stock Market', 'NSE', 'BSE'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'IPOTrack',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
            </div>
            <MobileBottomNav />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
