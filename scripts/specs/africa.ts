import type { RegionSpec } from './types';

const CHECKED = '2026-10-29';

const spec: RegionSpec = {
  id: 'africa',
  code: 'af',
  name: 'Africa',
  blurb: 'From the Congo rainforest to the Sahel and the Gulf of Guinea: the last great herds, ancient forests and fisheries that millions of people depend on, pressed by clearing, poaching, pirate fishing and waste.',
  tier1: [
    {
      mission: {
        id: 'af-congo', title: 'The Congo Rainforest Edge', theme: 'land', arch: 'frontier', catalogue: [1, 34],
        blurb: 'Small-scale farm clearing and wood-cutting for firewood and charcoal eat into the Congo rainforest. Hold the edge and keep the forest elephants’ corridors open.',
        threats: ['Clearing for farms and charcoal', 'New logging roads open the forest'],
        species: [{ id: 'forest-elephant', name: 'Forest elephant' }],
        realWorld: 'Buy wood and paper with FSC certification, ask where charcoal and timber come from, and support community-forestry groups in the Congo Basin.',
      },
      driver: 'land-sea-use',
      priority: { severity: 5, urgency: 4, irreversibility: 5, reach: 5 },
      drivers: [
        { name: 'Smallholder clearing and charcoal making', catalogue: [34] },
        { name: 'Logging roads that open the forest', catalogue: [2] },
        { name: 'Bushmeat hunting that follows the roads', catalogue: [30] },
      ],
      sites: ['A forest elephant corridor', 'Peat forest in the central basin', 'A community-managed forest'],
      fact: {
        text: 'The Democratic Republic of Congo had the third-highest loss of tropical primary forest in the world in 2025, and its non-fire loss was the highest on record; 86% of its primary forest loss between 2002 and 2025 was due to small-scale shifting cultivation.',
        source: 'World Resources Institute, Global Forest Review (updated April 2026)',
        url: 'https://gfr.wri.org/latest-analysis-deforestation-trends',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'af-poaching', title: 'Ivory and Pangolins', theme: 'wildlife', arch: 'logging', catalogue: [29, 30],
        blurb: 'Poachers follow the elephants and pangolins across the savanna. Patrol, pull snares and win the fight against the trade.',
        threats: ['Poaching gangs', 'Farms and roads cut up the range'],
        species: [
          { id: 'savanna-elephant', name: 'Savanna elephant', habitat: ['grass', 'forest'] },
          { id: 'pangolin', name: 'Ground pangolin', habitat: ['grass', 'forest'] },
        ],
        map: { base: 'grass', accent: 'forest', accentAmount: 0.25 },
        labels: { restore: 'Restore habitat', defend: 'Ranger patrol', remove: 'Pull snares', protect: 'Community conservancy', campaign: 'Ivory-trade campaign' },
        realWorld: 'Never buy ivory, pangolin products or souvenirs made from wild animals, and report suspicious wildlife products you see for sale online to the platform or to TRAFFIC.',
      },
      driver: 'exploitation',
      priority: { severity: 5, urgency: 4, irreversibility: 5, reach: 4 },
      drivers: [
        { name: 'Ivory poaching', catalogue: [29] },
        { name: 'Pangolin scales and meat trade', catalogue: [29] },
        { name: 'Bushmeat snaring', catalogue: [30] },
      ],
      sites: ['A savanna elephant range', 'A pangolin burrow area', 'A community conservancy'],
      fact: {
        text: 'A 2014 study in PNAS estimated that about 100,000 African elephants were illegally killed for their ivory in three years, between 2010 and 2012.',
        source: 'Wittemyer et al., PNAS (2014)',
        url: 'https://doi.org/10.1073/pnas.1403984111',
        also: [{ source: 'Colorado State University press release (18 August 2014)', url: 'https://newsmediarelations.colostate.edu/2014/08/18/colorado-state-university-study-verifies-more-than-100000-african-elephants-killed-in-three-years/' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'af-sahel', title: 'The Sahel Under Pressure', theme: 'climate', arch: 'frontier', catalogue: [17, 19, 34],
        blurb: 'Degraded land is spreading across the Sahel. Restore the land and back the farmers and herders who live on it.',
        threats: ['Overgrazing and clearing', 'Fuelwood cutting'],
        species: [{ id: 'dama-gazelle', name: 'Dama gazelle', habitat: ['grass'] }],
        map: { base: 'grass', accent: 'desert', accentAmount: 0.3, pressure: ['farm', 'road'], side: 's', depth: 6 },
        labels: { restore: 'Plant and sow', defend: 'Fence and guard', remove: 'Stop the clearing', protect: 'Community land', campaign: 'Land-rights campaign' },
        realWorld: 'Support farmer-managed land restoration and the Great Green Wall through reputable charities, and choose charcoal and fuel from sustainable sources where you can.',
      },
      driver: 'climate',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 },
      drivers: [
        { name: 'Drought and rising heat', catalogue: [45] },
        { name: 'Overgrazing by growing herds', catalogue: [19] },
        { name: 'Fuelwood and charcoal cutting', catalogue: [34] },
        { name: 'Desertification and soil loss', catalogue: [17] },
      ],
      sites: ['A farmer-managed natural regeneration plot', 'A gazelle refuge', 'A village woodlot'],
      fact: {
        text: 'A 2020 UNCCD status report found the Great Green Wall had restored about 4 million hectares inside its core zones, around 4% of its 100-million-hectare target (about 18% counting wider regional efforts), and that reaching the goal by 2030 needs about 8.2 million hectares restored a year.',
        source: 'UNCCD, Great Green Wall status report (2020)',
        url: 'https://www.unccd.int/index.php/resources/unccd-library/africas-great-green-wall-officially-4-and-unofficially-18-complete',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'af-lake-chad', title: 'Lake Chad Is Drying', theme: 'freshwater', arch: 'plume', catalogue: [35, 63],
        blurb: 'Drought and rising demand for water have shrunk Lake Chad. Cut the draw-down and bring the wetlands back.',
        threats: ['Irrigation draw-down'],
        species: [{ id: 'african-manatee', name: 'African manatee' }],
        labels: { restore: 'Rewet', defend: 'Water-sharing deal', remove: 'Close an illegal intake', protect: 'Wetland reserve', campaign: 'Water-management campaign' },
        realWorld: 'Support water-sharing and wetland-restoration programmes through reputable charities, and cut your own water footprint where you can.',
      },
      driver: 'exploitation',
      priority: { severity: 4, urgency: 4, irreversibility: 3, reach: 4 },
      drivers: [
        { name: 'Irrigation withdrawals', catalogue: [35] },
        { name: 'Drought and falling rainfall', catalogue: [45] },
      ],
      sites: ['The southern Lake Chad wetlands', 'A fishing community on the shore', 'A manatee refuge'],
      fact: {
        text: 'NASA says ongoing droughts and rising demand for fresh water have shrunk Lake Chad to less than a tenth of the area it covered in the middle of the last century.',
        source: 'NASA Earth Observatory, “Lake Chad’s Water, Wetlands, and Dunes”',
        url: 'https://earthobservatory.nasa.gov/images/154407/lake-chads-water-wetlands-and-dunes',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'af-ewaste', title: 'Burning E-Waste', theme: 'pollution', arch: 'poison', catalogue: [57, 59],
        blurb: 'Old phones and computers are often burned in the open to recover their metals, releasing toxic fumes. Clean up and shut the supply down.',
        threats: ['Toxic ash and soot from burning e-waste', 'Metals washing into the lagoon'],
        species: [{ id: 'african-fish-eagle', name: 'African fish eagle', habitat: ['wetland', 'river'] }],
        labels: { restore: 'Rewet', defend: 'Safe collection point', remove: 'Clean up ash', protect: 'Buffer zone', campaign: 'Repair-and-recycle campaign' },
        realWorld: 'Keep devices for longer, repair rather than replace, and give old electronics only to certified take-back or recycling schemes, never to an unlicensed collector.',
      },
      driver: 'pollution',
      priority: { severity: 3, urgency: 4, irreversibility: 3, reach: 3 },
      drivers: [
        { name: 'Open burning of cables and circuit boards', catalogue: [57] },
        { name: 'Smoke and soot in nearby air', catalogue: [59] },
        { name: 'Imports of unsorted used electronics', catalogue: [57] },
      ],
      sites: ['A coastal lagoon', 'A scrap market', 'A neighbourhood next to a burn site'],
      fact: {
        text: 'In 2022, African countries had the lowest documented e-waste collection and recycling rate of any region, with less than 1% of e-waste documented as formally collected and recycled.',
        source: 'ITU and UNITAR, Global E-waste Monitor 2024',
        url: 'https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-Waste-Monitor-2024.aspx',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'af-fleets', title: 'Pirate Fishing off West Africa', theme: 'ocean', arch: 'fishing', catalogue: [24, 88, 23],
        blurb: 'Illegal and unreported fishing takes far more fish from West African waters than the official figures show. Patrol, enforce and campaign for the fishers who live there.',
        threats: ['Illegal industrial trawlers', 'Bycatch of turtles and dolphins'],
        species: [
          { id: 'humpback-dolphin', name: 'Atlantic humpback dolphin' },
          { id: 'green-turtle', name: 'Green turtle' },
        ],
        labels: { restore: 'Restore the seabed', defend: 'Coastal patrol', remove: 'Haul in illegal nets', protect: 'Marine reserve', campaign: 'Fishing-rules campaign' },
        realWorld: 'Choose seafood with credible sustainability certification (such as MSC), ask where it was caught, and support organisations that publish vessel-tracking data on illegal fishing.',
      },
      driver: 'exploitation',
      priority: { severity: 4, urgency: 4, irreversibility: 3, reach: 4 },
      drivers: [
        { name: 'Illegal industrial trawlers', catalogue: [24] },
        { name: 'Overfishing and stock collapse', catalogue: [23] },
        { name: 'Weak enforcement and corruption', catalogue: [88] },
      ],
      sites: ['A coastal artisanal fishing zone', 'A turtle nesting beach', 'A humpback dolphin lagoon'],
      fact: {
        text: 'A 2009 study of illegal and unreported fishing in 54 countries estimated that total catches in West Africa were 40% higher than reported catches.',
        source: 'Agnew et al., PLoS ONE (2009)',
        url: 'https://doi.org/10.1371/journal.pone.0004570',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'af-rosewood', title: 'Madagascar’s Rosewood', theme: 'plants', arch: 'logging', catalogue: [2, 32],
        blurb: 'Illegal loggers cut precious rosewood in Madagascar’s national parks, mostly to sell to China. Guard the last stands.',
        threats: ['Illegal rosewood loggers', 'Slash-and-burn clearing'],
        species: [{ id: 'malagasy-rosewood', name: 'Malagasy rosewood' }],
        labels: { restore: 'Replant', defend: 'Park patrol', remove: 'Block a logging track', protect: 'Community forest', campaign: 'Timber-trade campaign' },
        realWorld: 'Never buy rosewood or ebony furniture or instruments without legal proof of origin, and ask makers to show it.',
      },
      driver: 'exploitation',
      priority: { severity: 4, urgency: 3, irreversibility: 5, reach: 2 },
      drivers: [
        { name: 'Illegal rosewood and ebony logging', catalogue: [2, 32] },
        { name: 'Weak enforcement and corruption', catalogue: [88] },
        { name: 'Luxury timber demand abroad', catalogue: [32] },
      ],
      sites: ['A rainforest national park', 'A rosewood seedling nursery', 'Lemur habitat'],
      fact: {
        text: 'In 2009 Global Witness and the Environmental Investigation Agency found that 30–115 cubic metres of precious rosewood, worth between $88,000 and $460,000, were being illegally logged every day in Madagascar’s northeastern national parks and protected areas; China has been the main destination of Malagasy rosewood.',
        source: 'Global Witness and EIA investigation, press release (2 December 2009)',
        url: 'https://globalwitness.org/en/press-releases/illegal-malagasy-timber-trade-worth-up-to-460000-a-day',
        also: [{ source: 'TRAFFIC Bulletin, Malagasy timber trade', url: 'https://www.traffic.org/site/assets/files/3016/traffic_pub_bulletin_29_1_malagasy-timber.pdf' }, { source: 'Mongabay (2017)', url: 'https://news.mongabay.com/2017/11/logjam-inside-madagascars-illegal-rosewood-stockpiles/' }],
        checked: CHECKED,
      },
    },
  ],
  tier2: [
    { id: 'af-hyacinth', title: 'Water hyacinth on Lake Victoria', theme: 'freshwater', driver: 'invasives', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [65], drivers: [{ name: 'Introduced floating weed' }, { name: 'Nutrient runoff feeds it' }], sites: ['Lake Victoria bays'] },
    { id: 'af-bushmeat', title: 'The empty forest', theme: 'wildlife', driver: 'exploitation', priority: { severity: 4, urgency: 3, irreversibility: 4, reach: 4 }, catalogue: [30, 31], drivers: [{ name: 'Commercial bushmeat trade' }, { name: 'Roads that open the forest' }], sites: ['Forest near a logging concession'] },
    { id: 'af-cycads', title: 'Cycads: the most threatened plants', theme: 'plants', driver: 'exploitation', priority: { severity: 4, urgency: 3, irreversibility: 5, reach: 2 }, catalogue: [84], drivers: [{ name: 'Collection for gardens' }, { name: 'Habitat loss' }], sites: ['South African cycad stands'] },
    { id: 'af-charcoal', title: 'Charcoal and the city', theme: 'land', driver: 'exploitation', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [34], drivers: [{ name: 'Urban cooking fuel demand' }, { name: 'Illegal charcoal kilns' }], sites: ['Woodland around a large city'] },
    { id: 'af-niger-delta', title: 'Oil spills in the Niger Delta', theme: 'pollution', driver: 'pollution', priority: { severity: 4, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [56], drivers: [{ name: 'Leaking pipelines' }, { name: 'Illegal refining' }], sites: ['Mangrove creeks', 'Fishing communities'] },
  ],
};

export default spec;
