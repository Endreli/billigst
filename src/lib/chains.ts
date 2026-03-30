const CHAIN_PATTERNS: [RegExp, string][] = [
  [/^rema\s*1000/i, "Rema 1000"],
  [/^coop\s+extra/i, "Coop Extra"],
  [/^coop\s+mega/i, "Coop Mega"],
  [/^coop\s+obs/i, "Coop Obs"],
  [/^coop\s+prix/i, "Coop Prix"],
  [/^kiwi/i, "Kiwi"],
  [/^meny/i, "Meny"],
  [/^spar\b/i, "Spar"],
  [/^joker/i, "Joker"],
  [/^oda\b/i, "Oda"],
  [/^bunnpris/i, "Bunnpris"],
  [/^havaristen/i, "Havaristen"],
];

export function normalizeChain(storeName: string): string {
  for (const [pattern, chain] of CHAIN_PATTERNS) {
    if (pattern.test(storeName.trim())) {
      return chain;
    }
  }
  return storeName.trim();
}
