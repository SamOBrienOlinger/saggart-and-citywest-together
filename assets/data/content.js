export const sources = {
  village: { title: 'Saggart Village', url: 'https://www.sdcc.ie/en/services/tourism/our-villages/saggart-village/', publisher: 'South Dublin County Council' },
  neighbourhood: { title: 'Citywest, Saggart, Rathcoole, Newcastle', url: 'https://www.sdcc.ie/en/devplan2022/implementation/citywest-saggart-rathcoole-newcastle/', publisher: 'South Dublin County Council' },
  heritage: { title: 'South Dublin County Heritage Plan', url: 'https://www.sdcc.ie/en/services/planning-building-control/heritage-and-conservation/heritage-plan-2010-2015.pdf', publisher: 'South Dublin County Council' },
  areaPlan: { title: 'Mill Road, Saggart Area Plan', url: 'https://www.sdcc.ie/en/services/planning/local-area-plans/non-statutory-plans/existing/saggart/mill-road-saggart-area-plan.pdf', publisher: 'South Dublin County Council' },
  fortunestown: { title: 'Fortunestown Local Area Plan', url: 'https://www.sdcc.ie/en/services/planning-building-control/local-area-plans/existing/fortunestown/fortunestown-lap-2012.pdf', publisher: 'South Dublin County Council' },
  growth: { title: 'Saggart — Self-Sustaining Town', url: 'https://www.sdcc.ie/en/devplan2022/adopted-plan/county-development-plan-written-statement/county-development-plan-written-statement1.pdf', publisher: 'South Dublin County Council' },
  walking: { title: 'Walking and Hiking', url: 'https://www.sdcc.ie/en/services/tourism/activities/the-dublin-mountains/walking-and-hiking/', publisher: 'South Dublin County Council' },
  community: { title: 'Community Development', url: 'https://www.sdcc.ie/en/services/community/community-development/', publisher: 'South Dublin County Council' },
  logainm: { title: 'Teach Sagard / Saggart', url: 'https://www.logainm.ie/en/57080', publisher: 'Placenames Database of Ireland' },
  inar: { title: 'Learn About Racism in Ireland', url: 'https://inar.ie/racism-in-ireland/learn-about-racism/', publisher: 'Irish Network Against Racism' },
  reportRacism: { title: 'Responding to Racism Guide', url: 'https://inar.ie/reporting-racism-in-ireland/', publisher: 'Irish Network Against Racism' },
  csoPopulation: { title: 'Census 2022 Profile 1 — Population Distribution', url: 'https://www.cso.ie/en/releasesandpublications/ep/p-cpp1/censusofpopulation2022profile1-populationdistributionandmovements/populationdistribution/', publisher: 'Central Statistics Office' },
  csoAge: { title: 'Census 2022 Table F4014 — Population by Age Group and Town', url: 'https://data.cso.ie/table/F4014', publisher: 'Central Statistics Office' },
  csoHouseholds: { title: 'Census 2022 Profile 3 — Households, Families and Childcare: Dublin', url: 'https://www.cso.ie/en/csolatestnews/pressreleases/2023pressreleases/pressstatementcensus2022resultsprofile3-householdsfamiliesandchildcaredublin/', publisher: 'Central Statistics Office' },
  csoMap: { title: 'Census 2022 Interactive Map', url: 'https://visual.cso.ie/?body=entity%2Fima%2Fcop%2F2022', publisher: 'Central Statistics Office' },
  tallaghtGarda: { title: 'Tallaght Garda Station', url: 'https://www.garda.ie/en/contact-us/station-directory/tallaght.html', publisher: 'An Garda Síochána' },
  kildareGarda: { title: 'Kildare Garda Station', url: 'https://www.garda.ie/en/contact-us/station-directory/kildare.html', publisher: 'An Garda Síochána' },
  rathcooleGarda: { title: 'Rathcoole Garda Station', url: 'https://www.garda.ie/en/contact-us/station-directory/rathcoole.html', publisher: 'An Garda Síochána' },
  schoolhouse: { title: 'Saggart Schoolhouse Community Centre', url: 'https://www.sdcc.ie/en/services/community/community-centres/saggart-schoolhouse-community-centre/', publisher: 'South Dublin County Council' },
  stMarys: { title: 'St Mary’s GAA contact information', url: 'https://www.facebook.com/p/St-Marys-GAA-100077974162822/', publisher: 'St Mary’s GAA' }
};

