import { addStyles, onDialogShow } from '@utils';
import { getData } from '@utils/data';

import pathsToSkip from '@data/upscaled-images-to-skip.json';

import journalThemeStyles from './journal-themes.css';
import styles from './styles.css';
import viewsStyles from './views.css';

const stripUrl = (url) => {
  return url
    .replaceAll('//images', '/images')
    .replace('https://www.mousehuntgame.com/images/', '')
    .replaceAll('cv=1', '')
    .replaceAll('cv=2', '')
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

const upscaleImages = async (observer) => {
  if (isUpscaling) {
    return;
  }

  // Pause the observer while we are making changes.
  if (observer) {
    observer.disconnect();
  }

  isUpscaling = true;

  // Upscale the images.
  await upscaleImages();
  await upscaleBackgroundImages();

  // Resume the observer.
  if (observer) {
    observer.observe(document, observerOptions);
  }

  isUpscaling = false;
  // return a promise that resolves when all the images have been upscaled.
  return Promise.all([upscaleImageElements(), upscaleBackgroundImages()]);
};

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

let mapping = [];

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([styles, journalThemeStyles, viewsStyles]);

  mapping = await getData('upscaled-images');

  const observer = new MutationObserver(async (mutations) => {
    for (const mutation of mutations) {
      // Don't run when it's the horn counting down.
      if (mutation.type === 'childList' && mutation.target.classList.contains('huntersHornView__timerState')) {
        continue;
      }

      // Don't run on the news ticker.
      if (mutation.type === 'attributes' && mutation.target.classList.contains('ticker')) {
        continue;
      }

      // Pause the observer while we are making changes.
      observer.disconnect();

      upscaleImages(observer);
    }
  });

  observer.observe(document, observerOptions);

  onDialogShow(() => {
    setTimeout(() => {
      upscaleImages();
    }, 500);
  });
};

export default {
  id: 'image-upscaling',
  name: 'Image Upscaling & Transparency',
  type: 'feature',
  default: true,
  description: 'Updates all images to use higher resolution versions with transparent backgrounds.',
  load: init,
};
