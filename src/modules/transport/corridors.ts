/**
 * Benue State Agricultural Transport Corridors & Flat Freight Rate Framework.
 * Calibrated for agricultural produce haulage between key farming LGAs and central grain/yam markets.
 */

export interface TransportCorridor {
  code: string;
  name: string;
  originHub: string;
  destinationHub: string;
  distanceKm: number;
  baseRateNgn: number;
  ratePerKgNgn: number;
  description: string;
}

export const BENUE_TRANSPORT_CORRIDORS: readonly TransportCorridor[] = [
  {
    code: "gboko-makurdi",
    name: "Gboko ⇄ Makurdi",
    originHub: "Gboko",
    destinationHub: "Makurdi",
    distanceKm: 85,
    baseRateNgn: 25000,
    ratePerKgNgn: 15,
    description: "Major arterial connecting southern Benue farm clusters to the state capital grain depots.",
  },
  {
    code: "makurdi-otukpo",
    name: "Makurdi ⇄ Otukpo",
    originHub: "Makurdi",
    destinationHub: "Otukpo",
    distanceKm: 100,
    baseRateNgn: 30000,
    ratePerKgNgn: 18,
    description: "Central corridor connecting North-Bank produce to Idoma-land distribution hubs.",
  },
  {
    code: "zaki-biam-gboko",
    name: "Zaki Biam ⇄ Gboko",
    originHub: "Ukum (Zaki Biam)",
    destinationHub: "Gboko",
    distanceKm: 95,
    baseRateNgn: 28000,
    ratePerKgNgn: 16,
    description: "Primary yam corridor from the international Zaki Biam Yam Market to Gboko processing.",
  },
  {
    code: "katsina-ala-makurdi",
    name: "Katsina-Ala ⇄ Makurdi",
    originHub: "Katsina-Ala",
    destinationHub: "Makurdi",
    distanceKm: 120,
    baseRateNgn: 35000,
    ratePerKgNgn: 20,
    description: "Soya bean, rice, and yam corridor from eastern Benue riverine farming communities.",
  },
  {
    code: "vandeikya-gboko",
    name: "Vandeikya ⇄ Gboko",
    originHub: "Vandeikya",
    destinationHub: "Gboko",
    distanceKm: 75,
    baseRateNgn: 22000,
    ratePerKgNgn: 14,
    description: "Citrus, cassava, and sweet potato corridor from the southern agricultural belt.",
  },
  {
    code: "otukpo-gboko",
    name: "Otukpo ⇄ Gboko",
    originHub: "Otukpo",
    destinationHub: "Gboko",
    distanceKm: 130,
    baseRateNgn: 38000,
    ratePerKgNgn: 22,
    description: "Cross-regional trade corridor linking Idoma and Tiv agricultural centers.",
  },
  {
    code: "intra-lga",
    name: "Intra-LGA Farm-gate Collection",
    originHub: "Local Farm",
    destinationHub: "LGA Central Market",
    distanceKm: 30,
    baseRateNgn: 15000,
    ratePerKgNgn: 10,
    description: "Short-haul rural access route from farm gate to local cooperative or aggregation center.",
  },
] as const;

export const VEHICLE_CAPACITIES_KG: Record<string, number> = {
  MOTORCYCLE: 200,
  TRICYCLE: 600,
  PICKUP_VAN: 1500,
  LIGHT_TRUCK: 3500,
  MEDIUM_TRUCK: 7000,
  HEAVY_TRUCK: 15000,
  ARTICULATED_LORRY: 30000,
};

export function findCorridorByLgas(
  originLga?: string | null,
  destinationLocation?: string | null,
): TransportCorridor {
  const origin = (originLga || "").toLowerCase();
  const dest = (destinationLocation || "").toLowerCase();

  for (const corridor of BENUE_TRANSPORT_CORRIDORS) {
    const oHub = corridor.originHub.toLowerCase();
    const dHub = corridor.destinationHub.toLowerCase();

    if (
      (origin.includes(oHub) && dest.includes(dHub)) ||
      (origin.includes(dHub) && dest.includes(oHub))
    ) {
      return corridor;
    }
  }

  // Fallback to intra-lga or default corridor
  if (origin && dest && origin === dest) {
    return BENUE_TRANSPORT_CORRIDORS.find((c) => c.code === "intra-lga")!;
  }

  return BENUE_TRANSPORT_CORRIDORS[0]!; // Gboko-Makurdi default
}

export function calculateCorridorFreightFee(
  corridor: TransportCorridor,
  weightKg: number,
): number {
  // Flat corridor base fee covers the first 500 kg; additional weight scales by ratePerKg
  const chargeableWeight = Math.max(0, weightKg - 500);
  const incrementalFee = Math.round(chargeableWeight * corridor.ratePerKgNgn);
  return corridor.baseRateNgn + incrementalFee;
}

