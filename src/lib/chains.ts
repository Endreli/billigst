/** Maps Kassal API store codes (e.g. "SPAR_NO") to display names */
const CODE_MAP: Record<string, string> = {
  REMA_NO: "Rema 1000",
  KIWI_NO: "Kiwi",
  MENY_NO: "Meny",
  SPAR_NO: "Spar",
  JOKER_NO: "Joker",
  ODA_NO: "Oda",
  BUNNPRIS_NO: "Bunnpris",
  COOP_NO: "Coop",
  EUROPRIS_NO: "Europris",
  HAVARISTEN_NO: "Havaristen",
  ENGROS_NO: "Engrosnett",
};

const CHAIN_PATTERNS: [RegExp, string][] = [
  [/^rema\s*1000/i, "Rema 1000"],
  [/^coop\s+extra/i, "Coop Extra"],
  [/^coop\s+mega/i, "Coop Mega"],
  [/^coop\s+obs/i, "Coop Obs"],
  [/^coop\s+prix/i, "Coop Prix"],
  [/^coop\b/i, "Coop"],
  [/^kiwi/i, "Kiwi"],
  [/^meny/i, "Meny"],
  [/^spar\b/i, "Spar"],
  [/^joker/i, "Joker"],
  [/^oda\b/i, "Oda"],
  [/^bunnpris/i, "Bunnpris"],
  [/^havaristen/i, "Havaristen"],
  [/^europris/i, "Europris"],
  [/^engros/i, "Engrosnett"],
];

export function normalizeChain(storeName: string): string {
  const trimmed = storeName.trim();

  // Check code map first (for bulk API store codes like "SPAR_NO")
  const fromCode = CODE_MAP[trimmed];
  if (fromCode) return fromCode;

  // Then check name patterns
  for (const [pattern, chain] of CHAIN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return chain;
    }
  }
  return trimmed;
}
