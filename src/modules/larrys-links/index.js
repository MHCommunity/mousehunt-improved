import { addStyles, getCurrentLocation, makeElement, onNavigation } from '@utils';

import linksData from './links.json';

import styles from './styles.css';

const addLinks = (links) => {
  const larryContainer = document.querySelector('.campPage-tabs-tabContent-larryTip-container');
  if (! larryContainer) {
    return;
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

  const existingLinks = document.querySelector('.mh-improved-larrys-links');
  if (existingLinks) {
    existingLinks.replaceWith(linksContainer);
  } else {
    larryContainer.append(linksContainer);
  }
};

const addImages = (images) => {
  const larryContainer = document.querySelector('.campPage-tabs-tabContent-larryTip-container');
  if (! larryContainer) {
    return;
  }

  const imagesContainer = makeElement('div', ['mh-improved-larrys-images']);

  images.forEach((image) => {
    const imageEl = makeElement('img', ['mh-improved-larrys-image']);
    imageEl.src = image.url;
    imageEl.alt = image.alt;
    imagesContainer.append(imageEl);
  });

  const existingImages = document.querySelector('.mh-improved-larrys-images');
  if (existingImages) {
    existingImages.replaceWith(imagesContainer);
  } else {
    larryContainer.prepend(imagesContainer);
  }
};

const main = () => {
  const location = getCurrentLocation();

  if (linksData?.links?.[location]) {
    addLinks(linksData.links[location]);
  }

  if (linksData?.images?.[location]) {
    addImages(linksData.images[location]);
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'larrys-links');
  onNavigation(main, {
    page: 'camp',
    onLoad: true,
  });
};

export default {
  id: 'larrys-links',
  name: 'Larry\'s Links',
  type: 'beta',
  default: true,
  load: init
};
