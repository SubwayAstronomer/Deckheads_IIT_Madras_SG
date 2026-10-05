// Small shared helpers: Indian-rupee formatting, rounding, and a seeded RNG
// so every simulation is reproducible (same seed -> same cohort, same chart).

/** Indian digit grouping: 1560000 -> "15,60,000". */
export function groupIN(n: number): string {
  const neg = n < 0;
  const s = Math.round(Math.abs(n)).toString();
  if (s.length <= 3) return (neg ? '-' : '') + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (neg ? '-' : '') + rest + ',' + last3;
}

/** Rupees with Indian grouping: 15600 -> "₹15,600". */
export function inr(n: number): string {
  return (n < 0 ? '−₹' : '₹') + groupIN(Math.abs(n));
}

/** Compact rupees: 281450 -> "₹2.8 L", 44507e7 -> "₹44,507 Cr". */
export function inrCompact(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a >= 1e7) return `${sign}₹${groupIN(a / 1e7)} Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(1)} L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(1)}k`;
  return `${sign}₹${Math.round(a)}`;
}

export const pct = (x: number, dp = 0) => `${(x * 100).toFixed(dp)}%`;
export const round = (x: number, dp = 0) => Math.round(x * 10 ** dp) / 10 ** dp;
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Mulberry32 - tiny deterministic PRNG. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    /** Standard normal via Box-Muller. */
    normal: () => {
      const u = Math.max(next(), 1e-9);
      const v = next();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: <T,>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)],
    chance: (p: number) => next() < p,
  };
}
export type Rng = ReturnType<typeof rng>;
