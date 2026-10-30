import type { RegionSpec } from './types';

const CHECKED = '2026-10-29';

const spec: RegionSpec = {
  id: 'middle-east-central-asia',
  code: 'mc',
  name: 'Middle East & Central Asia',
  blurb: 'Deserts, steppe and mountains where water is scarce: shrinking seas, overgrazed grassland, wildfires, flaring oil fields and the wild forests where the apple began.',
  tier1: [
    {
      mission: {
        id: 'mc-aral', title: 'The Vanishing Aral Sea', theme: 'freshwater', arch: 'plume', catalogue: [35, 63],
        blurb: 'Rivers diverted to irrigate cotton left a once-great sea a fraction of its size. Win water back for the delta and its river forests.',
        threats: ['Irrigation diversions from the rivers'],
        species: [{ id: 'bukhara-deer', name: 'Bukhara deer', habitat: ['forest', 'river'] }],
        labels: { restore: 'Rewet', defend: 'Water-sharing deal', remove: 'Close an illegal canal', protect: 'Delta reserve', campaign: 'Efficient-irrigation campaign' },
        realWorld: 'Check where cotton clothing comes from, prefer products that report water use, and support delta restoration charities.',
      },
      driver: 'exploitation',
      priority: { severity: 5, urgency: 3, irreversibility: 5, reach: 3 },
      drivers: [
        { name: 'River diversion for cotton irrigation', catalogue: [35] },
        { name: 'Salty, polluted dust from the dry seabed', catalogue: [63] },
        { name: 'Drought on the river sources', catalogue: [45] },
      ],
      sites: ['The Amu Darya delta wetlands', 'River forest where Bukhara deer live', 'The North Aral Sea'],
      fact: {
        text: 'NASA satellite images show the Aral Sea was already a fraction of its 1960 extent by 2000, after rivers were diverted to farms for cotton and other crops; in 2014 the eastern lobe of the South Aral Sea disappeared completely.',
        source: 'NASA Earth Observatory, World of Change: Shrinking Aral Sea',
        url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'mc-steppe', title: 'The Overgrazed Steppe', theme: 'land', arch: 'frontier', catalogue: [19],
        blurb: 'Booming herds of sheep and goats are degrading the grassland. Restore the pasture and help herders manage it.',
        threats: ['Overgrazing by growing herds', 'Mining roads and fencing'],
        species: [{ id: 'mongolian-gazelle', name: 'Mongolian gazelle', habitat: ['grass'] }],
        map: { base: 'grass', pressure: ['farm', 'mine'], side: 'n', depth: 6 },
        labels: { restore: 'Reseed', defend: 'Herder patrol', remove: 'Remove a fence line', protect: 'Community pasture', campaign: 'Rotational-grazing campaign' },
        realWorld: 'Buy wool and cashmere with traceable, sustainable-grazing certification and ask brands how they manage herd sizes.',
      },
      driver: 'land-sea-use',
      priority: { severity: 4, urgency: 3, irreversibility: 4, reach: 3 },
      drivers: [
        { name: 'Overgrazing as herds grow', catalogue: [19] },
        { name: 'Mines and roads that cut the grassland', catalogue: [13] },
        { name: 'Drier, hotter summers', catalogue: [45] },
      ],
      sites: ['A seasonal pasture', 'A steppe eagle nesting area', 'A herder cooperative'],
      fact: {
        text: 'A 2014 satellite study in Global Change Biology found that vegetation across Mongolia had declined by about 12% on average, and that about 80% of the decline could be attributed to more livestock; about 70% of the steppe is considered degraded.',
        source: 'Hilker et al., Global Change Biology (2014)',
        url: 'https://doi.org/10.1111/gcb.12365',
        also: [{ source: 'Oregon State University, via ScienceDaily (5 September 2013)', url: 'https://www.sciencedaily.com/releases/2013/09/130905134026.htm' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'mc-gulf', title: 'Flares over the Gulf', theme: 'pollution', arch: 'poison', catalogue: [56],
        blurb: 'Oil fields burn off waste gas, and Iraq is one of the world’s biggest flarers. Clean up, cap the flares and protect the wetlands.',
        threats: ['Gas flaring and soot', 'Oil seeping into the wetlands'],
        species: [{ id: 'greater-flamingo', name: 'Greater flamingo', habitat: ['wetland', 'lake'] }],
        labels: { restore: 'Rewet', defend: 'Containment booms', remove: 'Clean up oil', protect: 'Wetland reserve', campaign: 'Capture-the-gas campaign' },
        realWorld: 'Cut your own fossil-fuel use where you can, and support groups that track flaring and oil spills with satellite data.',
      },
      driver: 'pollution',
      priority: { severity: 3, urgency: 4, irreversibility: 3, reach: 4 },
      drivers: [
        { name: 'Flaring of gas from oil wells', catalogue: [56] },
        { name: 'Oil spills and leaking pipelines', catalogue: [56] },
        { name: 'Weak enforcement of environmental rules', catalogue: [88] },
      ],
      sites: ['A coastal salt marsh', 'A flamingo roost', 'A village beside an oil field'],
      fact: {
        text: 'The World Bank’s Global Gas Flaring Tracker names Iraq among the nine largest gas-flaring countries in 2024; together they accounted for 83% of all gas flared.',
        source: 'World Bank, Global Gas Flaring Tracker (2024 data)',
        url: 'https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'mc-redsea', title: 'A Refuge on the Red Sea', theme: 'ocean', arch: 'fishing', catalogue: [8, 37],
        blurb: 'Northern Red Sea corals have come through extreme heat without bleaching. Protect the refuge so they can keep it up.',
        threats: ['Coastal megaprojects and dredging', 'Overfishing and ghost nets'],
        species: [
          { id: 'dugong', name: 'Dugong', habitat: ['ocean', 'seagrass'] },
          { id: 'hawksbill', name: 'Hawksbill turtle' },
        ],
        labels: { restore: 'Regrow coral', defend: 'Reef rangers', remove: 'Haul ghost nets', protect: 'Marine park', campaign: 'Reef-protection campaign' },
        realWorld: 'Never touch or stand on coral when diving, and choose dive operators that follow a reef-protection code.',
      },
      driver: 'land-sea-use',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 },
      drivers: [
        { name: 'Coastal development and dredging', catalogue: [8] },
        { name: 'Marine heatwaves and bleaching', catalogue: [37] },
        { name: 'Overfishing and lost nets', catalogue: [23, 50] },
      ],
      sites: ['The Gulf of Aqaba reefs', 'A seagrass meadow with dugongs', 'A turtle nesting beach'],
      fact: {
        text: 'Corals in the Gulf of Aqaba endured an exceptional 113-day marine heatwave in 2024, peaking at 32.6°C, and five kinds of coral survived it without bleaching; researchers warn the refuge may be approaching its limit.',
        source: 'Kochman and Fine, Science of the Total Environment (2025)',
        url: 'https://doi.org/10.1016/j.scitotenv.2025.180463',
        also: [{ source: 'Hebrew University press release, via EurekAlert', url: 'https://www.eurekalert.org/news-releases/1098645' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'mc-saiga', title: 'The Saiga Die-Off', theme: 'wildlife', arch: 'disease', catalogue: [73],
        blurb: 'In about three weeks a bacterial disease killed around 200,000 saigas, more than two thirds of the world population. Protect the herds, quarantine the outbreak and keep the steppe connected.',
        threats: ['Haemorrhagic septicaemia outbreak', 'Fences and farms split the herds'],
        species: [
          { id: 'saiga', name: 'Saiga antelope', habitat: ['grass', 'desert'] },
          { id: 'goitered-gazelle', name: 'Goitered gazelle', habitat: ['grass', 'desert'] },
        ],
        map: { base: 'grass', accent: 'wetland', accentAmount: 0.2, river: false },
        labels: { restore: 'Reseed', defend: 'Herd protection', remove: 'Contain an outbreak', protect: 'Calving reserve', campaign: 'Veterinary monitoring campaign' },
        realWorld: 'Support saiga conservation groups, and if you handle livestock or travel to rural areas, follow animal-disease rules on moving animals and reporting sick ones.',
      },
      driver: 'invasives',
      priority: { severity: 5, urgency: 3, irreversibility: 4, reach: 3 },
      drivers: [
        { name: 'Pasteurella bacteria turning deadly', catalogue: [73] },
        { name: 'Hot, humid spring weather before outbreaks', catalogue: [46] },
        { name: 'Fences and roads that fragment the range', catalogue: [11] },
      ],
      sites: ['A calving ground in central Kazakhstan', 'A migration route', 'A veterinary monitoring post'],
      fact: {
        text: 'In 2015 a mass die-off of about 200,000 saiga antelopes in central Kazakhstan was caused primarily by the bacterium Pasteurella multocida serotype B.',
        source: 'Emerging Infectious Diseases (CDC): “Mass Die-Off of Saiga Antelopes, Kazakhstan, 2015” (2019)',
        url: 'https://doi.org/10.3201/eid2506.180990',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'mc-fires', title: 'Fire Season in the Pine Forests', theme: 'climate', arch: 'fire', catalogue: [44, 45],
        blurb: 'Hot, dry summers turn coastal pine forests into fuel. Cut firebreaks, put out the flames and protect what survives.',
        threats: ['Wildfire', 'Clearing at the forest edge'],
        species: [{ id: 'eurasian-lynx', name: 'Eurasian lynx', habitat: ['forest'] }],
        map: { base: 'forest', accent: 'grass', accentAmount: 0.25, pressure: ['farm', 'town'], side: 's' },
        labels: { restore: 'Replant', defend: 'Firebreak', remove: 'Put out fire', protect: 'Fire-safe forest', campaign: 'Fire-safety campaign' },
        realWorld: 'Follow local fire-danger rules and never light fires or throw cigarettes in dry woodland, and support or volunteer with local fire-prevention and reforestation groups.',
      },
      driver: 'climate',
      priority: { severity: 4, urgency: 5, irreversibility: 3, reach: 3 },
      drivers: [
        { name: 'Heat and drought', catalogue: [45] },
        { name: 'Wildfires', catalogue: [44] },
        { name: 'Clearing and arson at the forest edge', catalogue: [44] },
      ],
      sites: ['A coastal pine forest', 'A lynx refuge', 'A village at the forest edge'],
      fact: {
        text: 'A 2024 study in Natural Hazards documented Türkiye’s unprecedented 2021 forest fires: 30 large fires affected 164,658 hectares across the Mediterranean, Aegean and Eastern Anatolian regions.',
        source: 'Remote sensing and GIS-based inventory of the 2021 forest fires in Türkiye, Natural Hazards (2024)',
        url: 'https://link.springer.com/10.1007/s11069-024-06622-0',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'mc-apples', title: 'The Birthplace of the Apple', theme: 'plants', arch: 'logging', catalogue: [82, 2],
        blurb: 'The wild forests of the Tien Shan hold the main wild ancestor of the apples we eat. Guard them from housing and clearing.',
        threats: ['Cutting for firewood and timber', 'Housing and farms replace the forest'],
        species: [{ id: 'wild-apple', name: 'Wild apple (Malus sieversii)', habitat: ['forest'] }],
        labels: { restore: 'Replant', defend: 'Forest ranger', remove: 'Block a logging track', protect: 'Gene-bank forest', campaign: 'Heritage-forest campaign' },
        realWorld: 'Choose varied, locally grown apples, support orchards and seed banks that keep old varieties, and back groups protecting wild fruit forests.',
      },
      driver: 'land-sea-use',
      priority: { severity: 3, urgency: 3, irreversibility: 5, reach: 3 },
      drivers: [
        { name: 'Land conversion for farms and pastures', catalogue: [10] },
        { name: 'Logging and firewood cutting', catalogue: [2] },
        { name: 'Overgrazing of the forest floor', catalogue: [19] },
      ],
      sites: ['A wild apple forest in the Tien Shan', 'A seed-collection site', 'A village at the forest edge'],
      fact: {
        text: 'Wild apple forests in the Tian Shan, home of the main wild ancestor of the cultivated apple, are shrinking, mainly because of clearing for housing and farming and deforestation.',
        source: 'Apples and People, “Fruit of the Heavenly Mountains”',
        url: 'https://applesandpeople.org.uk/stories/heavenly-mountains/',
        checked: CHECKED,
      },
    },
  ],
  tier2: [
    { id: 'mc-marshes', title: 'The Mesopotamian Marshes', theme: 'freshwater', driver: 'indirect', priority: { severity: 4, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [92, 12], drivers: [{ name: 'Draining by the Iraqi government after the 1991 Gulf War' }], sites: ['The Hawizeh marshes'] },
    { id: 'mc-groundwater', title: 'Falling aquifers', theme: 'freshwater', driver: 'exploitation', priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 }, catalogue: [33], drivers: [{ name: 'Pumping faster than rain refills' }, { name: 'Thirsty irrigated crops' }], sites: ['A desert oasis'] },
    { id: 'mc-falcons', title: 'Falcons and the pet trade', theme: 'wildlife', driver: 'exploitation', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [31], drivers: [{ name: 'Illegal capture for falconry' }, { name: 'Online trade' }], sites: ['A falcon migration route'] },
    { id: 'mc-dust', title: 'Salt and dust storms', theme: 'pollution', driver: 'pollution', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [17, 63], drivers: [{ name: 'Salty exposed lakebeds' }, { name: 'Overgrazed, bare soil' }], sites: ['Dry lakebeds in Iran and Iraq'] },
    { id: 'mc-pamir-ice', title: 'Pamir and Tien Shan glaciers', theme: 'climate', driver: 'climate', priority: { severity: 4, urgency: 3, irreversibility: 5, reach: 4 }, catalogue: [41], drivers: [{ name: 'Warming melts glaciers' }, { name: 'Meltwater floods and later shortages' }], sites: ['A glacier-fed valley'] },
  ],
};

export default spec;
