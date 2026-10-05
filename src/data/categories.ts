// Category prioritisation inputs - straight from deck slide 3 ("02 Prioritization framework & ranking")
// and the primary-research annexure (slide 12: 15 manufacturers called, 11 categories, 2 marketplaces).

export type CategoryId =
  | 'footwear' | 'womens' | 'mens' | 'jewellery' | 'kids'
  | 'linen' | 'kitchen' | 'mensacc' | 'fitness' | 'personal';

export interface Category {
  id: CategoryId;
  name: string;
  nameHi: string;
  /** Price advantage score (0-100), from primary research. 50% weight in the deck. */
  priceAdv: number;
  priceAdvNote: string; // "Rs174/order · 27.5% RTO"
  /** Market headroom score (growth + entry barrier). 25% weight. */
  headroom: number;
  headroomNote: string;
  /** Meesho e-com GMV share score. 25% weight. */
  share: number;
  shareNote: string;
  rtoPct: number;
  /** One manufacturer we called for this category (slide 12). */
  research?: {
    maker: string; product: string; wholesale: number; moq: number;
    dispatch: string; amazon: string; flipkart: string; recommended: number;
  };
}

export const CATEGORIES: Category[] = [
  {
    id: 'footwear', name: 'Footwear', nameHi: 'फुटवियर', priceAdv: 100, priceAdvNote: '₹174/order · 27.5% RTO',
    headroom: 68, headroomNote: '9.7% CAGR · BIS QCO', share: 92, shareNote: '22% of fashion', rtoPct: 0.275,
    research: { maker: 'BMMJ and Sons Pvt Ltd', product: 'Ladies sandals (comfort block heel)', wholesale: 130, moq: 50, dispatch: '1-2 days', amazon: '₹499', flipkart: '₹499', recommended: 499 },
  },
  {
    id: 'womens', name: "Women's Fashion", nameHi: 'महिलाओं के कपड़े', priceAdv: 69, priceAdvNote: '₹120/order · 32.5% RTO',
    headroom: 62, headroomNote: '2.71% CAGR · no cert needed', share: 92, shareNote: '22% of fashion', rtoPct: 0.325,
    research: { maker: 'Surat textile makers', product: "Women's printed cotton gown", wholesale: 100, moq: 100, dispatch: '3-4 days', amazon: '₹399', flipkart: '₹371', recommended: 399 },
  },
  {
    id: 'mens', name: "Men's Fashion", nameHi: 'पुरुषों के कपड़े', priceAdv: 55, priceAdvNote: '₹96/order · 32.5% RTO',
    headroom: 82, headroomNote: '7.24% CAGR · no cert needed', share: 92, shareNote: '22% of fashion', rtoPct: 0.325,
    research: { maker: 'A N Knitwear', product: 'Round-neck cotton T-shirt', wholesale: 90, moq: 100, dispatch: '4-5 days', amazon: '₹349', flipkart: '₹349', recommended: 349 },
  },
  {
    id: 'jewellery', name: 'Imitation Jewellery', nameHi: 'आर्टिफिशियल ज्वेलरी', priceAdv: 41, priceAdvNote: '₹70/order · 8% RTO',
    headroom: 100, headroomNote: '11.4% CAGR · no cert needed', share: 92, shareNote: '22% of fashion', rtoPct: 0.08,
    research: { maker: 'Shreeji Imitation Jewellery', product: 'Gold-plated pendant chain', wholesale: 55, moq: 200, dispatch: '3-4 days', amazon: '₹199', flipkart: '₹220', recommended: 199 },
  },
  {
    id: 'kids', name: 'Kids Wear', nameHi: 'बच्चों के कपड़े', priceAdv: 53, priceAdvNote: '₹92/order · 32.5% RTO',
    headroom: 59, headroomNote: '2.08% CAGR · no cert needed', share: 92, shareNote: '22% of fashion', rtoPct: 0.325,
    research: { maker: 'Gokul Hosiery', product: 'Kids 2-piece set (T-shirt + shorts)', wholesale: 50, moq: 250, dispatch: '7-8 days', amazon: '₹299', flipkart: '₹272', recommended: 299 },
  },
  {
    id: 'linen', name: 'Home Linen', nameHi: 'होम लिनन', priceAdv: 40, priceAdvNote: '₹70/order · 17.5% RTO',
    headroom: 70, headroomNote: '4.65% CAGR · no cert needed', share: 100, shareNote: '24% of home & kitchen', rtoPct: 0.175,
    research: { maker: 'Lal Ji Bedsheets', product: 'Cotton single bedsheet + pillow cover', wholesale: 115, moq: 240, dispatch: '2 days', amazon: '₹269', flipkart: '₹249', recommended: 299 },
  },
  {
    id: 'kitchen', name: 'Kitchenware', nameHi: 'किचनवेयर', priceAdv: 31, priceAdvNote: '₹54/order · 17.5% RTO',
    headroom: 76, headroomNote: '5.91% CAGR · no cert needed', share: 100, shareNote: '24% of home & kitchen', rtoPct: 0.175,
    research: { maker: 'Trimurti Industries', product: 'Handy chopper 450 ml', wholesale: 42, moq: 216, dispatch: '3-4 days', amazon: '₹199', flipkart: '₹179', recommended: 199 },
  },
  {
    id: 'mensacc', name: "Men's Accessories", nameHi: 'पुरुषों की एक्सेसरीज़', priceAdv: 34, priceAdvNote: '₹58/order · 8% RTO',
    headroom: 75, headroomNote: '5.69% CAGR · no cert needed', share: 92, shareNote: '22% of fashion', rtoPct: 0.08,
    research: { maker: 'Livya International', product: 'PU leather wallet', wholesale: 65, moq: 100, dispatch: '8-9 days', amazon: '₹189', flipkart: '₹169', recommended: 199 },
  },
  {
    id: 'fitness', name: 'Fitness', nameHi: 'फिटनेस', priceAdv: 38, priceAdvNote: '₹66/order · 21.5% RTO',
    headroom: 74, headroomNote: '5.4% CAGR · no cert needed', share: 35, shareNote: '~8% overall (proxy)', rtoPct: 0.215,
    research: { maker: 'Rishb Enterprises', product: 'Tummy trimmer (double spring)', wholesale: 75, moq: 50, dispatch: '3-4 days', amazon: '₹249', flipkart: '₹225', recommended: 249 },
  },
  {
    id: 'personal', name: 'Personal Care', nameHi: 'पर्सनल केयर', priceAdv: 26, priceAdvNote: '₹44/order · 10% RTO',
    headroom: 22, headroomNote: '5.08% CAGR · licence needed', share: 38, shareNote: '9% of beauty & personal care', rtoPct: 0.10,
    research: { maker: 'Kwality Cosmetics', product: 'Matte liquid lipstick 5 ml', wholesale: 33, moq: 500, dispatch: '5-6 days', amazon: '₹129', flipkart: '₹146', recommended: 149 },
  },
];

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

