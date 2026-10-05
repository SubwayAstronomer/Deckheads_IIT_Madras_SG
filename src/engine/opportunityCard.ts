// OPPORTUNITY CARD (deck slide 6, left half)
// A Meesho STAR captures four inputs at the factory gate - product, B2B price, weekly capacity,
// pincode - and the card computes three proof points named for that factory:
//   1. Earnings multiplier  - top-maker earnings on Meesho, scaled to this factory, vs its own B2B run-rate
//   2. Factory-matched demand - weekly orders for products like this, capped at 80% of capacity
//   3. Local proof          - makers already selling from the same pincode / district / region
// If the product has never sold on Meesho, demand is borrowed from its k = 3 nearest listed
// look-alikes (inverse-distance weighted), and the card says so with a confidence tag.

import { PRODUCTS, productById, localProof, type Product, type LocalProof } from '../data/products';
import { categoryById, type Category } from '../data/categories';
import { clamp } from './util';

export const WEEKS_PER_MONTH = 4.33;
/** Share of capacity a typical B2B maker actually sells (from our 15 manufacturer calls: ~half the line idles). */
export const B2B_UTILISATION = 0.5;
/** Never promise more than 80% of what the factory can make. */
export const CAPACITY_CAP = 0.8;
/** A new catalogue wins about one-eighth of matched demand in its first month (the "weak early scale-up" problem). */
export const NEW_LISTING_SHARE = 0.125;
export const K_NEIGHBOURS = 3;

export type Confidence = 'High' | 'Medium' | 'Low';

export interface CardInputs {
  ownerName: string;
  factoryName: string;
  productId: string;
  b2bPrice: number;
  weeklyCapacity: number;
  pincode: string;
}

export interface Neighbour { product: Product; distance: number; weight: number; }

export interface CardResult {
  inputs: CardInputs;
  product: Product;
  category: Category;
  earnings: { meeshoMonthly: number; b2bMonthly: number; multiplier: number; topMakerMonthly: number; scale: number };
  demand: {
    source: 'history' | 'proxy';
    signalPerWeek: number;
    matchedPerWeek: number;
    cappedByCapacity: boolean;
    confidence: Confidence;
    neighbours: Neighbour[];
    /** Low-to-likely band for the first batch, orders per week. The PO is sized on the LOW end. */
    batchBand: { low: number; likely: number };
  };
  local: LocalProof;
  listingPrice: number;
}

export function distance(a: readonly number[], b: readonly number[]): number {
  return Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0));
}

/** k nearest products that already have Meesho sales history. */
export function nearestListed(target: Product, k = K_NEIGHBOURS): Neighbour[] {
  const ranked = PRODUCTS.filter((p) => p.hasHistory && p.id !== target.id)
    .map((p) => ({ product: p, distance: distance(p.signals, target.signals), weight: 0 }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
  const inv = ranked.map((n) => 1 / Math.max(n.distance, 0.05));
  const total = inv.reduce((s, x) => s + x, 0);
  return ranked.map((n, i) => ({ ...n, weight: inv[i] / total }));
}

function proxyConfidence(nbrs: Neighbour[]): Confidence {
  const meanDist = nbrs.reduce((s, n) => s + n.distance, 0) / nbrs.length;
  const demands = nbrs.map((n) => n.product.weeklyDemand);
  const spread = Math.max(...demands) / Math.max(1, Math.min(...demands));
  return meanDist <= 1.7 && spread <= 4 ? 'Medium' : 'Low';
}

const LOW_END: Record<Confidence, number> = { High: 0.7, Medium: 0.55, Low: 0.4 };

export function computeCard(inputs: CardInputs): CardResult {
  const product = productById(inputs.productId);
  const category = categoryById(product.category);
  const cap = Math.max(1, inputs.weeklyCapacity);

  let signal = product.weeklyDemand;
  let topMonthly = product.topMakerMonthly;
  let topCap = product.topMakerCapacity;
  let neighbours: Neighbour[] = [];
  let confidence: Confidence = 'High';
  let source: 'history' | 'proxy' = 'history';

  if (!product.hasHistory) {
    source = 'proxy';
    neighbours = nearestListed(product);
    const w = (f: (p: Product) => number) => neighbours.reduce((s, n) => s + n.weight * f(n.product), 0);
    signal = w((p) => p.weeklyDemand);
    topMonthly = w((p) => p.topMakerMonthly);
    topCap = w((p) => p.topMakerCapacity);
    confidence = proxyConfidence(neighbours);
  }

  const matched = Math.min(signal, CAPACITY_CAP * cap);
  const scale = clamp(cap / topCap, 0.5, 1.5);
  const meeshoMonthly = topMonthly * scale;
  const b2bMonthly = inputs.b2bPrice * cap * WEEKS_PER_MONTH * B2B_UTILISATION;
  const likely = Math.round(matched * NEW_LISTING_SHARE);

  return {
    inputs,
    product,
    category,
    earnings: { meeshoMonthly, b2bMonthly, multiplier: meeshoMonthly / Math.max(1, b2bMonthly), topMakerMonthly: topMonthly, scale },
    demand: {
      source,
      signalPerWeek: Math.round(signal),
      matchedPerWeek: Math.round(matched),
      cappedByCapacity: signal > CAPACITY_CAP * cap,
      confidence,
      neighbours,
      batchBand: { low: Math.round(likely * LOW_END[confidence]), likely },
    },
    local: localProof(inputs.pincode, product.category),
    listingPrice: product.listingPrice,
  };
}

/** The deck's worked example (slides 6-8). */
export const HERO_INPUTS: CardInputs = {
  ownerName: 'R Patel',
  factoryName: 'Shree Balaji Kurtis',
  productId: 'kurti',
  b2bPrice: 260,
  weeklyCapacity: 500,
  pincode: '395003',
};
