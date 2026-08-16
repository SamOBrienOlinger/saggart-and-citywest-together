const toggle=document.querySelector('.nav-toggle');const menu=document.querySelector('#site-menu');const toggleLabel=toggle?.querySelector('[aria-hidden="true"]');
const setMenuState=open=>{if(!toggle||!menu)return;toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);if(toggleLabel)toggleLabel.textContent=open?'Close':'Menu'};
if(toggle&&menu){setMenuState(false);toggle.addEventListener('click',()=>setMenuState(toggle.getAttribute('aria-expanded')!=='true'));menu.addEventListener('click',event=>{if(event.target.closest('a'))setMenuState(false)});window.addEventListener('resize',()=>{if(window.innerWidth>760)setMenuState(false)})}
if(toggle&&menu){document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setMenuState(false);toggle.focus()}})}
const page=document.body.dataset.page;const current=document.querySelector(`[data-nav="${page}"]`);if(current)current.setAttribute('aria-current','page');
document.querySelectorAll('a[target="_blank"]').forEach(link=>{link.rel='noopener noreferrer'});

const navigationLabels={home:'Home',learn:'Explore the area',quiz:'Take the quiz',about:'About us',contact:'Get in touch'};
document.querySelectorAll('[data-nav]').forEach(link=>{const label=navigationLabels[link.dataset.nav];if(label)link.textContent=label});

const plainEnglishHeadings={
  'Made for everyone curious about the area':'Choose how you want to explore',
  'Learn':'Explore the area',
  'Test yourself':'Take the quiz',
  'Connect':'Find local links',
  'Begin with place, heritage and community':'Explore Saggart and Citywest',
  'Local residents working together':'Meet Saggart & Citywest Together',
  'How well do you know Saggart and Citywest?':'Put your local knowledge to the test',
  'Know the place. Meet the stories.':'Explore Saggart and Citywest',
  'Ready to test your knowledge?':'Try the 10-question quiz',
  'Community grows through collective action':'About Saggart & Citywest Together',
  'Our purpose':'What we do',
  'A place shaped by movement':'How the area has changed',
  'Our anti-racism approach':'How we challenge racism',
  'About this learning project':'About this website',
  'Editorial approach':'How we check our content',
  'Connect with us':'Get in touch',
  'Primary source register':'Sources we use',
  'Brand and status':'Who runs this website',
  'Help us make this resource better':'Contact us or suggest a correction',
  'Contact the organisation':'Contact SaCT directly',
  'Experiencing or witnessing racism?':'Report racism and find support',
  'A minimal-data prototype':'How this website uses your data',
  'Quiz storage':'Your quiz score',
  'Contact demonstration':'The contact form',
  'Analytics and cookies':'Cookies and analytics',
  'External links':'Links to other websites',
  'Before you begin':'How the quiz works'
};
document.querySelectorAll('h1,h2,h3').forEach(heading=>{const replacement=plainEnglishHeadings[heading.textContent.trim()];if(replacement)heading.textContent=replacement});

const sectionLabels={'Start exploring':'Start here','Featured learning':'Discover the area','About SaCT':'About the group','Ready to play?':'Quick challenge','Learning hub':'Local guide','Put learning into practice':'Next step','Knowledge quiz':'Local quiz','Contact and corrections':'Contact'};
document.querySelectorAll('.eyebrow').forEach(label=>{const replacement=sectionLabels[label.textContent.trim()];if(replacement)label.textContent=replacement});

document.querySelectorAll('.site-footer h2').forEach(heading=>{if(heading.textContent.trim()==='Explore')heading.textContent='Quick links';if(['Connect','Find local links'].includes(heading.textContent.trim()))heading.textContent='Follow and contact'});
document.querySelectorAll('.site-footer a').forEach(link=>{const label=link.textContent.trim();if(label==='Learn')link.textContent='Explore the area';if(label==='Quiz')link.textContent='Take the quiz';if(label==='About')link.textContent='About us'});
document.querySelectorAll('.site-footer ul').forEach(list=>{if(!list.querySelector('a[href="accessibility.html"]')){const item=document.createElement('li');const link=document.createElement('a');link.href='accessibility.html';link.textContent='Accessibility';item.append(link);list.append(item)}});

const topicNavigation=document.querySelector('.topic-nav');
if(topicNavigation){const label=document.createElement('p');label.className='topic-nav-label';label.textContent='On this page';topicNavigation.before(label)}

if(page==='about'){
  const aboutSections=[
    ['What we do','what-we-do'],['How we work','our-work'],['How the area has changed','area-changed'],
    ['How we challenge racism','challenge-racism'],['About this website','about-website'],['Sources we use','sources']
  ];
  const headings=[...document.querySelectorAll('.prose h2')];
  aboutSections.forEach(([text,id])=>{const heading=headings.find(item=>item.textContent.trim()===text);if(heading)heading.id=id});
  const available=aboutSections.filter(([,id])=>document.getElementById(id));
  const hero=document.querySelector('.page-hero');
  if(hero&&available.length){const wrapper=document.createElement('div');wrapper.className='container page-jump-wrap';const label=document.createElement('p');label.className='topic-nav-label';label.textContent='On this page';const nav=document.createElement('nav');nav.className='topic-nav page-jump-nav';nav.setAttribute('aria-label','Sections on this page');available.forEach(([text,id])=>{const link=document.createElement('a');link.href=`#${id}`;link.textContent=text;nav.append(link)});wrapper.append(label,nav);hero.after(wrapper)}
}
