/**
 * Norwegian toll zones (bomringer/bomprosjekter) with approximate locations and costs.
 * Prices are estimates for light vehicles (lett bil) with AutoPASS, outside rush hour.
 * Last updated: April 2026.
 *
 * Sources: ferde.no, fjellinjen.no, vegamot.no, vegfinans.no, bpsnord.no
 */

export interface TollZone {
  name: string;
  lat: number;
  lng: number;
  /** Radius in km — area where the toll ring applies */
  radius: number;
  /** Typical one-way cost in NOK for light vehicle with AutoPASS */
  cost: number;
  /** Type: 'ring' = city ring toll, 'point' = single road toll */
  type: "ring" | "point";
}

export const TOLL_ZONES: TollZone[] = [
  // === City toll rings (bypakker) ===
  // Oslo — 3 rings: Osloringen, Indre ring, Bygrensen
  { name: "Oslo", lat: 59.9139, lng: 10.7522, radius: 15, cost: 38, type: "ring" },
  // Bergen
  { name: "Bergen", lat: 60.3913, lng: 5.3221, radius: 12, cost: 33, type: "ring" },
  // Nord-Jæren (Stavanger/Sandnes)
  { name: "Nord-Jæren", lat: 58.9700, lng: 5.7331, radius: 14, cost: 30, type: "ring" },
  // Trondheim
  { name: "Trondheim", lat: 63.4305, lng: 10.3951, radius: 12, cost: 28, type: "ring" },
  // Kristiansand
  { name: "Kristiansand", lat: 58.1599, lng: 8.0182, radius: 10, cost: 25, type: "ring" },
  // Tromsø (Tenk Tromsø)
  { name: "Tromsø", lat: 69.6496, lng: 18.9560, radius: 10, cost: 22, type: "ring" },
  // Ålesund
  { name: "Ålesund", lat: 62.4722, lng: 6.1495, radius: 10, cost: 20, type: "ring" },
  // Kristiansund (from May 2026)
  { name: "Kristiansund", lat: 63.1103, lng: 7.7281, radius: 8, cost: 18, type: "ring" },
  // Haugesund/Karmøy (from 2026)
  { name: "Haugesund", lat: 59.4138, lng: 5.2680, radius: 10, cost: 22, type: "ring" },
  // Tønsberg-regionen (from 2026)
  { name: "Tønsberg", lat: 59.2676, lng: 10.4076, radius: 10, cost: 20, type: "ring" },
  // Drammen/Buskerudbyen
  { name: "Drammen", lat: 59.7441, lng: 10.2045, radius: 10, cost: 22, type: "ring" },
  // Grenland (Porsgrunn/Skien)
  { name: "Grenland", lat: 59.1400, lng: 9.6569, radius: 10, cost: 18, type: "ring" },
  // Nedre Glomma (Fredrikstad/Sarpsborg)
  { name: "Nedre Glomma", lat: 59.2181, lng: 10.9298, radius: 12, cost: 18, type: "ring" },
  // Førde
  { name: "Førde", lat: 61.4520, lng: 5.8575, radius: 6, cost: 14, type: "ring" },
  // Askøy
  { name: "Askøy", lat: 60.4714, lng: 5.1506, radius: 6, cost: 20, type: "ring" },
  // Nordhordland
  { name: "Nordhordland", lat: 60.5890, lng: 5.2830, radius: 10, cost: 22, type: "ring" },

  // === Point tolls (enkeltprosjekter) ===
  // E16 Bjørum-Skaret (Bærum/Hole)
  { name: "E16 Bjørum-Skaret", lat: 59.9530, lng: 10.4110, radius: 5, cost: 26, type: "point" },
  // Ryfast (Stavanger-Strand)
  { name: "Ryfast", lat: 59.0300, lng: 5.9800, radius: 5, cost: 48, type: "point" },
  // E39 Rogfast (under construction, will be expensive)
  { name: "Rogfast", lat: 59.1800, lng: 5.5300, radius: 5, cost: 60, type: "point" },
  // Hardangerbrua
  { name: "Hardangerbrua", lat: 60.4760, lng: 6.8300, radius: 4, cost: 48, type: "point" },
  // E39 Svegatjørn-Rådal (Os-Bergen)
  { name: "E39 Svegatjørn-Rådal", lat: 60.2800, lng: 5.4500, radius: 5, cost: 28, type: "point" },
  // E39 Kristiansand-Lyngdal
  { name: "E39 Kristiansand-Lyngdal", lat: 58.1700, lng: 7.3000, radius: 8, cost: 40, type: "point" },
  // E18 Tvedestrand-Arendal
  { name: "E18 Tvedestrand-Arendal", lat: 58.6100, lng: 8.7700, radius: 6, cost: 30, type: "point" },
  // Bømlopakken
  { name: "Bømlopakken", lat: 59.7700, lng: 5.2100, radius: 6, cost: 28, type: "point" },
  // Haugalandspakken
  { name: "Haugalandspakken", lat: 59.4800, lng: 5.3500, radius: 8, cost: 18, type: "point" },
  // Kvammapakken
  { name: "Kvammapakken", lat: 60.3800, lng: 6.2700, radius: 5, cost: 24, type: "point" },
  // E6 Ranheim-Åsen (Trondheim nord)
  { name: "E6 Ranheim-Åsen", lat: 63.5200, lng: 10.7500, radius: 8, cost: 24, type: "point" },
  // E39 Lønset-Hjelset (Molde)
  { name: "E39 Lønset-Hjelset", lat: 62.7400, lng: 7.1600, radius: 5, cost: 20, type: "point" },
  // Nordøyvegen (Ålesund)
  { name: "Nordøyvegen", lat: 62.5600, lng: 6.0300, radius: 5, cost: 46, type: "point" },
  // Fv.17 Dyrstad-Sprova-Malm (Steinkjer)
  { name: "Fv17 Steinkjer", lat: 64.0100, lng: 11.4900, radius: 6, cost: 24, type: "point" },
  // Kvinnheradpakken
  { name: "Kvinnheradpakken", lat: 59.8800, lng: 5.9700, radius: 5, cost: 28, type: "point" },
];
