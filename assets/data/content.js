export const sources = {
  village: { title: 'Saggart Village', url: 'https://www.sdcc.ie/en/services/tourism/our-villages/saggart-village/', publisher: 'South Dublin County Council' },
  neighbourhood: { title: 'Citywest, Saggart, Rathcoole, Newcastle', url: 'https://www.sdcc.ie/en/devplan2022/implementation/citywest-saggart-rathcoole-newcastle/', publisher: 'South Dublin County Council' },
  heritage: { title: 'South Dublin County Heritage Plan', url: 'https://www.sdcc.ie/en/services/planning-building-control/heritage-and-conservation/heritage-plan-2010-2015.pdf', publisher: 'South Dublin County Council' },
  areaPlan: { title: 'Mill Road, Saggart Area Plan', url: 'https://www.sdcc.ie/en/services/planning/local-area-plans/non-statutory-plans/existing/saggart/mill-road-saggart-area-plan.pdf', publisher: 'South Dublin County Council' },
  fortunestown: { title: 'Fortunestown Local Area Plan', url: 'https://www.sdcc.ie/en/services/planning-building-control/local-area-plans/existing/fortunestown/fortunestown-lap-2012.pdf', publisher: 'South Dublin County Council' },
  growth: { title: 'Saggart — Self-Sustaining Town', url: 'https://www.sdcc.ie/en/devplan2022/adopted-plan/county-development-plan-written-statement/county-development-plan-written-statement1.pdf', publisher: 'South Dublin County Council' },
  walking: { title: 'Walking and Hiking', url: 'https://www.sdcc.ie/en/services/tourism/activities/the-dublin-mountains/walking-and-hiking/', publisher: 'South Dublin County Council' },
  community: { title: 'Community Development', url: 'https://www.sdcc.ie/en/services/community/community-development/', publisher: 'South Dublin County Council' },
  logainm: { title: 'Teach Sagard / Saggart', url: 'https://www.logainm.ie/en/57080', publisher: 'Placenames Database of Ireland' }
};

export const learningSections = [
  { id: 'place', title: 'Place and identity', intro: 'Meet two connected communities at the meeting point of historic village, growing neighbourhood and Dublin Mountains landscape.', items: [
    { title: 'Saggart village', scope: 'Historic village', body: 'Saggart is an historic village in the foothills of the Dublin Mountains, south of the N7. Its village form, older buildings and long history of milling remain important to local identity.', source: 'village' },
    { title: 'Citywest and Fortunestown', scope: 'Growing urban area', body: 'Citywest and Fortunestown form a newer residential and employment district east of Saggart. Planning for the area connects housing growth with public transport, services and public spaces.', source: 'neighbourhood' },
    { title: 'Teach Sagard', scope: 'Irish place name', body: 'The Placenames Database of Ireland records Teach Sagard as the Irish form of Saggart. Using official place names helps preserve the language and history carried by the landscape.', source: 'logainm' }
  ] },
  { id: 'heritage', title: 'History and heritage', intro: 'Local heritage reaches from early Christian tradition and old routes to mills, graveyards and protected village landmarks.', items: [
    { title: 'An early Christian story', scope: 'Historical tradition', body: 'Saggart is said to take its name from Saint Sacer, also recorded as Mosacer or Mosacra, who is traditionally associated with a seventh-century monastery in the area.', source: 'heritage' },
    { title: 'Crosses and burial ground', scope: 'Saggart village', body: 'Stone crosses attributed to the early Christian period can be seen in the graveyard in Saggart village, making it an important surviving link with the area’s long history.', source: 'heritage' },
    { title: 'Milling and village life', scope: 'Local industry', body: 'Saggart has a long association with milling. That working history forms part of the village story alongside its main street, church, houses and routes through southwest County Dublin.', source: 'village' }
  ] },
  { id: 'connections', title: 'Growth and connections', intro: 'Transport, employment and careful planning connect the historic village with a rapidly growing metropolitan neighbourhood.', items: [
    { title: 'The Luas Red Line', scope: 'Public transport', body: 'The neighbourhood is served by Saggart, Fortunestown and Citywest Campus Luas stops, providing links through Tallaght to Dublin city centre and the Docklands.', source: 'neighbourhood' },
    { title: 'Homes, jobs and services', scope: 'Planning', body: 'Citywest Business Campus and nearby employment areas play an important economic role. Sustainable growth also depends on community facilities, shops, schools and accessible public space.', source: 'neighbourhood' },
    { title: 'A connected village', scope: 'Saggart', body: 'County planning describes Saggart as closely connected to growing Citywest and Fortunestown while emphasizing development that strengthens the village core and supports walking and cycling.', source: 'growth' }
  ] },
  { id: 'nature', title: 'Nature and landscape', intro: 'The foothills, valleys, hedgerows and parks provide habitat, recreation and a distinctive setting for both communities.', items: [
    { title: 'Dublin Mountains foothills', scope: 'Landscape', body: 'Saggart sits at the foothills of the Dublin Mountains. Nearby routes provide outdoor access and broad views across the city and county.', source: 'village' },
    { title: 'Saggart Hill loop', scope: 'Walking', body: 'The waymarked Saggart Hill loop is approximately 3.8 kilometres and graded easy by South Dublin County Council’s walking guidance.', source: 'walking' },
    { title: 'Slade Valley and green links', scope: 'Biodiversity', body: 'Council planning identifies Slade of Saggart and Crooksling Glen for their natural heritage value and highlights hedgerows as ecological and historic connections across the landscape.', source: 'neighbourhood' }
  ] },
  { id: 'community', title: 'Community and belonging', intro: 'Belonging grows through shared facilities, inclusive services, local knowledge and participation in the future of the area.', items: [
    { title: 'Shared community infrastructure', scope: 'Local services', body: 'Parks, playgrounds and community centres help turn new development into sustainable neighbourhoods. Council planning identifies facilities such as Carrigmore Green, Citywest playground and Saggart Community Centre.', source: 'neighbourhood' },
    { title: 'Inclusive community development', scope: 'Public service', body: 'South Dublin County Council’s community team works with young people, older people, minority communities, voluntary groups and public agencies to support inclusive local communities.', source: 'community' },
    { title: 'Explore primary sources', scope: 'Continue learning', body: 'Use the Council’s village, planning, heritage and walking resources together with Logainm.ie to explore how local history and future development connect.', source: 'village' }
  ] }
];

export const reviewedAt = '2026-08-14';
