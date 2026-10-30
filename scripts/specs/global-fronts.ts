import type { RegionSpec } from './types';

const CHECKED = '2026-10-29';

const spec: RegionSpec = {
  id: 'global-fronts',
  code: 'gf',
  name: 'Global Fronts',
  blurb: 'Problems no region owns: emissions, plastics, nitrogen, wildlife trade, subsidies and the high seas. They spread along trade routes, so they are won with treaties and rules; the last mission shows a treaty that worked.',
  tier1: [
    {
      mission: {
        id: 'gf-emissions', title: 'The Carbon Budget', theme: 'climate', arch: 'network', catalogue: [36, 48, 47],
        blurb: 'Emissions follow the supply chains of fossil energy and keep warming the climate. Shut the routes, restore the sinks and win the policy case.',
        threats: ['Emissions spreading along fossil supply chains', 'Heat and fire reaching the refuges'],
        species: [{ id: 'forest-elephant', name: 'Forest elephant', habitat: ['forest'] }],
        labels: { restore: 'Restore a carbon sink', defend: 'Efficiency standard', remove: 'Close a coal plant', protect: 'Carbon-sink reserve', campaign: 'Climate-policy campaign' },
        realWorld: 'Cut the energy you use at home and when you travel, back policies that phase out fossil fuels, and ask where your bank and pension invest.',
      },
      driver: 'climate',
      priority: { severity: 5, urgency: 5, irreversibility: 5, reach: 5 },
      drivers: [
        { name: 'Burning coal, oil and gas', catalogue: [36] },
        { name: 'Tipping points such as forest dieback and ocean-circulation change', catalogue: [48] },
        { name: 'Seasons out of step with flowers and pollinators', catalogue: [47] },
      ],
      sites: ['A coal-fired power plant', 'A forest that stores carbon', 'A tipping-point region'],
      fact: {
        text: 'The Global Carbon Budget 2025 projected 38.1 billion tonnes of fossil CO2 emissions for 2025, about 1% more than in 2024 and a record high. It put the remaining carbon budget for a 50% chance of limiting warming to 1.5°C at 170 billion tonnes of CO2, nearly exhausted: around four years at 2025 emission levels.',
        source: 'Global Carbon Project, Global Carbon Budget 2025, Earth System Science Data (13 May 2026)',
        url: 'https://essd.copernicus.org/articles/18/3211/2026/',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'gf-plastics', title: 'The Plastics Treaty', theme: 'pollution', arch: 'plume', catalogue: [49, 86],
        blurb: 'Plastic keeps flowing into the sea, and there is still no global treaty to stop it at the source. Clean the water, cut the flow and win the treaty.',
        threats: ['Plastic flowing from rivers and coasts'],
        species: [{ id: 'albatross', name: 'Albatross', habitat: ['ocean'] }],
        map: { base: 'ocean', accent: 'reef', accentAmount: 0.2, pressure: ['town'], side: 'n', river: false, depth: 4 },
        labels: { restore: 'Restore clean water', defend: 'Collection booms', remove: 'Haul out debris', protect: 'Plastic-free reserve', campaign: 'Global treaty campaign' },
        realWorld: 'Choose reusable over single-use plastic, support a legally binding global plastics treaty, and join a local cleanup.',
      },
      driver: 'pollution',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 5 },
      drivers: [
        { name: 'Single-use plastic and packaging', catalogue: [49] },
        { name: 'Overconsumption and waste', catalogue: [86] },
        { name: 'No agreed global rule on production', catalogue: [94] },
      ],
      sites: ['A river mouth', 'A garbage patch in an ocean gyre', 'A beach that collects debris'],
      fact: {
        text: 'Talks in Geneva on a global plastic pollution treaty ended on 15 August 2025 with no agreed text, after the chair’s 13 August draft was rejected by many countries.',
        source: 'Down To Earth, on the Geneva plastics treaty talks (INC-5.2)',
        url: 'https://www.downtoearth.org.in/waste/consensus-fails-to-unlock-global-plastic-treaty-negotiations-in-geneva',
        also: [{ source: 'News Agency of Nigeria (15 August 2025)', url: 'https://nannews.ng/?p=292143' }, { source: 'Packaging Insights (15 August 2025)', url: 'https://www.packaginginsights.com/news/inc-5-2-plastic-treaty-failure.html' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'gf-nitrogen', title: 'The Nitrogen Problem', theme: 'freshwater', arch: 'poison', catalogue: [51, 86],
        blurb: 'More than half of the nitrogen added to farmland is lost to the environment. Buffer the farms, clean the water and cut the waste.',
        threats: ['Fertiliser runoff', 'Manure and food-waste inflows'],
        species: [{ id: 'freshwater-mussel', name: 'Freshwater mussel', habitat: ['river', 'lake'] }],
        labels: { restore: 'Rebuild wetland', defend: 'Precision fertilising', remove: 'Clean up a spill', protect: 'Riverside buffer', campaign: 'Nutrient-cut campaign' },
        realWorld: 'Waste less food, eat a little less meat and dairy, and support farms and policies that cut fertiliser losses.',
      },
      driver: 'pollution',
      priority: { severity: 4, urgency: 3, irreversibility: 3, reach: 5 },
      drivers: [
        { name: 'Fertiliser applied beyond what crops use', catalogue: [51] },
        { name: 'Food waste and overconsumption', catalogue: [86] },
        { name: 'Drained wetlands that no longer filter water', catalogue: [4] },
      ],
      sites: ['A river basin downstream of farmland', 'A lake with algae blooms', 'A coastal dead zone'],
      fact: {
        text: 'A 2014 study found that only 47% of the reactive nitrogen added to the world’s cropland is converted into harvested products, and that more than half is lost to the environment. Our World in Data likewise reports that less than half of the nutrients applied as fertiliser are taken up by crops globally.',
        source: 'Lassaletta et al., Environmental Research Letters (2014)',
        url: 'https://iopscience.iop.org/article/10.1088/1748-9326/9/10/105011',
        also: [{ source: 'Our World in Data, “Excess fertilizer”', url: 'https://ourworldindata.org/excess-fertilizer' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'gf-wildlife-trade', title: 'The Routes of Wildlife Crime', theme: 'wildlife', arch: 'network', catalogue: [29, 73],
        blurb: 'Illegally caught wildlife can slip into legal trade flows, and the trade can spread disease. Shut the routes and break the networks.',
        threats: ['Trade routes spreading from ports and roads', 'Traffickers hunting the animals'],
        species: [{ id: 'pangolin', name: 'Pangolin', habitat: ['forest'] }],
        labels: { restore: 'Restore habitat', defend: 'Customs inspection', remove: 'Shut a trafficking route', protect: 'Protected area', campaign: 'Trade-ban campaign' },
        realWorld: 'Never buy products made from wild animals or plants without legal proof of origin, report suspicious online wildlife sales, and support the groups that train customs and rangers.',
      },
      driver: 'exploitation',
      priority: { severity: 4, urgency: 4, irreversibility: 5, reach: 4 },
      drivers: [
        { name: 'Global demand for scales, horn, ivory and pets', catalogue: [29] },
        { name: 'Disease crossing from wildlife to people', catalogue: [73] },
        { name: 'Weak enforcement along trade routes', catalogue: [88] },
      ],
      sites: ['A trafficking port', 'A wildlife market', 'A forest corridor'],
      fact: {
        text: 'The UNODC World Wildlife Crime Report 2024 analysed over 140,000 records of wildlife seizures from 2015 to 2021, which document illegal trade in 162 countries and territories affecting around 4,000 plant and animal species.',
        source: 'UNODC, World Wildlife Crime Report 2024',
        url: 'https://www.unodc.org/documents/data-and-analysis/wildlife/2024/Wildlife2024_Final.pdf',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'gf-subsidies', title: 'Paying for the Damage', theme: 'land', arch: 'frontier', catalogue: [87, 89],
        blurb: 'Public money props up fossil fuels and harmful fishing. Cut the subsidies and expose the false green claims.',
        threats: ['Subsidised extraction and clearing', 'Cheap fuel and farm support'],
        species: [{ id: 'tiger', name: 'Tiger', habitat: ['forest'] }],
        map: { base: 'forest', accent: 'grass', accentAmount: 0.2, pressure: ['mine', 'farm', 'road'], side: 'n', depth: 6 },
        labels: { restore: 'Replant', defend: 'Subsidy watchdog', remove: 'End a subsidy', protect: 'Protected area', campaign: 'Subsidy-reform campaign' },
        realWorld: 'Ask your representatives to redirect harmful subsidies, and check claims of “net zero” and “carbon neutral” against independent sources before you trust them.',
      },
      driver: 'indirect',
      priority: { severity: 4, urgency: 3, irreversibility: 3, reach: 5 },
      drivers: [
        { name: 'Fossil-fuel subsidies', catalogue: [87] },
        { name: 'Subsidies for destructive fishing and farming', catalogue: [87] },
        { name: 'Greenwashing and false carbon offsets', catalogue: [89] },
      ],
      sites: ['A subsidised mine and road corridor', 'A fishing fleet’s home port', 'A carbon-offset project'],
      fact: {
        text: 'The IMF’s page on fossil fuel subsidies puts explicit subsidies in 2024 at $0.73 trillion (0.6 percent of global GDP) and implicit subsidies at $6.7 trillion (5.8 percent of global GDP).',
        source: 'International Monetary Fund, fossil fuel subsidies',
        url: 'https://www.imf.org/en/topics/climate-change/energy-subsidies',
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'gf-high-seas', title: '30×30 on the High Seas', theme: 'ocean', arch: 'network', catalogue: [94, 38],
        blurb: 'Much of the ocean lies beyond any country’s borders. Hold the shipping and fishing routes back and win a network of high-seas reserves.',
        threats: ['Industrial shipping and fishing spreading from ports', 'Illegal fleets chasing the animals'],
        species: [{ id: 'leatherback', name: 'Leatherback turtle', habitat: ['ocean'] }],
        map: { base: 'ocean', accent: 'reef', accentAmount: 0.2, pressure: ['town'], side: 's', depth: 3 },
        labels: { restore: 'Let the sea recover', defend: 'Patrol the zone', remove: 'Close a shipping route', protect: 'High-seas reserve', campaign: 'Treaty-ratification campaign' },
        realWorld: 'Ask your government to ratify and fund the High Seas Treaty, and choose seafood from fisheries certified as sustainable.',
      },
      driver: 'indirect',
      priority: { severity: 4, urgency: 4, irreversibility: 4, reach: 5 },
      drivers: [
        { name: 'Missed 30×30 targets', catalogue: [94] },
        { name: 'No rules for protected areas on the high seas', catalogue: [94] },
        { name: 'A sea growing more acidic', catalogue: [38] },
      ],
      sites: ['A mid-ocean seamount', 'A turtle migration corridor', 'The Sargasso Sea'],
      fact: {
        text: 'A landmark treaty to safeguard biodiversity in the high seas came into effect on 17 January 2026, with more than 80 ratifications at that point; supporters link it to the aim of bringing 30% of the oceans under formal protection by 2030.',
        source: 'United Nations Treaty Collection, BBNJ Agreement (entry into force 17 January 2026)',
        url: 'https://treaties.un.org/Pages/ViewDetails.aspx?src=TREATY&mtdsg_no=XXI-10&chapter=21&clang=_en',
        also: [{ source: 'High Seas Alliance press release (16 January 2026)', url: 'https://highseasalliance.org/2026/01/16/historic-high-seas-treaty-enters-into-force-launching-a-new-era-of-global-ocean-governance/' }, { source: 'World Resources Institute, High Seas Treaty explainer', url: 'https://www.wri.org/insights/high-seas-treaty-explainer' }],
        checked: CHECKED,
      },
    },
    {
      mission: {
        id: 'gf-ozone', title: 'The Ozone Success Story', theme: 'pollution', arch: 'network', hope: true, catalogue: [],
        blurb: 'A hope mission. In 1987 the world agreed to cut the chemicals that were thinning the ozone layer, with the aim of eliminating them. Close the last routes and see what a treaty that works looks like.',
        threats: ['Ozone-destroying chemicals'],
        species: [{ id: 'common-frog', name: 'Common frog', habitat: ['wetland'] }],
        labels: { restore: 'Restore habitat', defend: 'Customs checks', remove: 'Phase out a chemical', protect: 'Protected area', campaign: 'Montreal Protocol' },
        realWorld: 'Have old fridges, freezers and air-conditioners disposed of through a recycler that recovers their refrigerant, so the gases are not vented.',
      },
      driver: 'pollution',
      priority: { severity: 2, urgency: 1, irreversibility: 2, reach: 5 },
      drivers: [
        { name: 'Chemicals that destroy ozone', catalogue: [] },
        { name: 'A treaty enforced and strengthened over time', catalogue: [] },
      ],
      sites: ['The Antarctic ozone hole', 'A recycled refrigerant plant'],
      fact: {
        text: 'A UN-backed assessment published in October 2026 projects the near-global ozone layer back at 1980 values around 2040 and the Antarctic during the 2060s, provided countries keep complying with the Montreal Protocol, which was signed in September 1987.',
        source: 'WMO/UNEP Scientific Assessment of Ozone Depletion: 2026 (October 2026)',
        url: 'https://ozone.unep.org/sites/default/files/2026-10/OA2026ExecSummary.pdf',
        also: [{ source: 'UNEP Ozone Secretariat, Final Act of the 1987 Montreal conference', url: 'https://ozone.unep.org/system/files/documents/1987_Montreal-Protocol_Final-Act.E.pdf' }],
        checked: CHECKED,
      },
    },
  ],
  tier2: [
    { id: 'gf-methane', title: 'Methane from oil, gas and farms', theme: 'climate', driver: 'climate', priority: { severity: 4, urgency: 4, irreversibility: 3, reach: 5 }, catalogue: [36], drivers: [{ name: 'Leaks from oil and gas wells' }, { name: 'Livestock and rice farming' }], sites: ['A leaking gas field'] },
    { id: 'gf-energy-transition', title: 'Green versus green', theme: 'land', driver: 'indirect', priority: { severity: 3, urgency: 3, irreversibility: 3, reach: 4 }, catalogue: [95, 14], drivers: [{ name: 'Mining for batteries and wind' }, { name: 'Dams for hydropower' }], sites: ['A lithium salt flat'] },
  ],
};

export default spec;
