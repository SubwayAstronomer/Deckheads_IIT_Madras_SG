// Simulated product catalogue for the Opportunity Card.
// "hasHistory" products already sell on Meesho; the others are new to the platform, so
// the card borrows demand from their nearest listed look-alikes (kNN, k = 3).
//
// The five similarity signals match deck slide 6: bought together, customer profile,
// search co-occurrence, seasonality, geography. Each is a 0-10 score here; in production
// they would be learned embeddings. ALL NUMBERS ARE SIMULATED for the prototype.

import type { CategoryId } from './categories';

export interface Product {
  id: string;
  name: string;
  nameHi: string;
  category: CategoryId;
  hasHistory: boolean;
  /** Weekly Meesho orders for products like this, per active maker (the "matched demand" signal). */
  weeklyDemand: number;
  /** Average monthly Meesho earnings of the top makers of this product. */
  topMakerMonthly: number;
  /** Weekly capacity of those top makers (used to scale their earnings to this factory). */
  topMakerCapacity: number;
  /** Typical Meesho selling price of the product. */
  listingPrice: number;
  /** Median price of the 20 closest rival listings (used for the "price in line" check). */
  rivalMedian: number;
  /** [boughtTogether, customerProfile, searchCo, seasonality, geography], 0-10 each. */
  signals: [number, number, number, number, number];
}

export const SIGNAL_NAMES = ['Bought together', 'Customer profile', 'Search co-occurrence', 'Seasonality', 'Geography'] as const;

