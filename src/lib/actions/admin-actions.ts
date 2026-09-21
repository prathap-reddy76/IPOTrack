'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function createAdminUser(email: string, password: string, name: string, setupSecret: string) {
  try {
    if (setupSecret !== process.env.AUTH_SECRET) {
      throw new Error('Invalid setup secret');
    }

    const count = await prisma.adminUser.count();
    if (count > 0) {
      throw new Error('Admin user already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name,
      }
    });

    return { success: true, id: admin.id };
  } catch (error: unknown) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create admin user' };
  }
}
