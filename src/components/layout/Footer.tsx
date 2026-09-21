import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0F3D2E] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight">IPOTrack</h3>
            <p className="text-sm text-slate-300 max-w-xs">
              Track IPOs. Analyze. Invest Smarter. Your comprehensive platform for Indian IPO and GMP data.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-lg font-semibold text-emerald-400">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/" className="hover:text-white hover:underline">Home</Link></li>
              <li><Link href="/ipos" className="hover:text-white hover:underline">IPOs</Link></li>
              <li><Link href="/gmp" className="hover:text-white hover:underline">GMP</Link></li>
              <li><Link href="/calendar" className="hover:text-white hover:underline">Calendar</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-lg font-semibold text-emerald-400">Tools</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/tools/calculator" className="hover:text-white hover:underline">Allotment Calculator</Link></li>
              <li><Link href="/tools/compare" className="hover:text-white hover:underline">Compare IPOs</Link></li>
              <li><Link href="/tools/subscription" className="hover:text-white hover:underline">Subscription Status</Link></li>
              <li><Link href="/news" className="hover:text-white hover:underline">Market News</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-lg font-semibold text-emerald-400">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/learn" className="hover:text-white hover:underline">Learn</Link></li>
              <li><Link href="/about" className="hover:text-white hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:underline">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white hover:underline">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-[#1a5c47] pt-8 text-center text-sm text-slate-400">
          <p className="mb-2">
            Disclaimer: The information provided on this platform is for educational and informational purposes only and does not constitute financial advice. Always do your own research or consult a financial advisor before investing.
          </p>
          <p>&copy; {new Date().getFullYear()} IPOTrack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
