// Factory-facing screens (Opportunity Card, Health Card) speak English or Hindi.
export type Lang = 'en' | 'hi';

const S = {
  preparedFor: { en: 'Prepared for', hi: 'इनके लिए तैयार' },
  yourSignals: { en: 'Your demand signals', hi: 'आपके लिए मांग के संकेत' },
  updated: { en: 'Updated just now', hi: 'अभी अपडेट हुआ' },
  earnings: { en: 'Earnings multiplier', hi: 'कमाई का गुणक' },
  earningsD: { en: (b2b: string, mee: string) => `Your B2B ${b2b}/mo → on Meesho ${mee}/mo`, hi: (b2b: string, mee: string) => `आपका B2B ${b2b}/माह → मीशो पर ${mee}/माह` },
  matched: { en: 'Orders matched to your factory', hi: 'आपकी फैक्ट्री के लिए ऑर्डर' },
  perWeek: { en: '/ wk', hi: '/ सप्ताह' },
  matchedD: { en: (pct: number, cap: number) => `${pct}% of your ${cap}-unit weekly capacity`, hi: (pct: number, cap: number) => `आपकी ${cap} यूनिट साप्ताहिक क्षमता का ${pct}%` },
  matchedHist: { en: 'From Meesho orders for products like yours', hi: 'आपके जैसे उत्पादों के मीशो ऑर्डर से' },
  proxy: { en: (n: string) => `Estimated from 3 similar products (${n})`, hi: (n: string) => `3 मिलते-जुलते उत्पादों से अनुमान (${n})` },
  local: { en: 'Proof from your area', hi: 'आपके इलाके से सबूत' },
  localD: { en: (cat: string, place: string) => `${cat} makers in ${place} already selling on Meesho`, hi: (cat: string, place: string) => `${place} के ${cat} निर्माता पहले से मीशो पर बेच रहे हैं` },
  localNone: { en: 'No makers nearby yet - you would be the first in your area', hi: 'आस-पास अभी कोई नहीं - आप अपने इलाके में पहले होंगे' },
  confidence: { en: 'Confidence', hi: 'भरोसा' },
  firstBatch: { en: 'First batch plan', hi: 'पहले बैच की योजना' },
  firstBatchD: { en: (lo: number, li: number) => `Expect ${lo}-${li} orders a week at first. We plan on ${lo}.`, hi: (lo: number, li: number) => `शुरू में हर सप्ताह ${lo}-${li} ऑर्डर। योजना ${lo} पर बनेगी।` },
  sendWa: { en: 'Send pitch on WhatsApp', hi: 'व्हाट्सऐप पर भेजें' },
  copy: { en: 'Copy pitch', hi: 'पिच कॉपी करें' },
  copied: { en: 'Copied', hi: 'कॉपी हो गया' },
  // Health card
  health: { en: 'Health Card', hi: 'हेल्थ कार्ड' },
  day: { en: 'Day', hi: 'दिन' },
  onTrack: { en: 'On track', hi: 'सही राह पर' },
  watch: { en: 'Watch', hi: 'ध्यान दें' },
  clearance: { en: 'Clearance', hi: 'क्लियरेंस' },
  graduated: { en: 'Graduated', hi: 'ग्रेजुएट' },
  soldOf: { en: (s: number, u: number) => `${s} of ${u} sold`, hi: (s: number, u: number) => `${u} में से ${s} बिके` },
  promise: { en: 'Promise vs reality', hi: 'वादा बनाम हकीकत' },
  ordersVs: { en: 'Orders vs forecast', hi: 'ऑर्डर बनाम अनुमान' },
  money: { en: 'Money', hi: 'पैसा' },
  advancePaid: { en: 'Advance paid', hi: 'एडवांस मिला' },
  advanceDue: { en: 'Advance due', hi: 'एडवांस आना है' },
  lenderRepaid: { en: 'Lender repaid', hi: 'लेंडर का भुगतान पूरा' },
  lenderOwed: { en: 'Still owed to lender', hi: 'लेंडर को बाकी' },
  journey: { en: 'Journey', hi: 'सफ़र' },
  batchOf: { en: (n: number) => `Graduation: batch ${n} of 3`, hi: (n: number) => `ग्रेजुएशन: 3 में से बैच ${n}` },
  safety: { en: 'RTO Safety Net', hi: 'आरटीओ सेफ्टी नेट' },
  safetyD: { en: 'Returns under the 6% threshold. Pool unused.', hi: 'रिटर्न 6% से कम। पूल का उपयोग नहीं हुआ।' },
  confirmPo: { en: (u: number) => `Confirm PO ${u} units`, hi: (u: number) => `PO की पुष्टि करें: ${u} यूनिट` },
  share: { en: 'Share on WhatsApp', hi: 'व्हाट्सऐप पर शेयर करें' },
} as const;

type Strings = typeof S;
export function t<K extends keyof Strings>(key: K, lang: Lang): Strings[K]['en'] {
  return S[key][lang] as Strings[K]['en'];
}

export function pitchText(lang: Lang, o: { owner: string; factory: string; mult: string; b2b: string; meesho: string; matched: number; product: string; local: number; place: string; lo: number; li: number }): string {
  if (lang === 'hi') {
    return [
      `नमस्ते ${o.owner} जी,`,
      `${o.factory} के लिए मीशो का अवसर:`,
      `1) कमाई: आपके B2B ${o.b2b}/माह के मुकाबले मीशो पर लगभग ${o.meesho}/माह - ${o.mult} गुना।`,
      `2) मांग: ${o.product} के लिए हर सप्ताह ~${o.matched} ऑर्डर आपकी क्षमता के हिसाब से।`,
      o.local > 0 ? `3) सबूत: ${o.place} के ${o.local} निर्माता पहले से मीशो पर बेच रहे हैं।` : '3) आप अपने इलाके के पहले निर्माता होंगे।',
      `पहला बैच छोटा: हर सप्ताह ${o.lo}-${o.li} ऑर्डर, आपका अपना B2B रेट, और 48 घंटे में 60% एडवांस।`,
      '- आपका मीशो STAR',
    ].join('\n');
  }
  return [
    `Namaste ${o.owner} ji,`,
    `Meesho opportunity for ${o.factory}:`,
    `1) Earnings: about ${o.meesho}/month on Meesho vs your B2B ${o.b2b}/month - ${o.mult}.`,
    `2) Demand: ~${o.matched} orders a week for ${o.product}, matched to your capacity.`,
    o.local > 0 ? `3) Proof: ${o.local} makers in ${o.place} already sell on Meesho.` : '3) You would be the first maker in your area.',
    `First batch stays small: ${o.lo}-${o.li} orders a week, your own B2B rate, and 60% paid upfront within 48 h of reaching the hub.`,
    '- Your Meesho STAR',
  ].join('\n');
}