export const PRODUCTS: Product[] = [
  // ---- Women's fashion (Surat cluster) ----
  { id: 'kurti', name: 'Kurtis', nameHi: 'कुर्ती', category: 'womens', hasHistory: true, weeklyDemand: 460, topMakerMonthly: 450000, topMakerCapacity: 430, listingPrice: 439, rivalMedian: 449, signals: [2.0, 8.0, 2.5, 6.0, 7.0] },
  { id: 'saree', name: 'Sarees', nameHi: 'साड़ी', category: 'womens', hasHistory: true, weeklyDemand: 380, topMakerMonthly: 400000, topMakerCapacity: 400, listingPrice: 499, rivalMedian: 489, signals: [2.6, 8.4, 3.0, 7.2, 7.4] },
  { id: 'dupatta', name: 'Dupattas', nameHi: 'दुपट्टा', category: 'womens', hasHistory: true, weeklyDemand: 300, topMakerMonthly: 220000, topMakerCapacity: 600, listingPrice: 249, rivalMedian: 259, signals: [1.4, 7.5, 2.0, 5.6, 6.6] },
  { id: 'gown', name: 'Cotton gowns / maxi', nameHi: 'कॉटन गाउन', category: 'womens', hasHistory: true, weeklyDemand: 350, topMakerMonthly: 360000, topMakerCapacity: 400, listingPrice: 399, rivalMedian: 385, signals: [2.4, 7.4, 3.0, 6.6, 6.0] },
  { id: 'coord', name: 'Block-print co-ord set (new)', nameHi: 'ब्लॉक-प्रिंट को-ऑर्ड सेट (नया)', category: 'womens', hasHistory: false, weeklyDemand: 0, topMakerMonthly: 0, topMakerCapacity: 0, listingPrice: 549, rivalMedian: 529, signals: [2.2, 7.8, 2.8, 6.4, 6.6] },
  // ---- Footwear (Agra cluster) ----
  { id: 'sandals', name: 'Ladies sandals', nameHi: 'लेडीज़ सैंडल', category: 'footwear', hasHistory: true, weeklyDemand: 260, topMakerMonthly: 390000, topMakerCapacity: 300, listingPrice: 499, rivalMedian: 499, signals: [4.0, 6.2, 4.0, 5.0, 5.0] },
  { id: 'slippers', name: "Men's slippers", nameHi: 'पुरुषों की चप्पल', category: 'footwear', hasHistory: true, weeklyDemand: 330, topMakerMonthly: 280000, topMakerCapacity: 500, listingPrice: 249, rivalMedian: 239, signals: [4.6, 4.2, 4.6, 4.4, 5.2] },
  { id: 'schoolshoes', name: 'Kids school shoes (new)', nameHi: 'बच्चों के स्कूल जूते (नया)', category: 'footwear', hasHistory: false, weeklyDemand: 0, topMakerMonthly: 0, topMakerCapacity: 0, listingPrice: 399, rivalMedian: 419, signals: [4.2, 5.6, 4.2, 6.4, 4.4] },
  // ---- Men's fashion / kids (Tiruppur cluster) ----
  { id: 'tee', name: "Men's round-neck T-shirts", nameHi: 'पुरुषों की टी-शर्ट', category: 'mens', hasHistory: true, weeklyDemand: 420, topMakerMonthly: 320000, topMakerCapacity: 500, listingPrice: 349, rivalMedian: 349, signals: [3.2, 4.4, 3.4, 4.0, 3.6] },
  { id: 'kidsset', name: 'Kids 2-piece sets', nameHi: 'बच्चों का 2-पीस सेट', category: 'kids', hasHistory: true, weeklyDemand: 520, topMakerMonthly: 300000, topMakerCapacity: 600, listingPrice: 299, rivalMedian: 285, signals: [4.0, 5.6, 4.0, 6.6, 3.8] },
  // ---- Jewellery / accessories ----
  { id: 'pendant', name: 'Pendant necklaces', nameHi: 'पेंडेंट नेकलेस', category: 'jewellery', hasHistory: true, weeklyDemand: 380, topMakerMonthly: 160000, topMakerCapacity: 800, listingPrice: 199, rivalMedian: 209, signals: [1.0, 8.6, 1.6, 4.0, 6.0] },
  { id: 'wallet', name: 'PU leather wallets', nameHi: 'पर्स / वॉलेट', category: 'mensacc', hasHistory: true, weeklyDemand: 200, topMakerMonthly: 90000, topMakerCapacity: 400, listingPrice: 199, rivalMedian: 179, signals: [7.6, 3.6, 7.4, 3.0, 3.0] },
  { id: 'watch', name: 'Analog watches', nameHi: 'घड़ी', category: 'mensacc', hasHistory: true, weeklyDemand: 210, topMakerMonthly: 150000, topMakerCapacity: 500, listingPrice: 399, rivalMedian: 399, signals: [8.4, 3.0, 8.4, 2.6, 2.6] },
  { id: 'sunglasses', name: 'Sunglasses', nameHi: 'धूप का चश्मा', category: 'mensacc', hasHistory: true, weeklyDemand: 180, topMakerMonthly: 80000, topMakerCapacity: 600, listingPrice: 249, rivalMedian: 229, signals: [8.0, 3.4, 8.2, 4.8, 2.2] },
  // ---- Home linen / kitchen (Panipat, Delhi NCR, Rajkot) ----
  { id: 'bedsheet', name: 'Cotton bedsheets', nameHi: 'कॉटन बेडशीट', category: 'linen', hasHistory: true, weeklyDemand: 280, topMakerMonthly: 260000, topMakerCapacity: 400, listingPrice: 299, rivalMedian: 289, signals: [6.5, 4.5, 6.6, 3.0, 4.6] },
  { id: 'cushion', name: 'Cushion covers', nameHi: 'कुशन कवर', category: 'linen', hasHistory: true, weeklyDemand: 240, topMakerMonthly: 110000, topMakerCapacity: 600, listingPrice: 199, rivalMedian: 199, signals: [6.0, 4.4, 6.1, 3.0, 4.0] },
  { id: 'mattress', name: 'Foam mattresses', nameHi: 'फोम गद्दा', category: 'linen', hasHistory: true, weeklyDemand: 90, topMakerMonthly: 310000, topMakerCapacity: 120, listingPrice: 1299, rivalMedian: 1249, signals: [6.6, 5.6, 6.4, 3.0, 4.0] },
  { id: 'pillow', name: 'Memory-foam pillow (new)', nameHi: 'मेमोरी-फोम तकिया (नया)', category: 'linen', hasHistory: false, weeklyDemand: 0, topMakerMonthly: 0, topMakerCapacity: 0, listingPrice: 349, rivalMedian: 349, signals: [5.4, 5.7, 6.0, 3.0, 4.5] },
  { id: 'chopper', name: 'Handy choppers', nameHi: 'हैंडी चॉपर', category: 'kitchen', hasHistory: true, weeklyDemand: 300, topMakerMonthly: 140000, topMakerCapacity: 700, listingPrice: 199, rivalMedian: 189, signals: [5.6, 3.0, 5.6, 2.4, 6.6] },
  // ---- Fitness / personal care ----
  { id: 'trimmer', name: 'Tummy trimmers', nameHi: 'टमी ट्रिमर', category: 'fitness', hasHistory: true, weeklyDemand: 150, topMakerMonthly: 90000, topMakerCapacity: 300, listingPrice: 249, rivalMedian: 237, signals: [5.0, 2.6, 5.4, 6.0, 4.2] },
  { id: 'lipstick', name: 'Liquid lipsticks', nameHi: 'लिक्विड लिपस्टिक', category: 'personal', hasHistory: true, weeklyDemand: 400, topMakerMonthly: 120000, topMakerCapacity: 1500, listingPrice: 149, rivalMedian: 139, signals: [1.4, 9.0, 1.8, 4.2, 5.4] },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;

// ---------------------------------------------------------------------------
// Pincodes -> how many makers of each category already sell from there (simulated).
// Fallback order on the card: exact pincode -> district (first 5 digits) -> region (first 3).
export interface PinArea { pin: string; place: string; placeHi: string; makers: Partial<Record<CategoryId, number>>; }

export const PIN_AREAS: PinArea[] = [
  { pin: '395003', place: 'Ring Road, Surat', placeHi: 'रिंग रोड, सूरत', makers: { womens: 12, kids: 3, mens: 2 } },
  { pin: '395002', place: 'Salabatpura, Surat', placeHi: 'सलाबतपुरा, सूरत', makers: { womens: 9, kids: 2 } },
  { pin: '395010', place: 'Udhna, Surat', placeHi: 'उधना, सूरत', makers: { womens: 7, mens: 3 } },
  { pin: '282002', place: 'Hing Ki Mandi, Agra', placeHi: 'हींग की मंडी, आगरा', makers: { footwear: 15 } },
  { pin: '282003', place: 'Agra Cantt, Agra', placeHi: 'आगरा कैंट, आगरा', makers: { footwear: 9 } },
  { pin: '641604', place: 'Tiruppur North', placeHi: 'तिरुप्पुर उत्तर', makers: { kids: 11, mens: 14 } },
  { pin: '641607', place: 'Tiruppur South', placeHi: 'तिरुप्पुर दक्षिण', makers: { kids: 6, mens: 8 } },
  { pin: '110020', place: 'Okhla, New Delhi', placeHi: 'ओखला, नई दिल्ली', makers: { kitchen: 6, mensacc: 4 } },
  { pin: '110041', place: 'Mundka, New Delhi', placeHi: 'मुंडका, नई दिल्ली', makers: { kitchen: 4, fitness: 3 } },
  { pin: '132103', place: 'Panipat', placeHi: 'पानीपत', makers: { linen: 10 } },
  { pin: '302001', place: 'Johari Bazaar, Jaipur', placeHi: 'जौहरी बाज़ार, जयपुर', makers: { jewellery: 8, womens: 5, linen: 4 } },
  { pin: '360002', place: 'Rajkot', placeHi: 'राजकोट', makers: { kitchen: 7 } },
  { pin: '141003', place: 'Ludhiana', placeHi: 'लुधियाना', makers: { mens: 6, kids: 4 } },
  { pin: '400067', place: 'Kandivali, Mumbai', placeHi: 'कांदिवली, मुंबई', makers: { personal: 3, jewellery: 5 } },
];

export interface LocalProof { count: number; level: 'pincode' | 'district' | 'region' | 'none'; place: string; placeHi: string; }

/** Count makers of a category near a pincode, widening the net until something is found. */
export function localProof(pin: string, cat: CategoryId): LocalProof {
  const clean = pin.replace(/\D/g, '');
  const sum = (areas: PinArea[]) => areas.reduce((s, a) => s + (a.makers[cat] ?? 0), 0);
  const exact = PIN_AREAS.filter((a) => a.pin === clean);
  if (clean.length === 6 && sum(exact) > 0) return { count: sum(exact), level: 'pincode', place: exact[0].place, placeHi: exact[0].placeHi };
  const district = PIN_AREAS.filter((a) => clean.length >= 5 && a.pin.startsWith(clean.slice(0, 5)));
  if (sum(district) > 0) {
    const city = district[0].place.split(', ').pop()!;
    const cityHi = district[0].placeHi.split(', ').pop()!;
    return { count: sum(district), level: 'district', place: city, placeHi: cityHi };
  }
  const region = PIN_AREAS.filter((a) => clean.length >= 3 && a.pin.startsWith(clean.slice(0, 3)));
  if (sum(region) > 0) {
    const city = region[0].place.split(', ').pop()!;
    const cityHi = region[0].placeHi.split(', ').pop()!;
    return { count: sum(region), level: 'region', place: `${city} region`, placeHi: `${cityHi} क्षेत्र` };
  }
  return { count: 0, level: 'none', place: 'your area', placeHi: 'आपके क्षेत्र' };
}
