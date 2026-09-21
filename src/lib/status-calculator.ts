import 'server-only';

/**
 * Derive IPO status from dates.
 * This allows automatic status calculation instead of relying solely on manual entry.
 */

export type IpoStatus = 
  | 'Upcoming' 
  | 'Open' 
  | 'Closing Soon' 
  | 'Closed' 
  | 'Allotment' 
  | 'Listing Soon' 
  | 'Listed';

interface StatusInput {
  openDate: Date | null;
  closeDate: Date | null;
  allotmentDate: Date | null;
  listingDate: Date | null;
  listingPrice: number | null;
  currentStatus: string;
}

export function calculateIpoStatus(ipo: StatusInput): IpoStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If listing price is set and listing date has passed, it's Listed
  if (ipo.listingDate && ipo.listingPrice != null && ipo.listingPrice > 0) {
    return 'Listed';
  }
  if (ipo.listingDate && new Date(ipo.listingDate) <= today) {
    return 'Listed';
  }

  // If listing date is within 2 days
  if (ipo.listingDate) {
    const listDate = new Date(ipo.listingDate);
    const daysUntilListing = Math.ceil((listDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilListing <= 2 && daysUntilListing > 0) {
      return 'Listing Soon';
    }
  }

  // If allotment date is around now
  if (ipo.allotmentDate) {
    const allotDate = new Date(ipo.allotmentDate);
    const daysFromAllotment = Math.ceil((today.getTime() - allotDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysFromAllotment >= -1 && daysFromAllotment <= 3 && ipo.closeDate && new Date(ipo.closeDate) < today) {
      return 'Allotment';
    }
  }

  // If close date has passed
  if (ipo.closeDate && new Date(ipo.closeDate) < today) {
    return 'Closed';
  }

  // If close date is today or tomorrow
  if (ipo.closeDate) {
    const closeDate = new Date(ipo.closeDate);
    const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilClose <= 1 && daysUntilClose >= 0) {
      return 'Closing Soon';
    }
  }

  // If open date has passed and close date hasn't
  if (ipo.openDate && new Date(ipo.openDate) <= today) {
    if (!ipo.closeDate || new Date(ipo.closeDate) >= today) {
      return 'Open';
    }
  }

  // Default
  return 'Upcoming';
}
