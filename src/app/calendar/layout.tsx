import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IPO Calendar — Upcoming IPO Dates',
  description: 'View IPO opening dates, closing dates, allotment dates, and listing dates on an interactive calendar.',
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
