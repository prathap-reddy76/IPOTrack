import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IPO Details',
  description: 'Detailed information, GMP, subscription status, and financials for this IPO.',
};

export default function IpoDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
