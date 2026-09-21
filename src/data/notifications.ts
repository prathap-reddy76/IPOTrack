import { AppNotification } from '@/types';

export const defaultNotifications: AppNotification[] = [
  { id: '1', type: 'gmp_update', title: 'GMP Updated for Emmvee Photovoltaic', message: 'GMP increased from ₹60 to ₹65', date: '2026-09-05T10:00:00Z', read: false },
  { id: '2', type: 'ipo_opening', title: 'Emmvee Photovoltaic IPO Opens Today', message: 'Apply now...', date: '2026-09-11T09:00:00Z', read: false },
  { id: '3', type: 'ipo_opening', title: 'Vikram Solar IPO Opens Today', message: 'Apply now...', date: '2026-09-11T09:15:00Z', read: true },
  { id: '4', type: 'subscription_update', title: 'Emmvee Photovoltaic subscription at 6.8x', message: 'The subscription rate has reached 6.8x overall.', date: '2026-09-12T17:00:00Z', read: false },
  { id: '5', type: 'allotment', title: 'Jaro Institute allotment finalized', message: 'Check your allotment status for Jaro Institute', date: '2026-09-10T14:00:00Z', read: true },
  { id: '6', type: 'listing', title: 'Jaro Institute lists on Sep 12', message: 'Jaro Institute is set to list on exchanges tomorrow', date: '2026-09-11T16:00:00Z', read: false },
  { id: '7', type: 'gmp_update', title: 'Aegis Vopak GMP rises to ₹20', message: 'GMP for Aegis Vopak Terminals has increased', date: '2026-09-10T09:30:00Z', read: true },
  { id: '8', type: 'ipo_closing', title: 'Vikram Solar IPO closes tomorrow', message: 'Last chance to apply for Vikram Solar IPO', date: '2026-09-11T18:00:00Z', read: false },
];
