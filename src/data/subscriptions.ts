import { SubscriptionHistory } from '@/types';

export const subscriptionHistory: Record<string, SubscriptionHistory[]> = {
  'emmvee-photovoltaic': [
    { date: '2026-09-11', qib: 1.2, nii: 2.5, retail: 3.8, total: 2.5 },
    { date: '2026-09-12', qib: 4.5, nii: 8.2, retail: 12.5, total: 6.8 },
    { date: '2026-09-13', qib: 15.6, nii: 25.4, retail: 45.2, total: 22.1 },
  ],
  'vikram-solar': [
    { date: '2026-09-11', qib: 0.8, nii: 1.5, retail: 2.2, total: 1.5 },
    { date: '2026-09-12', qib: 3.2, nii: 6.5, retail: 10.8, total: 5.4 },
    { date: '2026-09-13', qib: 12.5, nii: 18.6, retail: 32.5, total: 16.8 },
  ],
  'aegis-vopak-terminals': [
    { date: '2026-09-11', qib: 0.5, nii: 1.2, retail: 1.8, total: 1.1 },
    { date: '2026-09-14', qib: 2.5, nii: 5.4, retail: 8.5, total: 4.2 },
    { date: '2026-09-15', qib: 18.2, nii: 22.5, retail: 28.4, total: 21.5 },
  ],
  'sudarshan-chem': [
    { date: '2026-09-14', qib: 1.5, nii: 3.2, retail: 5.5, total: 3.1 },
    { date: '2026-09-15', qib: 5.8, nii: 12.4, retail: 18.6, total: 10.5 },
    { date: '2026-09-16', qib: 25.4, nii: 45.2, retail: 68.5, total: 38.6 },
  ],
  'jaro-institute': [
    { date: '2026-09-05', qib: 2.1, nii: 4.5, retail: 8.2, total: 4.8 },
    { date: '2026-09-08', qib: 8.5, nii: 16.2, retail: 25.4, total: 14.5 },
    { date: '2026-09-09', qib: 45.2, nii: 68.5, retail: 112.4, total: 65.2 },
  ],
};
