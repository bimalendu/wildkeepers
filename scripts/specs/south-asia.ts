import type { RegionSpec } from './types';

const CHECKED = '2026-10-29';

const spec: RegionSpec = {
  id: 'south-asia',
  code: 'sa',
  name: 'South Asia',
  blurb: 'From Himalayan ice to the Sundarbans mangroves: a crowded region where rivers, tigers, elephants and vultures share space with nearly 1.7 billion people.',
  tier1: [
    {
      mission: {
        id: 'sa-vultures', title: 'The Vulture Crisis', theme: 'wildlife', arch: 'poison', catalogue: [53, 77],
        blurb: 'A livestock painkiller, diclofenac, helped wipe out more than 98% of South Asia’s Gyps vultures. Take the poison out of the carcasses and give the survivors safe ground.',
        threats: ['Diclofenac in livestock carcasses', 'Other harmful veterinary drugs'],
        species: [
          { id: 'white-rumped-vulture', name: 'White-rumped vulture', habitat: ['forest'] },
        ],
        map: { base: 'forest', accent: 'grass', accentAmount: 0.25, pressure: ['farm'], side: 'n', river: true },
        targets: ['forest', 'grass', 'river'],
        labels: { restore: 'Replant nesting trees', defend: 'Safe feeding site', remove: 'Remove tainted carcasses', protect: 'Vulture safe zone', campaign: 'Drug-ban campaign' },
        realWorld: 'Never give pets or livestock medicines that are harmful to wildlife, return unused medicines to a pharmacy take-back scheme, and support vulture conservation groups.',
      },
      driver: 'pollution',
      priority: { severity: 5, urgency: 3, irreversibility: 5, reach: 3 },
      drivers: [
        { name: 'Diclofenac given to cattle', catalogue: [53] },
        { name: 'Other veterinary drugs that harm vultures', catalogue: [53] },
        { name: 'Loss of safe feeding and nesting sites', catalogue: [77] },
      ],
      sites: ['A vulture safe zone', 'A carcass feeding site', 'Old nesting trees'],
      fact: {
        text: 'Three Gyps vulture species endemic to South Asia have declined by more than 98% in the Indian subcontinent since the early 1990s, and the veterinary drug diclofenac has been shown to be the major cause of the collapse.',
        source: 'Bird Conservation International 21(1), 72–75 (2011), “Diclofenac is toxic to the Himalayan Vulture”',
        url: 'https://www.cambridge.org/core/product/9568A2E468F613320EFB53CF7280451E',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'sa-ganges', title: 'The Ganga’s Sewage', theme: 'freshwater', arch: 'plume', catalogue: [58],
        blurb: 'Faecal pollution still breaks bathing limits on stretches of the Ganga. Clean it up and push for treatment that works.',
        threats: ['Untreated sewage from town drains'],
        species: [{ id: 'river-dolphin', name: 'Ganges river dolphin', habitat: ['river', 'lake'] }],
        labels: { restore: 'Rewet', defend: 'Intercept a drain', remove: 'Clear sewage', protect: 'Buffer wetland', campaign: 'Sewage-treatment campaign' },
        realWorld: 'Never pour oil, paint or chemicals down a drain, support river clean-up groups, and ask your local authority how your sewage is treated.',
      },
      driver: 'pollution',
      priority: { severity: 4, urgency: 4, irreversibility: 3, reach: 5 },
      drivers: [
        { name: 'Sewage from towns along the river', catalogue: [58] },
        { name: 'Industrial effluent', catalogue: [51] },
      ],
      sites: ['A river-dolphin stretch', 'A town sewage outfall', 'A floodplain wetland'],
      fact: {
        text: 'India’s Ministry of Jal Shakti told Parliament in March 2026, citing the Central Pollution Control Board, that the Ganga’s faecal coliform bathing criterion is met along the whole river in Uttarakhand and Jharkhand but only in certain stretches of Uttar Pradesh, Bihar and West Bengal, where polluted stretches of the main stem remain.',
        source: 'Ministry of Jal Shakti, Rajya Sabha reply on the status of the Namami Gange Programme (PIB, 23 March 2026), citing CPCB',
        url: 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2244007&reg=3&lang=2',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'sa-sundarbans', title: 'The Sinking Mangroves', theme: 'ocean', arch: 'frontier', catalogue: [5, 43],
        blurb: 'Rising seas threaten the world’s largest mangrove forest, the home of the Bengal tiger. Hold the line.',
        threats: ['Shrimp farms and embankments', 'Rising seas and saltwater'],
        species: [{ id: 'bengal-tiger', name: 'Bengal tiger', habitat: ['mangrove'] }],
        map: { base: 'mangrove', accent: 'river', accentAmount: 0.2, pressure: ['farm'], side: 's', depth: 6 },
        labels: { restore: 'Replant mangroves', defend: 'Village patrol', remove: 'Break a shrimp-pond dyke', protect: 'Protected mangrove', campaign: 'Sustainable-aquaculture campaign' },
        realWorld: 'Ask where prawns and shrimp come from and prefer mangrove-friendly certified or locally farmed seafood, and support mangrove-planting and community-protection groups.',
      },
      driver: 'climate',
      priority: { severity: 4, urgency: 4, irreversibility: 5, reach: 4 },
      drivers: [
        { name: 'Sea-level rise', catalogue: [43] },
        { name: 'Climate change', catalogue: [43] },
      ],
      sites: ['The Sundarbans mangrove forest', 'A tiger creek', 'A village embankment'],
      fact: {
        text: 'A 2019 study projected that, under climate change and sea-level rise, there will be no suitable Bengal tiger habitat remaining in the Bangladesh Sundarbans by 2070.',
        source: 'Mukul et al., Science of the Total Environment 663, 830–840 (2019)',
        url: 'https://researchonline.jcu.edu.au/57062/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'sa-glaciers', title: 'Himalayan Water Towers', theme: 'climate', arch: 'plume', catalogue: [41],
        blurb: 'Melting glaciers send more water down the valleys, then less. Protect the rivers and the fish and people who depend on them.',
        threats: ['Meltwater surges and glacial-lake floods'],
        species: [{ id: 'golden-mahseer', name: 'Golden mahseer', habitat: ['river', 'lake'] }],
        labels: { restore: 'Rewet', defend: 'Flood barrier', remove: 'Clear debris', protect: 'River reserve', campaign: 'Climate-action campaign' },
        realWorld: 'Cut your own emissions where you can, and support early-warning systems and community adaptation work in mountain valleys.',
      },
      driver: 'climate',
      priority: { severity: 5, urgency: 4, irreversibility: 5, reach: 5 },
      drivers: [
        { name: 'Warming that melts glaciers', catalogue: [41] },
        { name: 'Floods and landslides as glaciers melt', catalogue: [41] },
      ],
      sites: ['A glacier-fed valley', 'A mahseer spawning stream', 'A mountain village'],
      fact: {
        text: 'ICIMOD’s 2023 assessment found that glaciers in the Hindu Kush Himalaya disappeared 65% faster in the 2010s than in the previous decade, and that on current emissions pathways they could lose up to 80% of their current volume by 2100.',
        source: 'ICIMOD, Water, Ice, Society, and Ecosystems in the Hindu Kush Himalaya (HI-WISE) report (2023)',
        url: 'https://hkh.icimod.org/hi-wise/',
        also: [{ source: 'Down To Earth (19 June 2023), on the ICIMOD report', url: 'https://www.downtoearth.org.in/news/climate-change/hindu-kush-himalayas-are-changing-ramp-up-adaptation-urges-icimod-90124' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'sa-smog', title: 'The Smoke Season', theme: 'pollution', arch: 'fire', catalogue: [59],
        blurb: 'Every autumn farmers burn crop stubble across Punjab and Haryana, and the smoke adds to Delhi’s smog. Put out the fires and push for cleaner ways to clear the land.',
        threats: ['Crop-residue fires', 'Burning of waste at the field edge'],
        species: [{ id: 'sarus-crane', name: 'Sarus crane', habitat: ['grass', 'wetland'] }],
        map: { base: 'grass', accent: 'wetland', accentAmount: 0.25, pressure: ['farm', 'road'], side: 'w' },
        labels: { restore: 'Replant', defend: 'Fire watch', remove: 'Put out fire', protect: 'Straw-free zone', campaign: 'Clean-air campaign' },
        realWorld: 'Never burn rubbish or garden waste, choose lower-emission transport where you can, and support farmers’ schemes that use crop residue instead of burning it.',
      },
      driver: 'pollution',
      priority: { severity: 3, urgency: 4, irreversibility: 3, reach: 4 },
      drivers: [
        { name: 'Burning of crop residue', catalogue: [59] },
        { name: 'Traffic, construction and industry', catalogue: [59] },
      ],
      sites: ['A wetland at the edge of the fields', 'A sarus crane nesting site', 'A farming village'],
      fact: {
        text: 'A 2025 study in npj Climate and Atmospheric Science found that crop-residue burning in Punjab contributed only about 14% of the PM2.5 over Delhi-NCR in October–November 2022, and named road traffic and construction among the other major sources.',
        source: 'Mangaraj et al., npj Climate and Atmospheric Science (2025), “Weak coupling of observed surface PM2.5 in Delhi-NCR with rice crop residue burning in Punjab and Haryana”',
        url: 'https://www.nature.com/articles/s41612-025-00901-8',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'sa-sanders', title: 'Red Gold Smugglers', theme: 'plants', arch: 'logging', catalogue: [32, 2],
        blurb: 'Illegal loggers fell red sanders, a tree found only in India’s Eastern Ghats, for a global market. Guard the hills and break the trade.',
        threats: ['Smuggling gangs felling red sanders', 'Mining and clearing in the hills'],
        species: [{ id: 'red-sanders', name: 'Red sanders', habitat: ['forest'] }],
        labels: { restore: 'Replant', defend: 'Forest guard', remove: 'Block a smuggling track', protect: 'Protected hills', campaign: 'Timber-trade campaign' },
        realWorld: 'Do not buy red sandalwood products, check that any rare-wood item comes with CITES paperwork, and support anti-trafficking groups such as TRAFFIC.',
      },
      driver: 'exploitation',
      priority: { severity: 3, urgency: 4, irreversibility: 4, reach: 2 },
      drivers: [
        { name: 'Illegal felling and smuggling', catalogue: [32] },
        { name: 'Weak enforcement and corruption', catalogue: [88] },
        { name: 'Overseas demand for the wood', catalogue: [32] },
      ],
      sites: ['The Seshachalam hills', 'A forest check post', 'A red sanders nursery'],
      fact: {
        text: 'A TRAFFIC and WWF-India factsheet (January 2023) found that, in CITES trade records for 2016–2020, India reported exporting more than 19,049 tonnes of red sanders logs while importing countries reported only about 4,610 tonnes, a discrepancy in the reporting of the trade.',
        source: 'TRAFFIC and WWF-India, Factsheet on India’s Red Sanders in Illegal Wildlife Trade (January 2023)',
        url: 'https://www.forest-trends.org/wp-content/uploads/2022/01/Red-Sanders-FactSheet-2023.pdf',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'sa-elephants', title: 'Elephants and the Railway', theme: 'land', arch: 'frontier', catalogue: [10, 16],
        blurb: 'Mines, roads, railways and power lines fragment elephant habitat, and trains and electrocution kill elephants. Reconnect the corridors and make the crossings safe.',
        threats: ['Roads, rail and mines cut the corridors', 'Sand mining and sprawl at the edge'],
        species: [{ id: 'asian-elephant', name: 'Asian elephant', habitat: ['forest'] }],
        labels: { restore: 'Replant a corridor', defend: 'Crossing guard', remove: 'Remove a fence or barrier', protect: 'Elephant corridor', campaign: 'Safe-crossings campaign' },
        realWorld: 'Support groups that secure elephant corridors and fund safe crossings, and choose responsibly sourced sand, stone and building materials where you can.',
      },
      driver: 'land-sea-use',
      priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 3 },
      drivers: [
        { name: 'Roads, railways and mines across corridors', catalogue: [10] },
        { name: 'Conflict with farmers', catalogue: [81] },
      ],
      sites: ['An elephant corridor', 'A railway crossing', 'A village with crop-raiding'],
      fact: {
        text: 'India’s DNA-based elephant survey for 2021–25, published by the Wildlife Institute of India in 2025, estimated 22,446 wild Asian elephants (confidence interval 18,255–26,645); the report says the figure is not comparable with past counts and should be treated as a new baseline.',
        source: 'Wildlife Institute of India, Status of Elephants in India: DNA based Synchronous All India population estimation of elephants (SAIEE) 2021–2025',
        url: 'https://wii.gov.in/uploads/media/pdf/announcements/elephant%20estimation_2021-25.pdf',
        also: [{ source: 'Down To Earth (15 October 2025), on the census release', url: 'https://www.downtoearth.org.in/wildlife-biodiversity/india-has-22446-as-per-new-census-they-need-the-support-of-local-communities-to-survive' }],
        checked: CHECKED,
      },
    },
  ],
  tier2: [
    { id: 'sa-punjab-water', title: 'Falling water tables in Punjab', theme: 'freshwater', driver: 'exploitation', priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 }, catalogue: [33], drivers: [{ name: 'Thirsty rice and wheat' }, { name: 'Free or cheap pumping power' }], sites: ['An irrigated district'] },
    { id: 'sa-lantana', title: 'Lantana in the forests', theme: 'plants', driver: 'invasives', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [65], drivers: [{ name: 'Introduced shrub' }, { name: 'Grazing and fire open the ground' }], sites: ['A tiger reserve understory'] },
    { id: 'sa-himalayan-herbs', title: 'Himalayan medicinal herbs', theme: 'plants', driver: 'exploitation', priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 2 }, catalogue: [32], drivers: [{ name: 'Overharvest of wild roots' }, { name: 'Medicine and cosmetics demand' }], sites: ['An alpine meadow'] },
    { id: 'sa-pangolins', title: 'Pangolins and the scale trade', theme: 'wildlife', driver: 'exploitation', priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 3 }, catalogue: [29], drivers: [{ name: 'Scales for traditional medicine' }, { name: 'Meat and trafficking routes' }], sites: ['A pangolin burrow area'] },
  ],
};

export default spec;
