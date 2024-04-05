import {
  addStyles,
  getData,
  getFlag,
  onDialogShow,
  onEvent,
  onRequest
} from '@utils';

import pathsToSkip from './paths-to-skip.json';

import journalThemes from './journal-themes';

import journalThemeStyles from './journal-themes.css';
import styles from './styles.css';
import viewsStyles from './views.css';

const stripUrl = (url) => {
  return url
    .replaceAll('//images', '/images')
    .replace('https://www.mousehuntgame.com/images/', '')
    .replaceAll('cv=1', '')
    .replaceAll('cv=2', '')
    .replaceAll('cv=3', '')
    .replaceAll('asset_cache_version=1', '')
    .replaceAll('asset_cache_version=2', '')
    .replaceAll('?', '')
    .replaceAll('&', '');
};

const getMappedUrl = (strippedUrl) => {
  if (! strippedUrl) {
    return;
  }

  const mappedUrl = mapping[strippedUrl];
  if (! mappedUrl) {
    return;
  }

  if (mappedUrl.includes('https://')) {
    return mappedUrl;
  }

  if (mappedUrl) {
    upscaledImages.push(mappedUrl);
  }

  return `https://www.mousehuntgame.com/images/${mappedUrl}`;
};

const shouldSkipUpdate = (type, attribute, items) => {
  // hash the backgrounds to check if they are the same as the last check.
  // if they are the same, skip the check.
  const itemHash = [...items]
    .map((item) => {
      const itemAttribute = item.getAttribute(attribute);
      if (! itemAttribute) {
        return '';
      }

      return itemAttribute;
    })
    .join(',');

  if (lastCheck[type] && lastCheck[type] === itemHash) {
    return true;
  }

  lastCheck[type] = itemHash;

  return false;
};

const shouldSkipUrl = (url) => {
  if (
    unupscaledImages.includes(url) || // Don't re-upscale images that have already been upscaled.
    upscaledImages.includes(url) ||
    url.startsWith('https://www.gravatar.com') || // Skip some external images.
    url.startsWith('https://graph.facebook.com') ||
    url.startsWith('https://i.mouse.rip')
  ) {
    return true;
  }

  // Check if the image is in the list of images to skip.
  // if the list has a path with a wildcard, check if the image path starts with the path.
  // if the list has a path without a wildcard, check if the image path is equal to the path.
  const skip = pathsToSkip.some((path) => {
    if (path.includes('*')) {
      return url.startsWith(path.replace('*', ''));
    }

    return url === path;
  });

  return skip;
};

const upscaleImageElements = async () => {
  const images = document.querySelectorAll('img');
  if (! images) {
    return;
  }

  if (shouldSkipUpdate('images', 'src', images)) {
    return;
  }

  images.forEach((image) => {
    const source = image.getAttribute('src');
    if (! source) {
      return;
    }

    const url = stripUrl(source);

    if (shouldSkipUrl(url)) {
      return;
    }

    const mappedUrl = getMappedUrl(url);
    if (mappedUrl && mappedUrl !== url) {
      image.setAttribute('src', mappedUrl);
    } else {
      unupscaledImages.push(url);
    }
  });
};

const upscaleBackgroundImages = async () => {
  const backgrounds = document.querySelectorAll('[style*="background-image"]');
  if (! backgrounds) {
    return;
  }

  if (shouldSkipUpdate('backgrounds', 'style', backgrounds)) {
    return;
  }

  backgrounds.forEach((background) => {
    const style = background.getAttribute('style');
    if (! style || ! style.includes('background-image')) {
      return;
    }

    const urls = style.match(/url\((.*?)\)/);
    if (! urls || ! urls[1]) {
      return;
    }

    const url = stripUrl(urls[1].replaceAll(/["']+/g, ''));

    if (shouldSkipUrl(url)) {
      return;
    }

    const mappedUrl = getMappedUrl(url);
    if (mappedUrl && mappedUrl !== url) {
      background.setAttribute('style', style.replace(urls[1], mappedUrl));
    } else {
      unupscaledImages.push(url);
    }
  });
};

let debounceDelay = 0;

const debounce = (func, delay) => {
  debounceDelay = 250;
  let timeout;
  return async (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => await func(...args), delay);
  };
};

const upscaleImages = debounce(async () => {
  if (isUpscaling) {
    return;
  }

  isUpscaling = true;

  observer.disconnect();

  // Upscale the images.
  await upscaleImageElements();
  await upscaleBackgroundImages();

  isUpscaling = false;

  // Reconnect the observer
  observer.observe(document, observerOptions);

  return true;
}, debounceDelay);

let mapping = [];
let observer;
const unupscaledImages = [];
const upscaledImages = [];
const lastCheck = { backgrounds: '', images: '' };
let isUpscaling = false;

const observerOptions = {
  attributes: true,
  attributeFilter: ['style'],
  childList: true,
  subtree: true,
};

/**
 * Initialize the module.
 */
const main = async () => {
  if (observer) {
    return;
  }

  observer = new MutationObserver(async (mutations) => {
    const skipClasses = new Set([
      'huntersHornView__timerState',
      'mousehuntHud-gameInfo',
      'campPage-daily-tomorrow-countDown',
      'ticker',
      'mousehuntHeaderView-menu-notification',
      'mousehunt-improved-lgs-reminder-new',
      'mousehunt-improved-lgs-reminder',
      // Select2, search boxes on marketplace and friends list..
      'select2-chosen',
      'select2-offscreen',
      'select2-container',
      'select2-search',
      'select2-drop',
      'marketplaceView-header-searchContainer',
      // Markethunt.
      'highcharts-tracker',
      'highcharts-grid',
      'highcharts-axis',
      'highcharts-axis-labels',
    ]);

    const skipIds = new Set([
      'mh-improved-cre',
      'mhhh_flast_message_div',
    ]);

    const skipElements = new Set([
      'head',
      'title',
      'optgroup',
      'option',
    ]);

    for (const mutation of mutations) {
      if ((mutation.type === 'childList' || mutation.type === 'attributes') && (
        (mutation.target.classList && [...mutation.target.classList].some((c) => skipClasses.has(c))) ||
        (mutation.target.id && skipIds.has(mutation.target.id)) ||
        (mutation.target.nodeName && skipElements.has(mutation.target.nodeName.toLowerCase()))
      )) {
        continue;
      }

      await upscaleImages(mutation.target);
    }
  });

  observer.observe(document, observerOptions);
};

const handleUpscalingImages = async () => {
  if (! observer) {
    await main();
  }

  if (isUpscaling) {
    return;
  }

  await upscaleImages(document.querySelector('body'));
};

const init = async () => {
  const stylesToAdd = [styles, viewsStyles];

  if (! getFlag('no-image-upscaling-journal-themes')) {
    stylesToAdd.push(journalThemeStyles);
  }

  addStyles(stylesToAdd, 'image-upscaling');

  mapping = await getData('upscaled-images');

  onEvent('mh-improved-init', handleUpscalingImages);
  onDialogShow('all', handleUpscalingImages);
  onRequest('*', handleUpscalingImages);

  if (! getFlag('no-image-upscaling-journal-themes')) {
    journalThemes();
  }
};

export default {
  id: 'image-upscaling',
  name: 'Image Upscaling & Transparency',
  type: 'feature',
  default: true,
  description: 'Updates all images to use higher resolution versions with transparent backgrounds.',
  load: init,
};
