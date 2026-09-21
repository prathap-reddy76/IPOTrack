'use server';

import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateGMP(ipoId: string, newGmp: number) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    if (!Number.isInteger(newGmp)) {
      throw new Error('GMP must be a valid integer');
    }

    const currentIpo = await prisma.ipo.findUnique({ where: { id: ipoId } });
    if (!currentIpo) {
      throw new Error('IPO not found');
    }

    const priceBandMax = Number(currentIpo.priceBandMax);
    const estimatedListingPrice = priceBandMax + newGmp;
    const estimatedGainPercent = priceBandMax > 0 ? ((newGmp / priceBandMax) * 100) : 0;

    await prisma.$transaction([
      prisma.ipo.update({
        where: { id: ipoId },
        data: {
          previousGmp: currentIpo.gmp,
          gmp: newGmp,
          gmpUpdatedAt: new Date()
        }
      }),
      prisma.gmpHistory.create({
        data: {
          ipoId,
          gmp: newGmp,
          estimatedListingPrice,
          estimatedGainPercent
        }
      })
    ]);

    revalidatePath('/');
    revalidatePath('/ipos');
    revalidatePath('/gmp');
    revalidatePath('/admin');
    revalidatePath(`/ipos/${currentIpo.slug}`);

    return { success: true };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update GMP' };
  }
}
