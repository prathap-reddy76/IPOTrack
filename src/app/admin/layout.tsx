import { AdminProviders } from './providers';

export const metadata = {
  title: 'Admin Dashboard | IPOTrack',
  description: 'IPOTrack administration area',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProviders>{children}</AdminProviders>;
}
