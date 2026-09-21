import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminExists = await prisma.adminUser.findFirst();
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 12);
    await prisma.adminUser.create({
      data: {
        email: 'admin@ipotrack.com',
        passwordHash,
        name: 'Admin',
      },
    });
    console.log('✅ Admin user created: admin@ipotrack.com / admin123');
    console.log('⚠️  CHANGE THIS PASSWORD in production!');
  } else {
    console.log('ℹ️  Admin user already exists, skipping.');
  }

  // Create demo IPOs
  const ipoCount = await prisma.ipo.count();
  if (ipoCount === 0) {
    const demoIpos = [
      {
        slug: 'demo-solar-energy',
        ipoName: '[DEMO] SolarTech Energy Ltd IPO',
        companyName: '[DEMO] SolarTech Energy Ltd',
        ipoType: 'Mainboard',
        status: 'Open',
        openDate: new Date('2026-09-11'),
        closeDate: new Date('2026-09-15'),
        allotmentDate: new Date('2026-09-18'),
        listingDate: new Date('2026-09-22'),
        priceBandMin: 206,
        priceBandMax: 217,
        lotSize: 69,
        issueSize: '₹2,980 Cr',
        issueSizeCrore: 2980,
        faceValue: 10,
        gmp: 45,
        previousGmp: 40,
        gmpUpdatedAt: new Date(),
        subTotal: 6.8,
        subRetail: 4.1,
        subQib: 12.4,
        subNii: 8.5,
        subEmployee: 1.5,
        industry: 'Renewable Energy',
        sector: 'Energy',
        about: '[DEMO DATA] This is a sample IPO entry for development purposes. SolarTech Energy is a fictional company used to demonstrate the IPO tracking platform. Do not treat this as real market data.',
        promoters: ['Demo Promoter A', 'Demo Promoter B'],
        registrar: 'Demo Registrar Ltd',
        leadManagers: ['Demo Securities Ltd', 'Demo Financial Ltd'],
        location: 'Mumbai, India',
      },
      {
        slug: 'demo-fintech-payments',
        ipoName: '[DEMO] PayFlow Fintech Ltd IPO',
        companyName: '[DEMO] PayFlow Fintech Ltd',
        ipoType: 'Mainboard',
        status: 'Upcoming',
        openDate: new Date('2026-09-18'),
        closeDate: new Date('2026-09-22'),
        priceBandMin: 315,
        priceBandMax: 332,
        lotSize: 45,
        issueSize: '₹2,143 Cr',
        issueSizeCrore: 2143,
        faceValue: 10,
        gmp: 28,
        previousGmp: 25,
        gmpUpdatedAt: new Date(),
        subTotal: 0,
        subRetail: 0,
        subQib: 0,
        subNii: 0,
        subEmployee: 0,
        industry: 'Fintech',
        sector: 'Technology',
        about: '[DEMO DATA] This is a sample IPO entry for development purposes. PayFlow Fintech is a fictional company. Do not treat this as real market data.',
        promoters: ['Demo Promoter C'],
        registrar: 'Demo Registrar Ltd',
        leadManagers: ['Demo Capital Ltd'],
        location: 'Bengaluru, India',
      },
      {
        slug: 'demo-chem-industries',
        ipoName: '[DEMO] GreenChem Industries SME IPO',
        companyName: '[DEMO] GreenChem Industries Ltd',
        ipoType: 'SME',
        status: 'Closed',
        openDate: new Date('2026-09-05'),
        closeDate: new Date('2026-09-09'),
        allotmentDate: new Date('2026-09-10'),
        listingDate: new Date('2026-09-12'),
        priceBandMin: 120,
        priceBandMax: 128,
        lotSize: 100,
        issueSize: '₹54 Cr',
        issueSizeCrore: 54,
        faceValue: 10,
        gmp: 15,
        previousGmp: 12,
        gmpUpdatedAt: new Date(),
        subTotal: 18.5,
        subRetail: 8.2,
        subQib: 25.3,
        subNii: 15.1,
        subEmployee: 2.3,
        listingPrice: 145,
        industry: 'Chemicals',
        sector: 'Chemicals',
        about: '[DEMO DATA] This is a sample IPO entry for development purposes. GreenChem Industries is a fictional company. Do not treat this as real market data.',
        promoters: ['Demo Promoter D', 'Demo Promoter E'],
        registrar: 'Demo Registrar Ltd',
        leadManagers: ['Demo Advisory Ltd', 'Demo Securities Ltd'],
        location: 'Ahmedabad, India',
      },
    ];

    for (const ipoData of demoIpos) {
      const ipo = await prisma.ipo.create({ data: ipoData });

      // Create some GMP history for each demo IPO
      const baseGmp = ipoData.gmp;
      for (let i = 14; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const historicalGmp = Math.max(0, baseGmp + Math.floor((Math.random() - 0.5) * 20));
        const estListing = Number(ipoData.priceBandMax) + historicalGmp;
        const estGain = Number(ipoData.priceBandMax) > 0
          ? parseFloat(((historicalGmp / Number(ipoData.priceBandMax)) * 100).toFixed(2))
          : 0;

        await prisma.gmpHistory.create({
          data: {
            ipoId: ipo.id,
            gmp: historicalGmp,
            estimatedListingPrice: estListing,
            estimatedGainPercent: estGain,
            recordedAt: date,
          },
        });
      }

      console.log(`✅ Created demo IPO: ${ipoData.ipoName} with 15 GMP history records`);
    }
  } else {
    console.log(`ℹ️  ${ipoCount} IPOs already exist, skipping demo data.`);
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
