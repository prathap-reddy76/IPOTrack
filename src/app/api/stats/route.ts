import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  const now = new Date();
  
  try {
    const [total, upcoming, open, listed, closingToday, listingToday] = await Promise.all([
      prisma.ipo.count({ where: { isDeleted: false } }),
      prisma.ipo.count({ where: { isDeleted: false, status: 'Upcoming' } }),
      prisma.ipo.count({ where: { isDeleted: false, status: 'Open' } }),
      prisma.ipo.count({ where: { isDeleted: false, status: 'Listed' } }),
      prisma.ipo.count({ 
        where: { 
          isDeleted: false, 
          closeDate: { gte: startOfDay(now), lte: endOfDay(now) } 
        } 
      }),
      prisma.ipo.count({ 
        where: { 
          isDeleted: false, 
          listingDate: { gte: startOfDay(now), lte: endOfDay(now) } 
        } 
      }),
    ]);
    
    return NextResponse.json({ total, upcoming, open, listed, closingToday, listingToday });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