/** Cohorts from deck slide 3 (03 Cohort-wise barrier identification) and which prototype removes each barrier. */
export type ModuleKey = 'card' | 'contract' | 'runway' | 'safetynet' | 'none';
export interface Barrier { title: string; line: string; gate: 'onboarding' | 'scaleup'; solvedBy: ModuleKey[]; }
export interface Cohort { id: 'offline' | 'hybrid' | 'churned'; name: string; pilotRole: string; barriers: Barrier[]; }

export const COHORTS: Cohort[] = [
  {
    id: 'offline', name: 'Offline-only B2B manufacturers', pilotRole: 'Primary focus',
    barriers: [
      { gate: 'onboarding', title: 'Cataloguing friction', line: 'No one on the floor can stop production to shoot and write listings.', solvedBy: ['card'] },
      { gate: 'onboarding', title: 'Tax anxiety', line: 'A platform listing leaves a digital footprint that exposes compliance gaps.', solvedBy: ['none'] },
      { gate: 'scaleup', title: 'Different cash-flow structure', line: 'Distributors advance raw-material cash; 7-day payouts cannot replace that credit.', solvedBy: ['contract', 'runway'] },
      { gate: 'scaleup', title: 'Single-product packaging', line: 'Bulk cartons into courier bags needs new labour and space.', solvedBy: ['contract'] },
    ],
  },
  {
    id: 'hybrid', name: 'Offline B2B + online B2C manufacturers', pilotRole: 'Tertiary focus',
    barriers: [
      { gate: 'onboarding', title: 'Margin compression', line: "Meesho's price ceiling strips branding and premium packaging.", solvedBy: ['card'] },
      { gate: 'onboarding', title: 'Channel conflict', line: 'A ₹599 kurti on Myntra beside a ₹249 look-alike on Meesho.', solvedBy: ['none'] },
      { gate: 'scaleup', title: 'The ad-spend trap', line: '0% commission, but paid ads become the real fulfilment cost.', solvedBy: ['runway'] },
      { gate: 'scaleup', title: 'Unique logistics structure', line: 'Valmo delay and rating worries stop them committing inventory.', solvedBy: ['contract'] },
    ],
  },
  {
    id: 'churned', name: 'Previously churned manufacturers', pilotRole: 'Secondary focus',
    barriers: [
      { gate: 'onboarding', title: 'Past C2M ordeals', line: 'Logistics and return losses left distrust; it is a proof-of-protection problem.', solvedBy: ['safetynet'] },
      { gate: 'onboarding', title: 'Catalogue fatigue', line: 'Cheaper clones killed the original after hours of cataloguing.', solvedBy: ['card'] },
      { gate: 'scaleup', title: 'Ordeals with RTO and fraud', line: 'COD rejection, damaged returns and switch fraud.', solvedBy: ['safetynet'] },
      { gate: 'scaleup', title: 'Cheaper copycat wins', line: 'Visual search lets rivals copy a winner in weeks.', solvedBy: ['none'] },
    ],
  },
];
