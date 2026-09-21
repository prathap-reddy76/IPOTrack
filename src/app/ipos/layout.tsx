import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IPO Dashboard — All IPOs, Mainboard & SME',
  description: 'Browse all upcoming, open, and listed IPOs with GMP, subscription data, and listing performance.',
};

export default function IposLayout({ children }: { children: React.ReactNode }) {
  return children;
}
