import type { RegionSpec } from './types';

const CHECKED = '2026-10-29';

const spec: RegionSpec = {
  id: 'east-southeast-asia',
  code: 'es',
  name: 'East & Southeast Asia',
  blurb: 'Rainforests, the Coral Triangle’s reefs and the Mekong, under pressure from palm oil, fire, dams, plastic and the loss of the mudflats where migrating birds refuel.',
  tier1: [
    {
      mission: {
        id: 'es-borneo', title: 'The Orangutan Forests of Borneo', theme: 'land', arch: 'frontier', catalogue: [1, 2],
        blurb: 'Logging and industrial plantations are clearing Borneo’s rainforest. Hold the edge and keep the orangutans’ forest connected.',
        threats: ['Oil palm and pulp expansion', 'Logging and mining roads'],
        species: [{ id: 'bornean-orangutan', name: 'Bornean orangutan' }],
        realWorld: 'Choose products with credible certified-sustainable palm oil and paper, check labels for deforestation-free claims, and support orangutan and forest-protection groups.',
      },
      driver: 'land-sea-use',
      priority: { severity: 5, urgency: 5, irreversibility: 5, reach: 5 },
      drivers: [
        { name: 'Oil palm plantations', catalogue: [1] },
        { name: 'Pulp, paper and logging roads', catalogue: [2] },
        { name: 'Mining and the roads it brings', catalogue: [13] },
        { name: 'Hunting and conflict in forest that remains', catalogue: [81] },
      ],
      sites: ['A peat swamp forest', 'An orangutan corridor', 'A forest village'],
      fact: {
        text: 'A 2018 study in Current Biology estimated that Borneo’s orangutan population fell by more than 100,000 between 1999 and 2015, with half the population affected by logging, deforestation or industrial plantations, though most of the loss was in selectively logged and primary forests.',
        source: 'Voigt et al., Current Biology (2018), “Global Demand for Natural Resources Eliminated More Than 100,000 Bornean Orangutans”',
        url: 'https://doi.org/10.1016/j.cub.2018.01.053',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'es-peat-fires', title: 'Peat Fires and Haze', theme: 'climate', arch: 'fire', catalogue: [44, 59],
        blurb: 'Drained peatlands burn and blanket a whole region in haze. Cut firebreaks, put out the flames and protect the peat.',
        threats: ['Peat and forest fires', 'Drainage and clearing for plantations'],
        species: [{ id: 'sumatran-tiger', name: 'Sumatran tiger', habitat: ['forest', 'wetland'] }],
        map: { base: 'forest', accent: 'wetland', accentAmount: 0.3, pressure: ['farm', 'road'], side: 'w' },
        labels: { restore: 'Rewet the peat', defend: 'Canal block', remove: 'Put out fire', protect: 'Peat reserve', campaign: 'No-burning campaign' },
        realWorld: 'Choose products with deforestation-free and no-burning palm oil and paper supply chains, and support groups that rewet and restore drained peatland.',
      },
      driver: 'climate',
      priority: { severity: 4, urgency: 5, irreversibility: 4, reach: 4 },
      drivers: [
        { name: 'Fires set to clear land', catalogue: [44] },
        { name: 'Drained peat that burns easily', catalogue: [44] },
        { name: 'Smoke and haze across borders', catalogue: [59] },
      ],
      sites: ['A drained peat swamp', 'A tiger refuge', 'A village under the haze'],
      fact: {
        text: 'The World Bank estimated that Indonesia’s 2015 fires cost at least US$16.1 billion (221 trillion rupiah), equivalent to 1.9% of 2015 GDP and more than twice the reconstruction cost after the Aceh tsunami.',
        source: 'World Bank, The Cost of Fire: An Economic Analysis of Indonesia’s 2015 Fire Crisis (February 2016)',
        url: 'https://documents1.worldbank.org/curated/en/776101467990969768/pdf/103668-BRI-Cost-of-Fires-Knowledge-Note-PUBLIC-ADD-NEW-SERIES-Indonesia-Sustainable-Landscapes-Knowledge-Note.pdf',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'es-coral-triangle', title: 'The Coral Triangle', theme: 'ocean', arch: 'fishing', catalogue: [8, 23],
        blurb: 'The Coral Triangle is the world’s centre of coral diversity, and its reefs face overfishing, destructive fishing, polluted run-off and coastal development. Patrol, protect and win the rules.',
        threats: ['Blast and cyanide fishing', 'Overfishing and coastal development'],
        species: [
          { id: 'hawksbill-turtle', name: 'Hawksbill turtle' },
          { id: 'whale-shark', name: 'Whale shark' },
        ],
        labels: { restore: 'Regrow coral', defend: 'Reef patrol', remove: 'Haul in illegal gear', protect: 'Marine reserve', campaign: 'Anti-blast-fishing campaign' },
        realWorld: 'Choose reef-friendly seafood, never buy corals or reef souvenirs, and ask dive operators about their reef-protection rules.',
      },
      driver: 'land-sea-use',
      priority: { severity: 5, urgency: 4, irreversibility: 4, reach: 5 },
      drivers: [
        { name: 'Blast and cyanide fishing', catalogue: [8] },
        { name: 'Overfishing', catalogue: [23] },
        { name: 'Coastal development and runoff', catalogue: [8] },
      ],
      sites: ['A coral reef nursery', 'A whale shark feeding ground', 'A fishing village'],
      fact: {
        text: 'A 2012 World Resources Institute report found that more than 85% of reefs in the Coral Triangle are directly threatened by local human activities, against a global average of 60%, with overfishing, watershed pollution and coastal development the greatest threats.',
        source: 'World Resources Institute, Reefs at Risk Revisited in the Coral Triangle (2012)',
        url: 'https://www.wri.org/news/release-85-percent-reefs-coral-triangle-are-threatened-new-report-finds',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'es-mekong', title: 'The Mighty Mekong’s Fish', theme: 'freshwater', arch: 'plume', catalogue: [12, 76],
        blurb: 'Dams are cutting fish diversity in Mekong tributaries and, if all are built, could trap almost all of the sediment that feeds the delta. Open the river and fight for its flow.',
        threats: ['Dams that block fish migration and trap sediment'],
        species: [{ id: 'mekong-giant-catfish', name: 'Mekong giant catfish', habitat: ['river', 'lake'] }],
        labels: { restore: 'Rewet', defend: 'Fish ladder', remove: 'Remove a barrier', protect: 'Spawning refuge', campaign: 'Dam-planning campaign' },
        realWorld: 'Ask where freshwater fish and rice you buy come from, support river-basin conservation groups, and push banks and companies to publish the effects of dams they fund.',
      },
      driver: 'land-sea-use',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 },
      drivers: [
        { name: 'Hydropower dams on the river and its tributaries', catalogue: [12] },
        { name: 'Blocked migration of fish', catalogue: [76] },
        { name: 'Sand mining in the riverbed', catalogue: [16] },
      ],
      sites: ['A fish spawning pool', 'The Tonle Sap floodplain', 'A delta village'],
      fact: {
        text: 'The Mekong River Commission’s Council Study modelled that, in its final-phase scenario, sediment trapping by mainstream and tributary dams could cut the sediment reaching the Mekong Delta by 97%, with substantial erosion and changes to the river channel.',
        source: 'Mekong River Commission, MRC Hydropower Mitigation Guidelines (citing the Council Study modelling)',
        url: 'https://www.mrcmekong.org/wp-content/uploads/2024/08/Ish0306-vol3-1.pdf',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'es-plastics', title: 'Plastic in the Rivers', theme: 'pollution', arch: 'poison', catalogue: [49],
        blurb: 'Small urban rivers carry plastic waste to the sea. Clear the channels, stop the leaks and change the packaging.',
        threats: ['Plastic washing into the river', 'Dumping into drains and canals'],
        species: [{ id: 'irrawaddy-dolphin', name: 'Irrawaddy dolphin', habitat: ['river', 'mangrove'] }],
        labels: { restore: 'Rewet', defend: 'Trash trap', remove: 'Clean up', protect: 'Clean river zone', campaign: 'Packaging campaign' },
        realWorld: 'Cut single-use plastic where you can, use proper bins and recycling, and support river clean-ups and waste-collection schemes in cities.',
      },
      driver: 'pollution',
      priority: { severity: 3, urgency: 4, irreversibility: 3, reach: 5 },
      drivers: [
        { name: 'Poorly collected plastic waste', catalogue: [49] },
        { name: 'Drains and canals that carry it to rivers', catalogue: [49] },
        { name: 'Throwaway packaging', catalogue: [86] },
      ],
      sites: ['A small urban river', 'A river mouth', 'A dolphin habitat'],
      fact: {
        text: 'A 2021 study in Science Advances estimated that more than 1,000 rivers account for 80% of global annual river plastic emissions into the ocean, with small urban rivers among the most polluting.',
        source: 'Meijer et al., Science Advances (2021)',
        url: 'https://research.tudelft.nl/en/publications/more-than-1000-rivers-account-for-80-of-global-riverine-plastic-e/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'es-yellow-sea', title: 'The Yellow Sea Mudflats', theme: 'wildlife', arch: 'frontier', catalogue: [9, 78],
        blurb: 'Reclamation is covering the tidal flats where migrating shorebirds refuel. Hold the shoreline and keep the stopover open.',
        threats: ['Land reclamation and sea walls', 'Ports and industry on the coast'],
        species: [{ id: 'spoon-billed-sandpiper', name: 'Spoon-billed sandpiper', habitat: ['wetland'] }],
        map: { base: 'wetland', accent: 'lake', accentAmount: 0.2, pressure: ['town', 'road'], side: 's', depth: 5 },
        labels: { restore: 'Restore the flats', defend: 'Bird watch', remove: 'Breach a sea wall', protect: 'Wetland reserve', campaign: 'Stop-reclamation campaign' },
        realWorld: 'Support groups that protect migratory-bird stopovers, join a local bird count, and keep cats indoors and dogs leashed near shorebird beaches.',
      },
      driver: 'land-sea-use',
      priority: { severity: 4, urgency: 3, irreversibility: 5, reach: 4 },
      drivers: [
        { name: 'Land reclamation', catalogue: [9] },
        { name: 'Ports and industrial coast', catalogue: [10] },
        { name: 'Loss of linked stopover sites along the flyway', catalogue: [78] },
      ],
      sites: ['A tidal mudflat', 'A shorebird roost', 'A coastal wetland reserve'],
      fact: {
        text: 'A 2014 study in Frontiers in Ecology and the Environment found that 28% of the Yellow Sea’s tidal flats present in the 1980s had disappeared by the late 2000s, and that historical maps suggest up to 65% were lost over the past five decades, mainly to land reclamation.',
        source: 'Murray et al., Frontiers in Ecology and the Environment 12(5), 267–272 (2014), “Tracking the rapid loss of tidal wetlands in the Yellow Sea”',
        url: 'https://researchonline.jcu.edu.au/60169/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'es-agarwood', title: 'The Wood of the Gods', theme: 'plants', arch: 'logging', catalogue: [32, 31],
        blurb: 'Illegal harvesters cut wild agarwood trees for their fragrant resin. Guard the forest and break the trade.',
        threats: ['Illegal agarwood poachers', 'Forest clearing at the edge'],
        species: [{ id: 'agarwood-tree', name: 'Agarwood tree (Aquilaria)', habitat: ['forest'] }],
        labels: { restore: 'Replant', defend: 'Forest ranger', remove: 'Block a poachers’ track', protect: 'Protected forest', campaign: 'Wildlife-trade campaign' },
        realWorld: 'Avoid wild-harvested agarwood incense, perfume and carvings, check that any agarwood product is from a certified plantation, and report illegal sales.',
      },
      driver: 'exploitation',
      priority: { severity: 3, urgency: 4, irreversibility: 4, reach: 2 },
      drivers: [
        { name: 'Poaching of wild trees', catalogue: [32] },
        { name: 'Demand for incense, perfume and carvings', catalogue: [31] },
        { name: 'Weak enforcement of trade rules', catalogue: [88] },
      ],
      sites: ['A lowland forest', 'A plantation nursery', 'A poaching hotspot'],
      fact: {
        text: 'A 2025 study of CITES and customs records for 2010–2020 found that the global agarwood trade depends heavily on wild-harvested, threatened trees, despite CITES protection.',
        source: 'Mongabay (April 2025), reporting a global agarwood-trade study',
        url: 'https://news.mongabay.com/2025/04/global-agarwood-trade-heavily-dependent-on-wild-threatened-trees-study/',
        also: [{ source: 'Kadoorie Farm and Botanic Garden (2025), on its agarwood-trade study', url: 'https://kfbg.org/en/KFBG-blog/post/KFBG-Scientists-Reveal-Urgent-Strategies-to-Combat-Agarwood-Trade-Threats-and-Protect-Endangered-Species' }],
        checked: CHECKED,
      },
    },
  ],
  tier2: [
    { id: 'es-songbirds', title: 'Songbirds in cages', theme: 'wildlife', driver: 'exploitation', priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 3 }, catalogue: [31], drivers: [{ name: 'Demand for pet songbirds' }, { name: 'Contests and online trade' }], sites: ['A forest where songbirds are trapped'] },
    { id: 'es-sand', title: 'Sand mining in the Mekong', theme: 'freshwater', driver: 'land-sea-use', priority: { severity: 3, urgency: 4, irreversibility: 4, reach: 3 }, catalogue: [16], drivers: [{ name: 'Sand for construction' }, { name: 'Riverbank collapse' }], sites: ['A river sand pit'] },
    { id: 'es-seagrass', title: 'Seagrass and the dugong', theme: 'ocean', driver: 'land-sea-use', priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [6], drivers: [{ name: 'Coastal development' }, { name: 'Trawling and anchors' }], sites: ['A seagrass meadow'] },
    { id: 'es-typhoons', title: 'Typhoons and coastal wetlands', theme: 'climate', driver: 'climate', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [43], drivers: [{ name: 'Stronger storms and rising seas' }, { name: 'Lost mangrove buffers' }], sites: ['A coastal mangrove belt'] },
  ],
};

export default spec;
