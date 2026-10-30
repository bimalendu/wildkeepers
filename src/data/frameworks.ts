/** The IPBES direct drivers of biodiversity loss, in the order of their global impact (rank 1 = largest). */
export const IPBES_DRIVERS = {
  'land-sea-use': { rank: 1, name: 'Land and sea use change' },
  exploitation: { rank: 2, name: 'Direct exploitation' },
  climate: { rank: 3, name: 'Climate change' },
  pollution: { rank: 4, name: 'Pollution' },
  invasives: { rank: 5, name: 'Invasive species and disease' },
  'cross-cutting': { rank: 6, name: 'Threatened groups' },
  indirect: { rank: 7, name: 'Indirect drivers and governance' },
} as const;
export type IpbesDriver = keyof typeof IPBES_DRIVERS;

/** The nine planetary boundaries. `breached` follows the 2025 Planetary Health Check (7 of 9). */
export const BOUNDARIES = {
  'climate-change': { name: 'Climate change', breached: true },
  'biosphere-integrity': { name: 'Biosphere integrity', breached: true },
  'land-system-change': { name: 'Land-system change', breached: true },
  'freshwater-change': { name: 'Freshwater change', breached: true },
  'biogeochemical-flows': { name: 'Nitrogen and phosphorus flows', breached: true },
  'ocean-acidification': { name: 'Ocean acidification', breached: true },
  'novel-entities': { name: 'Novel entities (plastics, chemicals)', breached: true },
  'ozone-depletion': { name: 'Stratospheric ozone depletion', breached: false },
  'aerosol-loading': { name: 'Atmospheric aerosols', breached: false },
} as const;
export type BoundaryId = keyof typeof BOUNDARIES;