export const learningSections = [
  { id: 'place', title: 'Place and identity', intro: 'Meet two connected communities at the meeting point of historic village, growing neighbourhood and Dublin Mountains landscape.', items: [
    { title: 'Saggart village', scope: 'Historic village', body: 'Saggart is an historic village in the foothills of the Dublin Mountains, south of the N7. Its village form, older buildings and long history of milling remain important to local identity.', source: 'village' },
    { title: 'Citywest and Fortunestown', scope: 'Growing urban area', body: 'Citywest and Fortunestown form a newer residential and employment district east of Saggart. Planning for the area connects housing growth with public transport, services and public spaces.', source: 'neighbourhood' },
    { title: 'Teach Sagard', scope: 'Irish place name', body: 'The Placenames Database of Ireland records Teach Sagard as the Irish form of Saggart. Using official place names helps preserve the language and history carried by the landscape.', source: 'logainm' }
  ] },
  { id: 'people', title: 'People and population', intro: 'Census figures give a useful snapshot of who lives locally, while clearly defined statistical boundaries keep comparisons accurate.', items: [
    { title: 'A young local population', scope: 'Saggart Built Up Area', body: 'Census 2022 counted 4,573 people in the Saggart Built Up Area. Its average age was 30.4 years, making Saggart the youngest Irish town in the 1,500 to 10,000 population category. The CSO boundary is a statistical area and does not exactly match the full Saggart and Citywest community catchment.', source: 'csoPopulation' },
    { title: 'Age cohorts', scope: 'Saggart Built Up Area', body: 'Of the 4,573 people counted, 1,529 were aged under 15 (33.4%), 377 were 15–24 (8.2%), 1,594 were 25–44 (34.9%), 795 were 45–64 (17.4%) and 278 were 65 or older (6.1%). Percentages are calculated from the CSO’s five-year age groups and rounded to one decimal place.', source: 'csoAge' },
    { title: 'Families and households', scope: 'South Dublin context', body: 'Across South Dublin, Census 2022 recorded 76,623 families, an average of 1.41 children per family and an average household size of 2.97 people. These county-level figures provide context; they are not estimates for Saggart or Citywest alone.', source: 'csoHouseholds' },
    { title: 'Explore your neighbourhood', scope: 'Small Area data', body: 'Citywest is not separately named in the CSO town table used for this snapshot. The Census interactive map lets you explore published data at neighbourhood and Small Area level without combining overlapping geographic units.', source: 'csoMap' }
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
    { title: 'Equal and inclusive participation', scope: 'Community development', body: 'Inclusive community development should support equal participation across age groups and backgrounds, including minority ethnic communities, and remove barriers to local services and decision-making.', source: 'community' },
    { title: 'Responding to racism', scope: 'Anti-racism', body: 'Racism can be individual, institutional or structural. INAR provides guidance for people who experience or witness racism, including how to seek support, report incidents and take action as a community.', source: 'reportRacism' },
    { title: 'Explore primary sources', scope: 'Continue learning', body: 'Use the Council’s village, planning, heritage and walking resources together with Logainm.ie and INAR’s anti-racism resources to explore local history, equality and community participation.', source: 'inar' }
  ] },
  { id: 'resources', title: 'Local contacts and resources', intro: '<strong>In an emergency, call 999 or 112.</strong> Use the station and organisation numbers below for non-emergency contact and local information.', items: [
    { title: 'Rathcoole Garda Station', scope: 'An Garda Síochána', body: 'Main Street, Rathcoole, Co. Dublin, D24 YF22. Phone: <a href="tel:+35316667900">01 666 7900</a>.', source: 'rathcooleGarda' },
    { title: 'Tallaght Garda Station', scope: 'An Garda Síochána', body: 'Belgard Road East, Tallaght, Dublin 24, D24 K796. Phone: <a href="tel:+35316666000">01 666 6000</a>.', source: 'tallaghtGarda' },
    { title: 'Kildare Garda Station', scope: 'An Garda Síochána', body: 'Dublin Road, Kildare, Co. Kildare, R51 VA48. Phone: <a href="tel:+35345527730">045 527730</a>.', source: 'kildareGarda' },
    { title: 'Saggart Schoolhouse Community Centre', scope: 'Community facilities', body: 'School Road, Saggart, Co. Dublin, D24 V04D. The centre offers a café, classes, youth and older-person activities, community meetings and rentable spaces. Phone: <a href="tel:+35315782377">01 578 2377</a>. Email: <a href="mailto:info@schoolhouse.onmicrosoft.com">info@schoolhouse.onmicrosoft.com</a>.', source: 'schoolhouse' },
    { title: 'St Mary’s GAA Club', scope: 'Sport and community', body: 'St Mary’s serves the Saggart, Rathcoole and Citywest area from Páirc Mhuire in Saggart. Phone: <a href="tel:+353868371963">086 837 1963</a>. Email: <a href="mailto:pro.stmarys.dublin@gaa.ie">pro.stmarys.dublin@gaa.ie</a>. <a href="https://stmarysgaasaggart.clubzap.com/" target="_blank" rel="noopener noreferrer">Visit the club website <span class="sr-only">(opens in a new tab)</span></a>.', source: 'stMarys' }
  ] }
];

export const reviewedAt = '2026-08-18';
