export interface CropVisualItem {
  code: string;
  name: string;
  localPath: string;
  remoteFallback: string;
  svgFallback: string;
  isPerishable: boolean;
  category: string;
  harvestSeason: string;
}

export const CROP_VISUALS: readonly CropVisualItem[] = [
  {
    code: "yam",
    name: "White Yam (Zaki-Biam)",
    localPath: "/images/crops/yam.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/yam.svg",
    isPerishable: false,
    category: "Tuber",
    harvestSeason: "Aug – Dec",
  },
  {
    code: "soybeans",
    name: "Soybeans (Clean Grain)",
    localPath: "/images/crops/soybeans.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/soybeans.svg",
    isPerishable: false,
    category: "Grain / Legume",
    harvestSeason: "Oct – Jan",
  },
  {
    code: "tomatoes",
    name: "Fresh Roma Tomatoes",
    localPath: "/images/crops/tomatoes.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/tomatoes.svg",
    isPerishable: true,
    category: "Horticulture",
    harvestSeason: "Nov – Apr",
  },
  {
    code: "pepper",
    name: "Red Habanero (Atarodo)",
    localPath: "/images/crops/pepper.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/pepper.svg",
    isPerishable: true,
    category: "Horticulture",
    harvestSeason: "All Year",
  },
  {
    code: "maize",
    name: "Yellow Flint Maize",
    localPath: "/images/crops/maize.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/maize.svg",
    isPerishable: false,
    category: "Grain / Cereal",
    harvestSeason: "Jul – Nov",
  },
  {
    code: "rice",
    name: "Milled & Paddy Rice",
    localPath: "/images/crops/rice.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/rice.svg",
    isPerishable: false,
    category: "Grain",
    harvestSeason: "Sep – Jan",
  },
  {
    code: "cassava",
    name: "Cassava & Garri",
    localPath: "/images/crops/cassava.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/cassava.svg",
    isPerishable: true,
    category: "Root Tuber",
    harvestSeason: "All Year",
  },
  {
    code: "cashew",
    name: "Raw Cashew Nuts",
    localPath: "/images/crops/cashew.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/cashew.svg",
    isPerishable: false,
    category: "Tree Crop",
    harvestSeason: "Feb – May",
  },
  {
    code: "mangoes",
    name: "Benue Orchard Mangoes",
    localPath: "/images/crops/mangoes.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/mangoes.svg",
    isPerishable: true,
    category: "Tree Crop",
    harvestSeason: "Mar – Jul",
  },
] as const;

export const HERO_FARMER_IMAGE = {
  localPath: "/images/hero/farmer-hero.jpg",
  remoteFallback: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
  svgFallback: "/images/hero/farmer-hero.svg",
  alt: "Benue State agricultural grower harvesting fresh produce",
};

export function getCropVisual(code?: string): CropVisualItem {
  if (code) {
    const normalized = code.toLowerCase().trim();
    const found = CROP_VISUALS.find(
      (c) => c.code === normalized || normalized.includes(c.code) || c.name.toLowerCase().includes(normalized),
    );
    if (found) {
      return found;
    }
  }

  const first = CROP_VISUALS[0];
  if (first) {
    return first;
  }

  return {
    code: "yam",
    name: "White Yam (Zaki-Biam)",
    localPath: "/images/crops/yam.jpg",
    remoteFallback: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
    svgFallback: "/images/crops/yam.svg",
    isPerishable: false,
    category: "Tuber",
    harvestSeason: "Aug – Dec",
  };
}
