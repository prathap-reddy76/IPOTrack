import { IPO } from "@/types";

export const ipos: IPO[] = [
  {
    id: "1",
    slug: "emmvee-photovoltaic",
    name: "Emmvee Photovoltaic Ltd",
    type: "Mainboard",
    status: "Open",
    priceBand: "₹206-217",
    gmp: 65,
    previousGmp: 60,
    lotSize: 69,
    sharesPerLot: 69,
    issueSize: "₹2,980 Cr",
    openDate: "Sep 11, 2026",
    closeDate: "Sep 12, 2026",
    industry: "Renewable Energy",
    sector: "Energy",
    about: "Emmvee Photovoltaic Ltd is a prominent manufacturer of Solar PV modules in India. They focus on delivering high-efficiency renewable energy solutions globally. The company operates multiple state-of-the-art manufacturing facilities.",
    promoters: ["D.V. Manjunatha", "Emmvee Solar Systems Private Limited"],
    registrar: "Link Intime India Private Ltd",
    leadManagers: ["ICICI Securities Limited", "JM Financial Limited"],
    location: "Bengaluru, India",
    subscription: { qib: 12.4, nii: 8.5, retail: 4.1, employee: 1.5, total: 6.8 },
    financials: [
      { year: "FY2024", revenue: 1540.2, profit: 125.6, netWorth: 450.5, totalAssets: 1200.4 },
      { year: "FY2025", revenue: 2100.5, profit: 210.3, netWorth: 660.8, totalAssets: 1550.2 },
      { year: "FY2026", revenue: 2850.8, profit: 345.2, netWorth: 1006.1, totalAssets: 2100.5 },
    ],
    documents: [
      { name: "DRHP", url: "#" },
      { name: "RHP", url: "#" },
      { name: "Anchor Investors List", url: "#" }
    ],
    gmpHistory: Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(2026, 7, 10 + i);
      const dayGmp = 40 + Math.floor(Math.random() * 30);
      return { date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), gmp: dayGmp, price: 217 + dayGmp };
    })
  },
  {
    id: "2",
    slug: "vikram-solar",
    name: "Vikram Solar Ltd",
    type: "Mainboard",
    status: "Open",
    priceBand: "₹315-332",
    gmp: 48,
    previousGmp: 45,
    lotSize: 45,
    sharesPerLot: 45,
    issueSize: "₹2,143 Cr",
    openDate: "Sep 11, 2026",
    closeDate: "Sep 12, 2026",
    industry: "Solar Energy",
    sector: "Energy",
    about: "Vikram Solar Ltd is one of India's largest solar module manufacturers. They provide comprehensive EPC solutions and O&M services. Their global footprint spans over 30 countries.",
    promoters: ["Gyanesh Chaudhary", "H.K. Chaudhary"],
    registrar: "KFin Technologies Limited",
    leadManagers: ["Kotak Mahindra Capital Company Limited", "Axis Capital Limited"],
    location: "Kolkata, India",
    subscription: { qib: 15.2, nii: 6.8, retail: 3.5, employee: 0, total: 7.2 },
    financials: [
      { year: "FY2024", revenue: 1800.4, profit: 110.5, netWorth: 520.1, totalAssets: 1400.6 },
      { year: "FY2025", revenue: 2450.2, profit: 180.4, netWorth: 700.5, totalAssets: 1750.8 },
      { year: "FY2026", revenue: 3200.7, profit: 260.8, netWorth: 960.3, totalAssets: 2300.2 },
    ],
    documents: [
      { name: "DRHP", url: "#" },
      { name: "RHP", url: "#" },
    ],
    gmpHistory: Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(2026, 7, 10 + i);
      const dayGmp = 30 + Math.floor(Math.random() * 25);
      return { date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), gmp: dayGmp, price: 332 + dayGmp };
    })
  },
  {
    id: "3",
    slug: "aegis-vopak-terminals",
    name: "Aegis Vopak Terminals Ltd",
    type: "Mainboard",
    status: "Upcoming",
    priceBand: "₹223-335",
    gmp: 20,
    previousGmp: 18,
    lotSize: 42,
    sharesPerLot: 42,
    issueSize: "₹7,957 Cr",
    openDate: "Sep 11, 2026",
    closeDate: "Sep 15, 2026",
    industry: "Logistics",
    sector: "Infrastructure",
    about: "Aegis Vopak Terminals Ltd operates specialized bulk liquid storage terminals across major Indian ports. They handle critical chemicals and petroleum products. The joint venture leverages global expertise in tank terminal operations.",
    promoters: ["Aegis Logistics Limited", "Vopak India B.V."],
    registrar: "Link Intime India Private Ltd",
    leadManagers: ["SBI Capital Markets Limited", "HDFC Bank Limited"],
    location: "Mumbai, India",
    subscription: { qib: 0, nii: 0, retail: 0, employee: 0, total: 0 },
    financials: [
      { year: "FY2024", revenue: 3500.5, profit: 450.2, netWorth: 1800.4, totalAssets: 5000.2 },
      { year: "FY2025", revenue: 4200.8, profit: 580.6, netWorth: 2380.1, totalAssets: 6200.5 },
      { year: "FY2026", revenue: 5100.2, profit: 710.4, netWorth: 3090.5, totalAssets: 7800.8 },
    ],
    documents: [
      { name: "DRHP", url: "#" },
    ],
    gmpHistory: Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(2026, 7, 10 + i);
      const dayGmp = 15 + Math.floor(Math.random() * 10);
      return { date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), gmp: dayGmp, price: 335 + dayGmp };
    })
  },
  {
    id: "4",
    slug: "sudarshan-chem",
    name: "Sudarshan Chem Ltd",
    type: "SME",
    status: "Upcoming",
    priceBand: "₹500-528",
    gmp: 12,
    previousGmp: 12,
    lotSize: 28,
    sharesPerLot: 28,
    issueSize: "₹540 Cr",
    openDate: "Sep 14, 2026",
    closeDate: "Sep 16, 2026",
    industry: "Chemicals",
    sector: "Chemicals",
    about: "Sudarshan Chem Ltd specializes in manufacturing specialty chemicals and colorants for industrial applications. They have a strong R&D focus driving innovative product lines. Their products are exported to over 20 countries.",
    promoters: ["R.K. Gupta", "Sunita Gupta"],
    registrar: "Bigshare Services Pvt Ltd",
    leadManagers: ["Saffron Capital Advisors Private Limited"],
    location: "Pune, India",
    subscription: { qib: 0, nii: 0, retail: 0, employee: 0, total: 0 },
    financials: [
      { year: "FY2024", revenue: 250.4, profit: 35.6, netWorth: 120.5, totalAssets: 300.2 },
      { year: "FY2025", revenue: 340.2, profit: 55.4, netWorth: 175.9, totalAssets: 420.8 },
      { year: "FY2026", revenue: 450.6, profit: 82.1, netWorth: 258.0, totalAssets: 550.4 },
    ],
    documents: [
      { name: "DRHP", url: "#" },
    ],
    gmpHistory: Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(2026, 7, 10 + i);
      const dayGmp = 5 + Math.floor(Math.random() * 15);
      return { date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), gmp: dayGmp, price: 528 + dayGmp };
    })
  },
  {
    id: "5",
    slug: "jaro-institute",
    name: "Jaro Institute Ltd",
    type: "Mainboard",
    status: "Closed",
    priceBand: "₹840-890",
    gmp: 25,
    previousGmp: 15,
    lotSize: 16,
    sharesPerLot: 16,
    issueSize: "₹915 Cr",
    openDate: "Sep 5, 2026",
    closeDate: "Sep 9, 2026",
    allotmentDate: "Sep 10, 2026",
    refundDate: "Sep 11, 2026",
    listingDate: "Sep 12, 2026",
    industry: "Education",
    sector: "Education",
    about: "Jaro Institute Ltd provides premium executive education and online learning programs. They partner with top global universities and corporate institutes. The platform has upskilled over 300,000 professionals worldwide.",
    promoters: ["Sanjay Salunkhe"],
    registrar: "Link Intime India Private Ltd",
    leadManagers: ["Motilal Oswal Investment Advisors Limited", "Nuvama Wealth Management Limited"],
    location: "Mumbai, India",
    subscription: { qib: 42.5, nii: 25.4, retail: 12.8, employee: 3.2, total: 24.6 },
    financials: [
      { year: "FY2024", revenue: 580.5, profit: 85.2, netWorth: 210.4, totalAssets: 450.8 },
      { year: "FY2025", revenue: 760.2, profit: 145.6, netWorth: 356.0, totalAssets: 680.5 },
      { year: "FY2026", revenue: 1050.8, profit: 210.4, netWorth: 566.4, totalAssets: 950.2 },
    ],
    documents: [
      { name: "DRHP", url: "#" },
      { name: "RHP", url: "#" },
      { name: "Anchor Investors", url: "#" },
    ],
    gmpHistory: Array.from({ length: 30 }).map((_, i) => {
      const date = new Date(2026, 7, 10 + i);
      const dayGmp = 10 + Math.floor(Math.random() * 20);
      return { date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), gmp: dayGmp, price: 890 + dayGmp };
    })
  },
  {
    id: "6",
    slug: "phonepe-proposed",
    name: "PhonePe (Proposed)",
    type: "Mainboard",
    status: "Upcoming",
    priceBand: "0-0",
    gmp: 0,
    previousGmp: 0,
    lotSize: 0,
    sharesPerLot: 0,
    issueSize: "0",
    openDate: "",
    closeDate: "",
    industry: "Fintech",
    sector: "Technology",
    about: "PhonePe is India's leading digital payments and financial services platform. It commands a significant market share in the UPI ecosystem. The company is planning to raise funds to expand its lending and insurance portfolios.",
    promoters: ["Sameer Nigam", "Rahul Chari"],
    registrar: "TBA",
    leadManagers: ["TBA"],
    location: "Bengaluru, India",
    subscription: { qib: 0, nii: 0, retail: 0, employee: 0, total: 0 },
    financials: [
      { year: "FY2024", revenue: 5200.5, profit: -800.4, netWorth: 4500.2, totalAssets: 12000.8 },
      { year: "FY2025", revenue: 8500.2, profit: -250.6, netWorth: 4249.6, totalAssets: 15500.4 },
      { year: "FY2026", revenue: 13000.5, profit: 550.2, netWorth: 4799.8, totalAssets: 21000.5 },
    ],
    documents: [],
    gmpHistory: []
  }
];
