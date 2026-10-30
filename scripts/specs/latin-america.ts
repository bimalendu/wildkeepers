import type { RegionSpec } from './types';

const CHECKED = '2026-10-29';

const spec: RegionSpec = {
  id: 'latin-america',
  code: 'la',
  name: 'Latin America & Caribbean',
  blurb: 'Home to the Amazon, the Pantanal and the Galápagos, with some of the richest wildlife on Earth, under pressure from forest clearing, mining and industrial fishing.',
  tier1: [
    {
      mission: {
        id: 'la-amazon', title: 'The Arc of Deforestation', theme: 'land', arch: 'frontier', catalogue: [1, 2, 90],
        blurb: 'Cattle pasture and cropland push into the Amazon. Protect Indigenous land and the forest the jaguar needs.',
        threats: ['Pasture and soy frontier', 'Logging roads open new access'],
        species: [{ id: 'jaguar', name: 'Jaguar' }],
        realWorld: 'Look for credible deforestation-free labels (such as FSC on wood and paper), and ask retailers and banks where their beef, soy and palm oil come from.',
      },
      driver: 'land-sea-use',
      priority: { severity: 5, urgency: 5, irreversibility: 5, reach: 5 },
      drivers: [
        { name: 'Cattle pasture frontier', catalogue: [1] },
        { name: 'Soy expansion', catalogue: [1] },
        { name: 'Logging roads', catalogue: [2, 11] },
        { name: 'Clearing fires', catalogue: [44] },
      ],
      sites: ['An Indigenous territory', 'A jaguar corridor', 'Brazil-nut groves', 'A headwater stream'],
      fact: {
        text: 'MAAP, a research programme of Amazon Conservation, estimates that 15% of the Amazon biome’s original primary forest had been lost by the end of 2025. A 2018 paper by Nobre and Lovejoy warned that the forest could tip toward savanna at 20–25% deforestation, a threshold that is debated.',
        source: 'MAAP (Amazon Conservation), Amazon tipping point update (October 2026)',
        url: 'https://www.maaproject.org/special-analysis/tipping-point/',
        also: [{ source: 'Nobre and Lovejoy, Science Advances (2018)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5821491/' }, { source: 'Mongabay (January 2020)', url: 'https://news.mongabay.com/2020/01/catastrophic-amazon-tipping-point-less-than-30-years-away-study/' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'la-chytrid', title: 'The Frog Fungus', theme: 'wildlife', arch: 'disease', catalogue: [68, 75],
        blurb: 'A deadly fungus is wiping out frog populations. Quarantine, build assurance colonies and keep habitat connected.',
        threats: ['Chytrid fungus', 'Forest clearing fragments habitat'],
        species: [
          { id: 'harlequin', name: 'Harlequin toad', habitat: ['forest', 'river'] },
          { id: 'golden-frog', name: 'Golden frog', habitat: ['forest', 'river'] },
        ],
        realWorld: 'Clean boots, nets and gear between wetlands, never release pet amphibians into the wild, and support amphibian rescue programmes.',
      },
      driver: 'invasives',
      priority: { severity: 5, urgency: 4, irreversibility: 5, reach: 4 },
      drivers: [
        { name: 'Chytrid fungus (Batrachochytrium dendrobatidis)', catalogue: [68] },
        { name: 'Habitat loss and fragmentation', catalogue: [11] },
        { name: 'Climate stress on mountain amphibians', catalogue: [46] },
      ],
      sites: ['A cloud-forest stream', 'A captive assurance colony', 'The harlequin toads of the Andes', 'The golden frog'],
      fact: {
        text: 'A 2019 study in Science found chytrid fungus has driven declines in at least 501 amphibian species, and 90 of them are thought to be extinct.',
        source: 'Scheele et al., Science (2019)',
        url: 'https://doi.org/10.1126/science.aav0379',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'la-pantanal', title: 'Pantanal on Fire', theme: 'climate', arch: 'fire', catalogue: [44, 45, 4],
        blurb: 'The world’s largest tropical freshwater wetland dries and burns. Cut firebreaks and protect the macaws and marshes.',
        threats: ['Wildfire', 'Clearing for cattle pasture'],
        species: [{ id: 'macaw', name: 'Hyacinth macaw' }],
        realWorld: 'Follow local fire bans, never burn rubbish in dry weather, and support wetland restoration groups and firefighting volunteers.',
      },
      driver: 'climate',
      priority: { severity: 4, urgency: 5, irreversibility: 4, reach: 3 },
      drivers: [
        { name: 'Drought and heat', catalogue: [45] },
        { name: 'Fires set for pasture clearing', catalogue: [44] },
      ],
      sites: ['The northern Pantanal wetlands', 'Hyacinth macaw nesting palms', 'A jaguar refuge'],
      fact: {
        text: 'An INPE-led study estimated that fires in the 2020 drought burned about 30% of the Brazilian Pantanal, the world’s largest tropical freshwater wetland.',
        source: 'Agência FAPESP, on the INPE study of the 2020 Pantanal fires',
        url: 'https://agencia.fapesp.br/in-2020-30-of-the-pantanal-was-burned-to-cinders-by-wildfires/49974',
        also: [{ source: 'Space.com (19 October 2023)', url: 'https://space.com/2020-wildfires-brazil-pantanal-satellite-data' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'la-parana-pine', title: 'The Last Araucaria Forests', theme: 'plants', arch: 'logging', catalogue: [2, 1, 85],
        blurb: 'Logging and conversion have taken almost all of the Paraná pine forest. Guard what remains.',
        threats: ['Illegal logging of old araucaria', 'Conversion to farms and plantations'],
        species: [{ id: 'parana-pine', name: 'Paraná pine' }],
        realWorld: 'Buy only certified timber, and never buy araucaria or other native hardwoods without proof of legal origin.',
      },
      driver: 'land-sea-use',
      priority: { severity: 5, urgency: 3, irreversibility: 5, reach: 2 },
      drivers: [
        { name: 'Illegal logging', catalogue: [2] },
        { name: 'Conversion to farms and pine plantations', catalogue: [1, 21] },
      ],
      sites: ['An old-growth araucaria grove', 'A seed bank of Paraná pine'],
      fact: {
        text: 'The Paraná pine (Araucaria angustifolia) is Critically Endangered: logging, farming and plantations are estimated to have wiped out about 97% of its habitat.',
        source: 'Royal Botanic Garden Edinburgh, Threatened Conifers (IUCN Conifer Specialist Group assessment)',
        url: 'https://threatenedconifers.rbge.org.uk/conifers/araucaria-angustifolia',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'la-humboldt', title: 'Fleets off the Galápagos', theme: 'ocean', arch: 'fishing', catalogue: [23, 24, 25],
        blurb: 'Distant-water fleets work the waters off the Galápagos reserve. Enforce, campaign and protect.',
        threats: ['Distant-water fishing fleet', 'Longline bycatch'],
        species: [
          { id: 'hammerhead', name: 'Scalloped hammerhead shark' },
          { id: 'fur-seal', name: 'Galápagos fur seal', habitat: ['ocean'] },
        ],
        realWorld: 'Choose seafood with credible sustainability certification (such as MSC) or from a local guide such as a national seafood-sustainability list, and ask where it was caught.',
      },
      driver: 'exploitation',
      priority: { severity: 4, urgency: 4, irreversibility: 3, reach: 5 },
      drivers: [
        { name: 'Industrial squid and tuna fleets', catalogue: [23, 24] },
        { name: 'Illegal, unreported and unregulated fishing', catalogue: [24, 88] },
        { name: 'Longline bycatch of sharks and turtles', catalogue: [25] },
      ],
      sites: ['The Galápagos Marine Reserve', 'Hammerhead nursery bays', 'The Humboldt Current upwelling'],
      fact: {
        text: 'In 2020 Oceana tracked nearly 300 Chinese vessels fishing mainly for squid in the waters off the Galápagos Marine Reserve.',
        source: 'Oceana (2020)',
        url: 'https://usa.oceana.org/press-releases/new-oceana-analysis-finds-300-chinese-vessels-pillaging-galapagos-squid/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'la-mercury', title: 'Gold and Mercury', theme: 'freshwater', arch: 'mining', catalogue: [13, 55, 91],
        blurb: 'Small-scale gold mining is the world’s largest source of mercury pollution to air. Back communities, stand up to miners safely and clean the water.',
        threats: ['Illegal mining claims', 'Mercury from gold processing'],
        species: [
          { id: 'giant-otter', name: 'Giant otter', habitat: ['river', 'lake'] },
          { id: 'arapaima', name: 'Arapaima', habitat: ['forest', 'river'] },
        ],
        realWorld: 'Ask jewellers where their gold comes from and prefer recycled or independently certified gold, and support Indigenous-led monitoring groups.',
      },
      driver: 'pollution',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 },
      drivers: [
        { name: 'Illegal gold-mining claims', catalogue: [13] },
        { name: 'Mercury used to separate gold', catalogue: [55] },
        { name: 'Threats to land and water defenders', catalogue: [91] },
      ],
      sites: ['An Indigenous river territory', 'Giant otter dens', 'Arapaima spawning lakes'],
      fact: {
        text: 'Artisanal and small-scale gold mining accounts for about 38% of human mercury emissions to air in UNEP’s 2018 assessment, the largest single source.',
        source: 'Review in Ambio (2023) of UNEP’s Global Mercury Assessment 2018',
        url: 'https://link.springer.com/10.1007/s13280-023-01843-2',
        also: [{ source: 'The Conversation chart of UNEP data', url: 'https://datawrapper.dwcdn.net/ULv9b/3/' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'la-pesticides', title: 'Runoff in the Soy Belt', theme: 'pollution', arch: 'poison', catalogue: [52, 51, 74],
        blurb: 'Pesticides from farm fields end up in the rivers of the soy belt. Test, ban and clean.',
        threats: ['Accumulating pesticides', 'Field runoff into rivers'],
        species: [
          { id: 'jabiru', name: 'Jabiru stork', habitat: ['wetland', 'river'] },
          { id: 'capybara', name: 'Capybara', habitat: ['wetland', 'forest'] },
        ],
        realWorld: 'Buy organic or agroecological produce where you can, avoid garden pesticides, and ask suppliers to cut pesticide use.',
      },
      driver: 'pollution',
      priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 4 },
      drivers: [
        { name: 'Herbicide and fungicide runoff', catalogue: [52] },
        { name: 'Soil erosion carrying chemicals to rivers', catalogue: [18, 51] },
        { name: 'Pesticides harming pollinators', catalogue: [52, 74] },
      ],
      sites: ['A soy-belt river', 'Wetland margins', 'Stingless bee colonies'],
      fact: {
        text: 'A 2020 study of the Guaporé River catchment in southern Brazil found river water contaminated with many pesticides, with more fungicide in soybean areas.',
        source: 'Environmental Science and Pollution Research (2020)',
        url: 'https://link.springer.com/10.1007/s11356-019-06550-8',
        checked: CHECKED,
      },
    },
  ],
  tier2: [
    { id: 'la-cerrado', title: 'Cerrado savanna conversion', theme: 'land', driver: 'land-sea-use', priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 }, catalogue: [3], drivers: [{ name: 'Soy and cattle expansion' }, { name: 'Weak protection of savanna' }], sites: ['Cerrado headwaters', 'Maned wolf habitat'] },
    { id: 'la-lithium', title: 'Lithium salt flats in the Andes', theme: 'land', driver: 'land-sea-use', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [14, 95], drivers: [{ name: 'Brine extraction for batteries' }, { name: 'Water use in a dry basin' }], sites: ['Flamingo lagoons', 'Indigenous water rights'] },
    { id: 'la-sharks', title: 'Shark finning in the Galápagos', theme: 'ocean', driver: 'exploitation', priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 4 }, catalogue: [27], drivers: [{ name: 'Fin trade' }, { name: 'Longline fleets' }], sites: ['Darwin and Wolf islands'] },
    { id: 'la-goats', title: 'Feral goats and invasives on islands', theme: 'wildlife', driver: 'invasives', priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 2 }, catalogue: [72], drivers: [{ name: 'Introduced goats and pigs' }, { name: 'Invasive plants' }], sites: ['Giant tortoise highlands'] },
    { id: 'la-turtles', title: 'Sea turtles of the Caribbean', theme: 'wildlife', driver: 'exploitation', priority: { severity: 4, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [79, 60], drivers: [{ name: 'Beach lighting' }, { name: 'Net bycatch' }, { name: 'Nesting-beach development' }], sites: ['Nesting beaches'] },
    { id: 'la-lionfish', title: 'Lionfish on Caribbean reefs', theme: 'ocean', driver: 'invasives', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 3 }, catalogue: [66], drivers: [{ name: 'Introduced predator' }], sites: ['Mesoamerican reef'] },
    { id: 'la-jaguar', title: 'Jaguars and ranchers', theme: 'wildlife', driver: 'land-sea-use', priority: { severity: 3, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [81], drivers: [{ name: 'Livestock conflict' }, { name: 'Habitat fragmentation' }], sites: ['Jaguar corridor'] },
    { id: 'la-andes-shift', title: 'The escalator to extinction in the Andes', theme: 'climate', driver: 'climate', priority: { severity: 4, urgency: 3, irreversibility: 4, reach: 3 }, catalogue: [46], drivers: [{ name: 'Warming pushes species uphill' }], sites: ['Cloud forests', 'Spectacled bear range'] },
    { id: 'la-tourism', title: 'Overtourism in the Galápagos', theme: 'ocean', driver: 'indirect', priority: { severity: 2, urgency: 3, irreversibility: 2, reach: 2 }, catalogue: [93], drivers: [{ name: 'Visitor pressure' }, { name: 'Invasive species via cargo' }], sites: ['Visitor sites'] },
  ],
};

export default spec;
