

export interface IPO {
  id: string;
  slug: string;
  name: string;
  type: string; // 'Mainboard' | 'SME'
  status: string; // 'Open' | 'Upcoming' | 'Closed' | 'Listed'
  priceBand: string;
  gmp: number;
  previousGmp: number;
  lotSize: number;
  sharesPerLot: number;
  issueSize: string;
  openDate: string;
  closeDate: string;
  allotmentDate?: string;
  refundDate?: string;
  dematDate?: string;
  listingDate?: string;
  industry: string;
  sector: string;
  about: string;
  promoters: string[];
  registrar: string;
  leadManagers: string[];
  location: string;
  subscription: SubscriptionData;
  financials: FinancialData[];
  documents: DocumentLink[];
  gmpHistory: GMPHistoryPoint[];
  faceValue?: number;
  freshIssue?: string;
  ofs?: string;
  minInvestment?: number;
  listingPrice?: number;
  // Financial data
  revenue?: number;
  profit?: number;
  ebitda?: number;
  totalAssets?: number;
  netWorth?: number;
  eps?: number;
  roe?: number;
  roce?: number;
  debtToEquity?: number;
  // Exchange / Company
  exchange?: string;
  marketMaker?: string;
  // Computed
  ipoTrackScore?: number;
  estimatedListing?: number;
  expectedGainPercent?: number;
}

export interface GMPHistoryPoint {
  date: string;
  gmp: number;
  price?: number;
}

export interface GMPRecord {
  ipoId: string;
  companyName: string;
  slug: string;
  ipoType: string;
  currentGmp: number;
  previousGmp: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  priceBandMax: number;
}

export interface SubscriptionData {
  qib: number;
  nii: number;
  retail: number;
  employee: number;
  total: number;
}

export interface SubscriptionHistory {
  date: string;
  qib: number;
  nii: number;
  retail: number;
  total: number;
}

export interface FinancialData {
  year: string;
  revenue: number;
  profit: number;
  netWorth: number;
  totalAssets: number;
}

export interface DocumentLink {
  name: string;
  type?: string;
  url: string;
}

export interface CalendarEvent {
  id: string;
  ipoId?: string;
  ipoSlug: string;
  companyName: string;
  slug?: string;
  date: string;
  type: string;
  description?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  summary?: string;
  content: string;
  category: string;
  image: string;
  date: string;
  author: string;
  relatedIpoSlug?: string;
  tags: string[];
}

export interface LearnArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  icon: string;
  order: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
  displayCurrency: string;
  emailAlerts: boolean;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  ipoSlug?: string;
}
