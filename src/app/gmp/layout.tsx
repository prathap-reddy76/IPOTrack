import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live GMP — Grey Market Premium Updates',
  description: 'Track live Grey Market Premium (GMP) for all upcoming and open IPOs. View GMP history, trends, and vs actual listing performance.',
};

export default function GmpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
