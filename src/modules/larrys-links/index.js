import { addStyles, getCurrentLocation, makeElement, onNavigation } from '@utils';

import linksData from './links.json';

import settings from './settings';
import styles from './styles.css';

const addLinks = (links, container) => {
  const existingLinks = document.querySelector('.mh-improved-larrys-links');
  if (existingLinks) {
    existingLinks.remove();
  }

  const linksContainer = makeElement('div', ['mh-improved-larrys-links']);
  makeElement('h3', ['campPage-tabs-tabContent-larryTip-environment', 'mh-improved-larrys-links-title'], 'Larry\'s Links', linksContainer);

  const linksList = makeElement('ul');

  links.forEach((link) => {
    const linkItem = makeElement('li');

    const linkEl = makeElement('a', '', link.text);
    linkEl.href = link.url;
    linkEl.target = '_larrys_links';
    linkEl.rel = 'noopener noreferrer';

    linkItem.append(linkEl);
    linksList.append(linkItem);
  });

  linksContainer.append(linksList);
  container.append(linksContainer);
};

const main = () => {
  const larryContainer = document.querySelector('.campPage-tabs-tabContent-larryTip-container');
  if (! larryContainer) {
    return;
  }

  if (! linksData && linksData[getCurrentLocation()]) {
    return;
  }

  addLinks(linksData[getCurrentLocation()], larryContainer);

  console.log('larrys-links: main', larryContainer);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);
  onNavigation(main, {
    page: 'camp',
    onLoad: true,
  });
};

export default {
  id: 'larrys-links',
  name: 'Larry\'s Links',
  type: 'feature',
  default: true,
  description: 'This is a template for creating new modules.',
  load: init,
  settings,
};
