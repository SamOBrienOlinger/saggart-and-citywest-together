// Native links keep deep links, browser history and keyboard navigation intact.
const topicLinks = [...document.querySelectorAll('.explore-topic[href^="#"]')];
const updateCurrentTopic = () => {
  topicLinks.forEach(link => {
    if (link.hash === window.location.hash) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};
updateCurrentTopic();
window.addEventListener('hashchange', updateCurrentTopic);
