'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const CreateIPOSchema = z.object({
  ipoName: z.string().min(1, 'IPO name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  ipoType: z.enum(['Mainboard', 'SME']),
  status: z.enum(['Upcoming', 'Open', 'Closed', 'Allotment', 'Listing', 'Listed']),
  openDate: z.string().optional(),
  closeDate: z.string().optional(),
  allotmentDate: z.string().optional(),
  listingDate: z.string().optional(),
  priceBandMin: z.number().min(0).default(0),
  priceBandMax: z.number().min(0).default(0),
  lotSize: z.number().int().min(0).default(0),
  issueSize: z.string().optional(),
  issueSizeCrore: z.number().min(0).default(0),
  faceValue: z.number().min(0).default(10),
  gmp: z.number().int().default(0),
  subTotal: z.number().min(0).default(0),
  subRetail: z.number().min(0).default(0),
  subQib: z.number().min(0).default(0),
  subNii: z.number().min(0).default(0),
  subEmployee: z.number().min(0).default(0),
  listingPrice: z.number().optional(),
  industry: z.string().default(''),
  sector: z.string().default(''),
  about: z.string().default(''),
  promoters: z.string().default(''),
  registrar: z.string().default(''),
  leadManagers: z.string().default(''),
  location: z.string().default(''),
});

function parseDate(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

export async function createIPO(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const rawData = Object.fromEntries(formData.entries());
    
    // Build a properly typed data object
    const data: Record<string, unknown> = { ...rawData };
    
    // Convert numeric strings to numbers
    const numericFields = ['priceBandMin', 'priceBandMax', 'lotSize', 'issueSizeCrore', 'faceValue', 'gmp', 'subTotal', 'subRetail', 'subQib', 'subNii', 'subEmployee'];
    numericFields.forEach(field => {
      if (data[field]) {
        data[field] = Number(data[field]);
      }
    });

    if (data.listingPrice) {
      data.listingPrice = Number(data.listingPrice);
    }

    const parsed = CreateIPOSchema.parse(data);

    const existing = await prisma.ipo.findUnique({ where: { slug: parsed.slug } });
    if (existing) {
      return { success: false, error: 'Slug already exists' };
    }

    const promotersArray = parsed.promoters ? parsed.promoters.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const leadManagersArray = parsed.leadManagers ? parsed.leadManagers.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    const ipo = await prisma.ipo.create({
      data: {
        ipoName: parsed.ipoName,
        companyName: parsed.companyName,
        slug: parsed.slug,
        ipoType: parsed.ipoType,
        status: parsed.status,
        openDate: parseDate(parsed.openDate),
        closeDate: parseDate(parsed.closeDate),
        allotmentDate: parseDate(parsed.allotmentDate),
        listingDate: parseDate(parsed.listingDate),
        priceBandMin: parsed.priceBandMin,
        priceBandMax: parsed.priceBandMax,
        lotSize: parsed.lotSize,
        issueSize: parsed.issueSize || '',
        issueSizeCrore: parsed.issueSizeCrore,
        faceValue: parsed.faceValue,
        gmp: parsed.gmp,
        previousGmp: 0,
        subTotal: parsed.subTotal,
        subRetail: parsed.subRetail,
        subQib: parsed.subQib,
        subNii: parsed.subNii,
        subEmployee: parsed.subEmployee,
        listingPrice: parsed.listingPrice || null,
        industry: parsed.industry,
        sector: parsed.sector,
        about: parsed.about,
        promoters: promotersArray,
        registrar: parsed.registrar,
        leadManagers: leadManagersArray,
        location: parsed.location,
        isDeleted: false,
      }
    });

    if (parsed.gmp > 0) {
      const estimatedListingPrice = parsed.priceBandMax + parsed.gmp;
      const estimatedGainPercent = parsed.priceBandMax > 0 ? (parsed.gmp / parsed.priceBandMax) * 100 : 0;
      
      await prisma.gmpHistory.create({
        data: {
          ipoId: ipo.id,
          gmp: parsed.gmp,
          estimatedListingPrice,
          estimatedGainPercent,
        }
      });
    }

    revalidatePath('/');
    revalidatePath('/ipos');
    revalidatePath('/gmp');
    revalidatePath('/admin');

    return { success: true, slug: ipo.slug };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: (error instanceof Error ? error.message : null) || 'Failed to create IPO' };
  }
}

export async function updateIPO(id: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const rawData = Object.fromEntries(formData.entries());
    const data: Record<string, unknown> = { ...rawData };
    
    const numericFields = ['priceBandMin', 'priceBandMax', 'lotSize', 'issueSizeCrore', 'faceValue', 'gmp', 'subTotal', 'subRetail', 'subQib', 'subNii', 'subEmployee'];
    numericFields.forEach(field => {
      if (data[field]) {
        data[field] = Number(data[field]);
      }
    });

    if (data.listingPrice) {
      data.listingPrice = Number(data.listingPrice);
    }

    const parsed = CreateIPOSchema.parse(data);

    const existing = await prisma.ipo.findUnique({ where: { slug: parsed.slug } });
    if (existing && existing.id !== id) {
      return { success: false, error: 'Slug already exists' };
    }

    const promotersArray = parsed.promoters ? parsed.promoters.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const leadManagersArray = parsed.leadManagers ? parsed.leadManagers.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

    const ipo = await prisma.ipo.update({
      where: { id },
      data: {
        ipoName: parsed.ipoName,
        companyName: parsed.companyName,
        slug: parsed.slug,
        ipoType: parsed.ipoType,
        status: parsed.status,
        openDate: parseDate(parsed.openDate),
        closeDate: parseDate(parsed.closeDate),
        allotmentDate: parseDate(parsed.allotmentDate),
        listingDate: parseDate(parsed.listingDate),
        priceBandMin: parsed.priceBandMin,
        priceBandMax: parsed.priceBandMax,
        lotSize: parsed.lotSize,
        issueSize: parsed.issueSize || '',
        issueSizeCrore: parsed.issueSizeCrore,
        faceValue: parsed.faceValue,
        subTotal: parsed.subTotal,
        subRetail: parsed.subRetail,
        subQib: parsed.subQib,
        subNii: parsed.subNii,
        subEmployee: parsed.subEmployee,
        listingPrice: parsed.listingPrice || null,
        industry: parsed.industry,
        sector: parsed.sector,
        about: parsed.about,
        promoters: promotersArray,
        registrar: parsed.registrar,
        leadManagers: leadManagersArray,
        location: parsed.location,
      }
    });

    revalidatePath('/');
    revalidatePath('/ipos');
    revalidatePath('/gmp');
    revalidatePath('/admin');
    revalidatePath(`/ipos/${ipo.slug}`);

    return { success: true, slug: ipo.slug };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: (error instanceof Error ? error.message : null) || 'Failed to update IPO' };
  }
}

export async function deleteIPO(id: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    await prisma.ipo.update({
      where: { id },
      data: { isDeleted: true }
    });

    revalidatePath('/');
    revalidatePath('/ipos');
    revalidatePath('/gmp');
    revalidatePath('/admin');

    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: (error instanceof Error ? error.message : null) || 'Failed to delete IPO' };
  }
}

export async function updateIPOStatus(id: string, status: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    await prisma.ipo.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/');
    revalidatePath('/ipos');
    revalidatePath('/gmp');
    revalidatePath('/admin');

    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: (error instanceof Error ? error.message : null) || 'Failed to update IPO status' };
  }
}
