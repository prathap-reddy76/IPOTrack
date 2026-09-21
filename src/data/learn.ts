import { LearnArticle } from "@/types";

export const learnArticles: LearnArticle[] = [
  {
    id: "1",
    title: "What is an IPO?",
    slug: "what-is-ipo",
    category: "basics",
    icon: "BookOpen",
    excerpt: "Learn the fundamentals of an Initial Public Offering and how companies raise capital.",
    readTime: "5 min read",
    order: 1,
    content: `An **Initial Public Offering (IPO)** is the process by which a private company offers its shares to the public for the first time. Through this process, a privately held company transforms into a publicly traded one.

### Why do companies go public?
*   **Raising Capital:** The primary reason is to raise funds for expansion, debt repayment, or research and development.
*   **Liquidity for Founders/Early Investors:** It provides an exit strategy for early-stage investors (like venture capitalists) and founders to monetize their stakes.
*   **Brand Awareness:** Being a public company enhances corporate prestige, visibility, and credibility in the market.

### How does it work?
The company hires investment banks to underwrite the IPO. These banks help determine the initial price of the stock, the number of shares to be issued, and the optimal time to bring the offering to the market. They draft the **Red Herring Prospectus (RHP)**, which contains all vital details about the company's financials and business model.

Investors bid for shares within a specified price band during the offering period. If the demand exceeds the supply (oversubscription), shares are allocated based on a lottery or proportionate basis.`
  },
  {
    id: "2",
    title: "What is GMP?",
    slug: "what-is-gmp",
    category: "gmp",
    icon: "TrendingUp",
    excerpt: "Understand the Grey Market Premium and its role as an unofficial indicator of IPO demand.",
    readTime: "4 min read",
    order: 2,
    content: `**Grey Market Premium (GMP)** is the premium amount at which IPO shares are traded unofficially in the unlisted market before they are officially listed on the stock exchanges.

### Key Aspects of GMP
*   **Unofficial Market:** The grey market is an over-the-counter, unregulated market. Trades are based on trust and are not backed by SEBI or the stock exchanges.
*   **Demand Indicator:** A positive GMP indicates strong demand and suggests the stock might list at a premium. Conversely, a negative GMP (discount) indicates weak demand.
*   **Calculation:** If an IPO price is ₹100 and the GMP is ₹20, the estimated listing price is ₹120.

### Should you rely solely on GMP?
While GMP is a popular indicator, it can be easily manipulated by market operators. Investors should use it merely as a directional cue rather than the sole factor for their investment decisions. Always evaluate the company's fundamentals and valuation.`
  },
  {
    id: "3",
    title: "How does IPO Allotment work?",
    slug: "ipo-allotment-process",
    category: "basics",
    icon: "Users",
    excerpt: "A step-by-step guide to how shares are allocated to different categories of investors.",
    readTime: "6 min read",
    order: 3,
    content: `IPO allotment is the process of distributing shares to investors who have bid for them during the IPO open period. The process is overseen by the registrar of the IPO.

### The Allotment Process
If an IPO is **undersubscribed** (demand is less than the shares offered), all valid applicants receive full allotment.

If the IPO is **oversubscribed**, the allotment process depends on the investor category:
*   **Retail Individual Investors (RII):** SEBI regulations mandate that the maximum number of retail investors receive at least one lot. If the oversubscription is massive, the allotment is determined via a computerized lottery draw.
*   **Non-Institutional Investors (NII):** Allotment is generally done on a proportionate basis, though recent rules have introduced lottery mechanisms for smaller NII buckets.
*   **Qualified Institutional Buyers (QIB):** Allotment is proportionate based on the quantum of their bids.

### Checking Allotment Status
Once the registrar finalizes the basis of allotment, investors can check their status on the registrar's website, the BSE/NSE websites, or through their broker's platform using their PAN or Application Number.`
  },
  {
    id: "4",
    title: "What is a Mainboard IPO?",
    slug: "mainboard-ipo",
    category: "basics",
    icon: "Building2",
    excerpt: "Discover the criteria and characteristics of large-cap public offerings.",
    readTime: "3 min read",
    order: 4,
    content: `A **Mainboard IPO** is the public offering of shares by large, well-established companies on the primary stock exchanges—the BSE (Bombay Stock Exchange) and NSE (National Stock Exchange).

### Eligibility Criteria
SEBI mandates stringent eligibility criteria for mainboard listings:
*   **Profitability:** The company must have a minimum average pre-tax operating profit of ₹15 crore for at least three of the preceding five years.
*   **Net Worth:** Minimum net worth of ₹1 crore in each of the preceding three full years.
*   **Issue Size:** Post-issue paid-up capital must be at least ₹10 crore.

Mainboard IPOs are perceived as less risky compared to SME IPOs due to strict regulatory oversight, robust corporate governance, and higher liquidity.`
  },
  {
    id: "5",
    title: "What is an SME IPO?",
    slug: "sme-ipo",
    category: "basics",
    icon: "Store",
    excerpt: "Understand Small and Medium Enterprise IPOs and their unique risk-reward profile.",
    readTime: "4 min read",
    order: 5,
    content: `An **SME IPO** is a method for Small and Medium Enterprises to raise capital from the public. These companies are listed on specialized SME platforms like BSE SME or NSE Emerge.

### Differences from Mainboard IPOs
*   **Lot Size & Investment Amount:** SME IPOs require a higher minimum investment (often ₹1 lakh or more), targeting high-net-worth individuals and serious retail investors.
*   **Eligibility:** The profitability and net worth requirements are significantly relaxed compared to mainboard listings.
*   **Liquidity & Risk:** SME stocks often suffer from low trading volumes (liquidity), making it difficult to exit positions. They are generally considered high risk, high reward.

Investors looking at SME IPOs must conduct thorough due diligence, as the lack of stringent disclosures can sometimes mask underlying fundamental issues.`
  },
  {
    id: "6",
    title: "What is QIB?",
    slug: "what-is-qib",
    category: "analysis",
    icon: "Briefcase",
    excerpt: "Explore the role of Qualified Institutional Buyers in the IPO ecosystem.",
    readTime: "4 min read",
    order: 6,
    content: `**Qualified Institutional Buyers (QIBs)** are large, institutional investors with the financial expertise and capital to evaluate and invest heavily in capital markets.

### Who are QIBs?
The QIB category includes:
*   Mutual Funds
*   Foreign Portfolio Investors (FPIs)
*   Commercial Banks
*   Public Financial Institutions
*   Insurance Companies

### Why QIBs Matter
In a typical Mainboard IPO, 50% of the issue is reserved for QIBs (if the company has a prior profit track record; 75% if not). High QIB subscription indicates strong confidence from "smart money." Retail investors often look at QIB numbers on the final day of the IPO as a barometer for the company's fundamental strength.`
  },
  {
    id: "7",
    title: "What is NII?",
    slug: "what-is-nii",
    category: "analysis",
    icon: "Users",
    excerpt: "Learn about Non-Institutional Investors and High Net-worth Individuals.",
    readTime: "3 min read",
    order: 7,
    content: `**Non-Institutional Investors (NIIs)** are individuals or entities that invest more than ₹2 lakh in an IPO. They are often referred to as High Net-worth Individuals (HNIs).

### NII Sub-categories
Recently, SEBI split the NII category into two distinct buckets to ensure fairer allotment:
*   **sNII (Small NII):** Bids ranging from ₹2 lakh to ₹10 lakh. This bucket gets one-third of the total NII allocation.
*   **bNII (Big NII):** Bids above ₹10 lakh. This bucket receives the remaining two-thirds.

NIIs generally receive a 15% reservation in a standard Mainboard IPO. High NII subscription often drives the Grey Market Premium upward, as HNIs heavily utilize borrowed funds (IPO funding) to amplify their returns.`
  },
  {
    id: "8",
    title: "What is Retail Quota?",
    slug: "retail-quota",
    category: "basics",
    icon: "ShoppingCart",
    excerpt: "A breakdown of the Retail Individual Investor category and investment limits.",
    readTime: "4 min read",
    order: 8,
    content: `The **Retail Individual Investor (RII)** category is designed for everyday investors participating in the stock market.

### Rules of the Retail Quota
*   **Investment Limit:** An individual is considered a retail investor if their total bid amount in an IPO is less than ₹2 lakh.
*   **Reservation:** Typically, 35% of a standard Mainboard IPO is reserved for retail investors (10% if the company does not meet strict profitability criteria).
*   **Allotment Strategy:** To maximize chances of allotment in an oversubscribed IPO, retail investors should apply using multiple Demat accounts (of different family members with distinct PANs) for just one lot each, rather than bidding for maximum lots from a single account.

This structure democratizes market access, allowing small investors to participate in wealth creation alongside large institutions.`
  },
  {
    id: "9",
    title: "How does Subscription work?",
    slug: "how-subscription-works",
    category: "strategies",
    icon: "BarChart3",
    excerpt: "Analyze how IPO demand is measured and what subscription multiples mean.",
    readTime: "5 min read",
    order: 9,
    content: `**IPO Subscription** refers to the number of times the public issue is demanded by investors compared to the number of shares available.

### Understanding the Numbers
If an IPO offers 1 crore shares and receives bids for 5 crore shares, it is said to be subscribed **5 times (5x)**.

Subscription data is divided into categories:
1.  **QIB Subscription:** Indicates institutional confidence. Usually spikes on the final day.
2.  **NII Subscription:** Indicates HNI interest, often correlated with high grey market premiums.
3.  **Retail Subscription:** Indicates mass appeal.

### Strategic Bidding
Analyzing live subscription data over the 3-day IPO period helps investors decide whether to apply. A rapidly subscribing issue suggests high listing gain potential. Conversely, a struggling IPO might list at a discount, prompting investors to withdraw or avoid bidding altogether.`
  },
  {
    id: "10",
    title: "How is Listing Price estimated?",
    slug: "listing-price-estimation",
    category: "analysis",
    icon: "Calculator",
    excerpt: "Learn the methods and metrics used to estimate an IPO's debut price on the stock exchange.",
    readTime: "5 min read",
    order: 10,
    content: `The **Listing Price** is the initial price at which an IPO begins trading on the stock exchange on its debut day. While it is determined by market forces (supply and demand) during the pre-open session, it can be estimated using several factors.

### Key Factors Determining Listing Price
*   **Grey Market Premium (GMP):** The most direct unofficial indicator. (Issue Price + GMP = Estimated Listing Price).
*   **Subscription Levels:** Massive oversubscription in QIB and NII categories typically guarantees a strong listing.
*   **Market Sentiment:** Broader market conditions (Nifty/Sensex trends) on the listing day significantly impact the opening price.
*   **Peer Valuation:** If the IPO was priced cheaply (low P/E ratio) compared to its listed competitors, the market often corrects this anomaly by listing the stock at a premium.

While these tools help form a solid estimate, unexpected global events or sudden market crashes can always result in a listing price that deviates from predictions.`
  }
];
