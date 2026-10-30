import type { RegionSpec } from './types';

const CHECKED = '2026-10-29';

const spec: RegionSpec = {
  id: 'europe',
  code: 'eu',
  name: 'Europe',
  blurb: 'Old forests, rivers and shallow seas, under pressure from wildlife crime, forever chemicals, tree diseases, vanishing insects, trawled seabeds and fire in the south.',
  tier1: [
    {
      mission: {
        id: 'eu-eels', title: 'The Glass Eel Trade', theme: 'freshwater', arch: 'logging', catalogue: [76, 12],
        blurb: 'Baby eels are smuggled out of Europe to Asia, while dams and pumping stations block the rivers they need. Patrol the rivers, open the barriers and break the trade.',
        threats: ['Glass-eel smugglers', 'Dams and weirs block the rivers'],
        species: [{ id: 'european-eel', name: 'European eel', habitat: ['river'] }],
        map: { base: 'wetland', accent: 'forest', accentAmount: 0.25, pressure: ['town', 'road'], side: 'n', river: true },
        labels: { restore: 'Rewet', defend: 'River patrol', remove: 'Seize a catch', protect: 'Eel sanctuary', campaign: 'Trade-crackdown campaign' },
        realWorld: 'Do not buy eel or unagi unless you know it is legal and sustainable, and support groups that remove dams and barriers from rivers.',
      },
      driver: 'exploitation',
      priority: { severity: 5, urgency: 4, irreversibility: 5, reach: 4 },
      drivers: [
        { name: 'Illegal glass-eel trafficking', catalogue: [76] },
        { name: 'Dams and weirs that block migration', catalogue: [12] },
        { name: 'Weak enforcement', catalogue: [88] },
      ],
      sites: ['An estuary where glass eels arrive', 'A weir that needs an eel pass', 'A wetland nursery'],
      fact: {
        text: 'Europol’s 2022 environmental crime threat assessment estimated that the illegal trafficking of European eels alone generates €2 to 3 billion in yearly criminal profits, and ICES notes that the European eel is classified as critically endangered by the IUCN.',
        source: 'Europol, Environmental Crime in the Age of Climate Change: threat assessment 2022',
        url: 'https://www.europol.europa.eu/cms/sites/default/files/documents/Environmental_Crime_in_the_Age_of_Climate_Change_threat_assessment_2022.pdf',
        also: [{ source: 'ICES, advice on European eel', url: 'https://www.ices.dk/news-and-events/news-archive/news/Pages/EelAdvice.aspx' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'eu-pfas', title: 'Forever Chemicals', theme: 'pollution', arch: 'poison', catalogue: [54],
        blurb: 'PFAS “forever chemicals” have contaminated thousands of sites across Europe, from industrial sites to firefighting foam. Clean up, cap the sources and push for a ban.',
        threats: ['PFAS leaking from factories and foam', 'Contaminated sites seeping into rivers'],
        species: [{ id: 'eurasian-otter', name: 'Eurasian otter', habitat: ['wetland', 'river'] }],
        labels: { restore: 'Rewet', defend: 'Containment barrier', remove: 'Clean up a site', protect: 'Clean-water zone', campaign: 'PFAS-ban campaign' },
        realWorld: 'Choose PFAS-free products where labels say so, avoid non-stick and water-repellent products you do not need, and ask your local water supplier to publish PFAS test results.',
      },
      driver: 'pollution',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 },
      drivers: [
        { name: 'PFAS from factories and fire-training sites', catalogue: [54] },
        { name: 'Persistent chemicals that do not break down', catalogue: [54] },
      ],
      sites: ['A river downstream of a factory', 'An otter wetland', 'A fire-training ground'],
      fact: {
        text: 'The Forever Pollution Project’s February 2023 map located nearly 23,000 sites in Europe contaminated by PFAS, plus 21,500 sites of presumptive contamination.',
        source: 'The Forever Pollution Project (Le Monde and European media partners)',
        url: 'https://foreverpollution.eu/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'eu-ash', title: 'Ash Dieback', theme: 'plants', arch: 'disease', catalogue: [67],
        blurb: 'A fungus is killing ash trees across Europe. Slow its spread, shelter the survivors and protect the woods that depend on them.',
        threats: ['Ash dieback fungus', 'Clearing and felling of woodland'],
        species: [{ id: 'european-ash', name: 'European ash', habitat: ['forest'] }],
        map: { base: 'forest', accent: 'grass', accentAmount: 0.15, river: false },
        labels: { restore: 'Replant with diverse trees', defend: 'Woodland guard', remove: 'Fell a diseased tree safely', protect: 'Resistant-tree reserve', campaign: 'Plant-health rules campaign' },
        realWorld: 'Buy plants and trees only from nurseries that follow plant-health rules, never bring plants or soil back from trips abroad, and report diseased ash trees to your national forestry body.',
      },
      driver: 'invasives',
      priority: { severity: 4, urgency: 3, irreversibility: 4, reach: 3 },
      drivers: [
        { name: 'The fungus Hymenoscyphus fraxineus', catalogue: [67] },
        { name: 'Loss of woodland to clearing', catalogue: [1] },
      ],
      sites: ['An ancient ash wood', 'A tree nursery', 'A hedgerow ash line'],
      fact: {
        text: 'A 2019 meta-analysis of ash dieback surveys in Plants, People, Planet found maximum recorded mortality of about 85% in plantations and about 70% in woodlands exposed to the disease for 4 to 20 years.',
        source: 'Coker et al., Plants, People, Planet 1(1), 48–58 (2019), “Estimating mortality rates of European ash under the ash dieback epidemic”',
        url: 'https://livingashproject.org.uk/wp-content/uploads/2020/07/Coker-et-al-2019-Estimating-mortality-rates-of-European-ash-Fraxinus-excelsior-under-the-ash-dieback-Hymenoscyphus-fraxineus-epidemic.pdf',
        also: [{ source: 'ScienceDaily (5 December 2018), on the Wiley press release', url: 'https://www.sciencedaily.com/releases/2018/12/181205093651.htm' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'eu-insects', title: 'The Silent Meadows', theme: 'wildlife', arch: 'poison', catalogue: [74, 52],
        blurb: 'Flying insect numbers have collapsed even inside protected areas. Restore meadows and hedgerows, and win rules that protect pollinators.',
        threats: ['Pesticide drift from fields', 'Hedgerow and meadow loss'],
        species: [{ id: 'wild-bees', name: 'Wild bees', habitat: ['grass'] }],
        map: { base: 'grass', accent: 'forest', accentAmount: 0.3, pressure: ['farm'], side: 'n', river: false },
        targets: ['grass', 'forest'],
        labels: { restore: 'Sow wildflowers', defend: 'Spray-free buffer', remove: 'Clear pesticide', protect: 'Pollinator reserve', campaign: 'Pesticide-reduction campaign' },
        realWorld: 'Let part of your garden grow wild, avoid garden pesticides, plant native flowers for pollinators, and ask local councils to mow verges less often.',
      },
      driver: 'cross-cutting',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 },
      drivers: [
        { name: 'Pesticides, including neonicotinoids', catalogue: [52] },
        { name: 'Loss of hedgerows and wildflower meadows', catalogue: [74] },
        { name: 'Intensive farming', catalogue: [74] },
      ],
      sites: ['A wildflower meadow', 'A hedgerow corridor', 'A protected nature area'],
      fact: {
        text: 'A 2017 study in PLOS ONE found a 76% seasonal decline in flying insect biomass over 27 years in 63 nature protection areas in Germany.',
        source: 'Hallmann et al., PLOS ONE (2017)',
        url: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0185809',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'eu-trawling', title: 'Trawled Protected Seas', theme: 'ocean', arch: 'fishing', catalogue: [26, 23],
        blurb: 'Bottom trawlers still work inside Europe’s marine protected areas. Patrol, enforce and campaign until protection means protection.',
        threats: ['Bottom trawlers in protected areas', 'Bycatch of porpoises and sharks'],
        species: [
          { id: 'harbour-porpoise', name: 'Harbour porpoise', habitat: ['ocean'] },
          { id: 'common-skate', name: 'Common skate', habitat: ['ocean'] },
        ],
        labels: { restore: 'Restore the seabed', defend: 'Fisheries patrol', remove: 'Haul in illegal gear', protect: 'No-take zone', campaign: 'Trawling-ban campaign' },
        realWorld: 'Choose seafood caught with low-impact gear and certified sustainable, ask retailers if it was trawled in protected areas, and back campaigns for enforcement in marine protected areas.',
      },
      driver: 'exploitation',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 3 },
      drivers: [
        { name: 'Bottom trawling', catalogue: [26] },
        { name: 'Overfishing', catalogue: [23] },
        { name: 'Weak enforcement in protected areas', catalogue: [88] },
      ],
      sites: ['An offshore protected area', 'A seabed reef', 'A porpoise feeding ground'],
      fact: {
        text: 'A 2024 report by the Marine Conservation Society, Seas At Risk and Oceana, using Global Fishing Watch data, found destructive bottom trawling still taking place in 90% of offshore EU marine protected areas, with 4.4 million hours of apparent bottom trawling in marine protected areas in the seven countries analysed between 2015 and 2023.',
        source: 'Seas At Risk press release (16 April 2024), using Global Fishing Watch data',
        url: 'https://seas-at-risk.org/press-releases/eu-wide-campaign-launched-to-end-destructive-fishing-in-europes-protected-waters-90-of-protected-waters-still-targeted/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'eu-fires', title: 'Europe’s Burning South', theme: 'climate', arch: 'fire', catalogue: [44, 45],
        blurb: 'Summer heatwaves fed record fires across southern Europe in 2025. Cut firebreaks, put out the fire and protect what is left.',
        threats: ['Wildfire', 'Rural abandonment and clearing'],
        species: [{ id: 'iberian-lynx', name: 'Iberian lynx', habitat: ['forest', 'grass'] }],
        map: { base: 'forest', accent: 'grass', accentAmount: 0.3, pressure: ['farm', 'town'], side: 's' },
        labels: { restore: 'Replant', defend: 'Firebreak', remove: 'Put out fire', protect: 'Fire-safe forest', campaign: 'Fire-prevention campaign' },
        realWorld: 'Follow fire-danger rules and bans in dry weather, never leave fires or barbecues unattended, and support grazing and forest-management schemes that reduce fuel.',
      },
      driver: 'climate',
      priority: { severity: 4, urgency: 5, irreversibility: 3, reach: 4 },
      drivers: [
        { name: 'Heat and drought', catalogue: [45] },
        { name: 'Wildfires', catalogue: [44] },
      ],
      sites: ['A cork-oak woodland', 'A lynx territory', 'A village at the forest edge'],
      fact: {
        text: 'The European Forest Fire Information System (EFFIS) recorded 1,079,538 hectares burned in the EU in 2025, the highest total since its records began in 2006 and nearly double the 2006–2024 average.',
        source: 'European Commission Joint Research Centre (31 March 2026), “2025 was EU’s most destructive wildfire season on record”',
        url: 'https://joint-research-centre.ec.europa.eu/jrc-news-and-updates/2025-was-eus-most-destructive-wildfire-season-record-2026-03-31_en',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'eu-bialowieza', title: 'The Last Primeval Forest', theme: 'land', arch: 'logging', catalogue: [2],
        blurb: 'Białowieża is one of the best-preserved natural forests in Europe, yet logging there broke EU law. Guard it, restore it and make the law count.',
        threats: ['Logging in the old forest', 'Roads and clearing at the edge'],
        species: [{ id: 'european-bison', name: 'European bison', habitat: ['forest'] }],
        labels: { restore: 'Replant', defend: 'Forest ranger', remove: 'Block a logging road', protect: 'Strict reserve', campaign: 'Legal campaign' },
        realWorld: 'Buy wood and paper with FSC certification, support legal and campaigning groups that enforce nature law, and visit primeval forests on guided, low-impact trips.',
      },
      driver: 'land-sea-use',
      priority: { severity: 3, urgency: 3, irreversibility: 5, reach: 3 },
      drivers: [
        { name: 'Commercial and “sanitary” logging', catalogue: [2] },
        { name: 'Increased timber harvesting authorised in 2016', catalogue: [2] },
        { name: 'Weak enforcement of protection', catalogue: [88] },
      ],
      sites: ['A primeval oak and hornbeam stand', 'A bison range', 'A strictly protected core'],
      fact: {
        text: 'On 17 April 2018 the EU Court of Justice ruled that Poland’s forest management operations in the Białowieża Forest Natura 2000 site, which followed an authorised near-tripling of timber harvesting in one forest district, infringed EU law.',
        source: 'Court of Justice of the European Union, Press release 48/18 (17 April 2018), Commission v Poland (Białowieża Forest), Case C-441/17',
        url: 'https://curia.europa.eu/jcms/upload/docs/application/pdf/2018-04/cp180048en.pdf',
        checked: CHECKED,
      },
    },
  ],
  tier2: [
    { id: 'eu-posidonia', title: 'Posidonia meadows in the Mediterranean', theme: 'ocean', driver: 'land-sea-use', priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [6], drivers: [{ name: 'Anchors and coastal building' }, { name: 'Warming seas' }], sites: ['A Posidonia meadow'] },
    { id: 'eu-coastal-squeeze', title: 'Coastal squeeze', theme: 'ocean', driver: 'land-sea-use', priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [20], drivers: [{ name: 'Sea walls and building behind the shore' }, { name: 'Rising seas' }], sites: ['A salt marsh', 'A dune system'] },
    { id: 'eu-fungi', title: 'Fungi and lichens', theme: 'plants', driver: 'cross-cutting', priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [83], drivers: [{ name: 'Air pollution and nitrogen' }, { name: 'Loss of old woodland' }], sites: ['An old-growth woodland'] },
    { id: 'eu-baltic', title: 'Dead zones in the Baltic', theme: 'ocean', driver: 'pollution', priority: { severity: 4, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [39], drivers: [{ name: 'Nutrient runoff from farmland' }, { name: 'Warming that holds less oxygen' }], sites: ['The deep Baltic basin'] },
  ],
};

export default spec;
