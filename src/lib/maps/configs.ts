/**
 * Map configurations for all supported Arma Reforger maps
 *
 * Data source: GeNeFRAG's ArmaReforger repository
 * https://github.com/GeNeFRAG/ArmaReforger/tree/main/maps_core
 *
 * CDN: pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev
 *
 * All maps are loaded directly from the CDN - no local files needed!
 */

import type { MapConfig, MapId, ArmaMapRaw } from './types'
import { convertRawToMapConfig } from './types'

/**
 * Raw map data from GeNeFRAG's CDN
 * This is a copy of data/maps/all_arma_maps.json for bundling
 */
const RAW_MAP_DATA: ArmaMapRaw[] = [
  {
    name: "Everon",
    namespace: "everon",
    size: [12800, 12800],
    max_zoom: 6, // Using z6 for faster loading (180MB vs 632MB)
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/everon_sat_z6_full.png",
      // Local height data - CDN blocks CORS for JSON fetch
      height_data: "/height_data/everon_height.json"
    }
  },
  {
    name: "Arland",
    namespace: "arland",
    size: [4095, 4095],
    max_zoom: 6,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/arland_sat_z6_full.png",
      // Local height data for faster loading
      height_data: "/height_data/arland_height.json"
    }
  },
  {
    name: "Kolguev",
    namespace: "kolguev",
    size: [12800, 12800],
    max_zoom: 6, // Downgraded from z7 for faster loading (~180MB vs ~600MB)
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/kolguev_sat_z6_full.png",
      // CDN height data (too large for GitHub: 134MB)
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/kolguev_height.json"
    }
  },
  {
    name: "Anizay",
    namespace: "anizay",
    size: [10240, 10240],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/anizay_sat_z6_full.png",
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/anizay_height.json"
    }
  },
  {
    name: "Bad Orb",
    namespace: "badorb",
    size: [5120, 5120],
    max_zoom: 6,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/badorb_sat_z6_full.png"
    }
  },
  {
    name: "Belleau Wood",
    namespace: "belleau",
    size: [12032, 12032],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/belleau_sat_z6_full.png"
    }
  },
  {
    name: "Fallujah",
    namespace: "fallujah",
    size: [4095, 4095],
    max_zoom: 6,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/fallujah_sat_z6_full.png"
    }
  },
  {
    name: "Gogland",
    namespace: "gogland",
    size: [12286, 12286],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/gogland_sat_z6_full.png",
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/gogland_height.json"
    }
  },
  {
    name: "Khanh Trung",
    namespace: "khanh_trung",
    size: [4095, 4095],
    max_zoom: 6,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/khanh_trung_sat_z6_full.png"
    }
  },
  {
    name: "Kunar",
    namespace: "kunar",
    size: [4000, 4000],
    max_zoom: 5,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/kunar_sat_z5_full.png",
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/kunar_height.json"
    }
  },
  {
    name: "Myccano",
    namespace: "myccano",
    size: [6655, 6655],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/myccano_sat_z6_full.png"
    }
  },
  {
    name: "Nizla Island",
    namespace: "nizla",
    size: [17150, 17150],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/nizla_sat_z6_full.png"
    }
  },
  {
    name: "Novka",
    namespace: "novka",
    size: [2900, 2900],
    max_zoom: 5,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/novka_sat_z5_full.png"
    }
  },
  {
    name: "Rooikat 89",
    namespace: "rooikat",
    size: [5120, 5120],
    max_zoom: 6,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/rooikat_sat_z6_full.png"
    }
  },
  {
    name: "Rostov",
    namespace: "rostov",
    size: [7935, 7935],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/rostov_sat_z6_full.png"
    }
  },
  {
    name: "Ruha",
    namespace: "ruha",
    size: [8150, 8150],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/ruha_sat_z6_full.png"
    }
  },
  {
    name: "Saigon",
    namespace: "saigon",
    size: [17150, 17150],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/saigon_sat_z6_full.png",
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/saigon_height.json"
    }
  },
  {
    name: "Seitenbuch",
    namespace: "seitenbuch",
    size: [2000, 4000],
    max_zoom: 6,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/seitenbuch_sat_z6_full.png"
    }
  },
  {
    name: "Serhiivka",
    namespace: "serhiivka",
    size: [10240, 10240],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/serhiivka_sat_z6_full.png"
    }
  },
  {
    name: "Takistan",
    namespace: "takistan",
    size: [12900, 12900],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/takistan_sat_z6_full.png",
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/takistan_height.json"
    }
  },
  {
    name: "Udachne",
    namespace: "udachne",
    size: [5120, 10240],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/udachne_sat_z6_full.png"
    }
  },
  {
    name: "Zarichne",
    namespace: "zarichne",
    size: [4095, 4095],
    max_zoom: 6,
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/zarichne_sat_z6_full.png",
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/zarichne_height.json"
    }
  },
  {
    name: "Zimnitrita",
    namespace: "zimnitrita",
    size: [16384, 16384],
    max_zoom: 6, // Downgraded from z7 for faster loading
    resources: {
      map_image: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/zimnitrita_sat_z6_full.png",
      height_data: "https://pub-65310bd5bcd44d68b30addfbacb31e51.r2.dev/height_data/zimnitrita_height.json"
    }
  }
]

/**
 * All available map configurations (converted from raw data)
 */
export const MAP_CONFIGS: Record<MapId, MapConfig> = RAW_MAP_DATA.reduce(
  (acc, raw) => {
    acc[raw.namespace as MapId] = convertRawToMapConfig(raw)
    return acc
  },
  {} as Record<MapId, MapConfig>
)

/**
 * Default map to use on initial load
 */
export const DEFAULT_MAP_ID: MapId = 'everon'

/**
 * Get map configuration by ID
 */
export function getMapConfig(mapId: MapId): MapConfig {
  return MAP_CONFIGS[mapId] || MAP_CONFIGS.everon
}

/**
 * Get list of all available maps (sorted by name)
 */
export function getAvailableMaps(): MapConfig[] {
  return Object.values(MAP_CONFIGS).sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  )
}

/**
 * Get maps grouped by category (Vanilla vs Mods)
 * Vanilla maps: Everon, Arland, Kolguev
 * Mods: All other maps
 */
export function getMapsByCategory(): { vanilla: MapConfig[]; mods: MapConfig[] } {
  const allMaps = getAvailableMaps()
  return {
    vanilla: allMaps.filter(m => m.category === 'vanilla'),
    mods: allMaps.filter(m => m.category === 'mods')
  }
}

/**
 * Get list of maps with height data
 */
export function getMapsWithHeightData(): MapConfig[] {
  return Object.values(MAP_CONFIGS).filter(m => m.hasHeightData)
}

/**
 * Get raw map data (useful for debugging or external tools)
 */
export function getRawMapData(): ArmaMapRaw[] {
  return RAW_MAP_DATA
}
