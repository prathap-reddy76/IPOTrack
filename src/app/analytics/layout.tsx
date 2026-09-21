import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IPO Analytics & Market Intelligence',
  description: 'IPO market analytics, rankings, sector performance, and historical analysis.',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
