import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IPO Tools — Calculators & Comparison',
  description: 'IPO calculator, GMP calculator, allotment calculator, and IPO comparison tools.',
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
