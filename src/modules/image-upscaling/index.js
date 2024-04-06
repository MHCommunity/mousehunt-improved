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

import styles from './styles.css';
import viewsStyles from './views.css';

class ImageUpscaler {
  constructor() {
    this.mapping = [];
    this.unupscaledImages = new Set();
    this.upscaledImages = new Set();
    this.lastCheck = { backgrounds: '', images: '' };
    this.isUpscaling = false;
    this.observerOptions = {
      attributes: true,
      attributeFilter: ['style'],
      childList: true,
      subtree: true,
    };
    this.observer = null;
    this.debounceDelay = 250;
    this.handleUpscalingImages = this.handleUpscalingImages.bind(this);
  }

  debounce(func, delay) {
    let timeout;
    return async (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => await func(...args), delay);
    };
  }

  stripUrl(url) {
    const replacements = [
      ['//images', '/images'],
      ['https://www.mousehuntgame.com/images/', ''],
      ['cv=1', ''],
      ['cv=2', ''],
      ['cv=3', ''],
      ['cv=4', ''],
      ['cv=5', ''],
      ['asset_cache_version=1', ''],
      ['asset_cache_version=2', ''],
      ['asset_cache_version=3', ''],
      ['asset_cache_version=4', ''],
      ['asset_cache_version=5', ''],
      ['?', ''],
      ['&', ''],
    ];

    if (! url) {
      return '';
    }

    return replacements.reduce((replacedUrl, [from, to]) => replacedUrl.replaceAll(from, to), url);
  }

  getMappedUrl(strippedUrl) {
    if (! strippedUrl) {
      return;
    }

    const mappedUrl = this.mapping[strippedUrl];
    if (! mappedUrl) {
      return;
    }

    if (mappedUrl.includes('https://')) {
      return mappedUrl;
    }

    if (mappedUrl) {
      this.upscaledImages.add(mappedUrl);
    }

    return `https://www.mousehuntgame.com/images/${mappedUrl}`;
  }

  shouldSkipUpdate(type, attribute, items) {
    const itemHash = [...items]
      .map((item) => item.getAttribute(attribute) || '')
      .join(',');

    const shouldSkip = this.lastCheck[type] === itemHash;
    this.lastCheck[type] = itemHash;

    return shouldSkip;
  }

  shouldSkipUrl(url) {
    if (
      this.unupscaledImages.has(url) || // Don't re-upscale images that have already been upscaled.
      this.upscaledImages.has(url) ||
      url.startsWith('https://www.gravatar.com') || // Skip some external images.
      url.startsWith('https://graph.facebook.com') ||
      url.startsWith('https://i.mouse.rip')
    ) {
      return true;
    }

    // Check if the image is in the list of images to skip.
    // if the list has a path with a wildcard, check if the image path starts with the path.
    // if the list has a path without a wildcard, check if the image path is equal to the path.
    return pathsToSkip.some((path) => {
      if (path.includes('*')) {
        return url.startsWith(path.replace('*', ''));
      }

      return url === path;
    });
  }
  upscaleElement(element, attribute, urlExtractor) {
    const attributeValue = element.getAttribute(attribute);
    if (! attributeValue) {
      return;
    }

    const originalUrl = urlExtractor(attributeValue);
    if (! originalUrl) {
      return;
    }

    const url = this.stripUrl(originalUrl);

    if (this.shouldSkipUrl(url)) {
      return;
    }

    const mappedUrl = this.getMappedUrl(url);
    if (mappedUrl && originalUrl !== mappedUrl) {
    // Preload the image
      const img = new Image();
      img.onload = () => {
      // Once the image is loaded, replace the URL in the original element
        element.setAttribute(attribute, attributeValue.replace(originalUrl, mappedUrl));

        // Set up a MutationObserver to prevent other code from changing the background-image
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              element.style.backgroundImage = `url(${mappedUrl})`;
            }
          });
        });

        observer.observe(element, { attributes: true });
      };
      img.src = mappedUrl;
    } else {
      this.unupscaledImages.add(url);
    }
  }

  upscaleImageElements() {
    const images = document.querySelectorAll('img');
    if (! images) {
      return;
    }

    if (this.shouldSkipUpdate('images', 'src', images)) {
      return;
    }

    images.forEach((image) => {
      const originalUrl = image.getAttribute('src');
      const strippedUrl = this.stripUrl(originalUrl);

      if (this.shouldSkipUrl(strippedUrl)) {
        return;
      }

      const mappedUrl = this.getMappedUrl(strippedUrl);
      if (mappedUrl && originalUrl !== mappedUrl) {
        image.setAttribute('src', mappedUrl);
      }
    });
  }

  upscaleBackgroundImages() {
    const backgrounds = document.querySelectorAll('[style*="background-image"]');
    if (! backgrounds) {
      return;
    }

    if (this.shouldSkipUpdate('backgrounds', 'style', backgrounds)) {
      return;
    }

    backgrounds.forEach((background) => {
      this.upscaleElement(background, 'style', (style) => {
        const urls = style.match(/url\((.*?)\)/);
        return urls && urls[1] ? urls[1].replaceAll(/["']+/g, '') : null;
      });
    });
  }

  startObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(this.debounce(() => {
      this.upscaleImageElements();
      this.upscaleBackgroundImages();
    }, this.debounceDelay));

    this.observer.observe(document.body, this.observerOptions);
  }

  async upscaleImages() {
    if (this.isUpscaling) {
      return;
    }

    this.isUpscaling = true;

    await this.fetchMapping();

    this.upscaleImageElements();
    this.upscaleBackgroundImages();

    this.startObserver();

    this.isUpscaling = false;
  }

  async fetchMapping() {
    this.mapping = await getData('upscaled-images');
  }

  async start() {
    console.log('Starting image upscaling...'); // eslint-disable-line no-console
    if (this.observer) {
      return;
    }

    this.observer = new MutationObserver(async (mutations) => {
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

        try {
          await this.upscaleImages(mutation.target);
        } catch (error) {
          console.error('Failed to upscale images:', error); // eslint-disable-line no-console
        }
      }
    });

    this.observer.observe(document, this.observerOptions);
  }

  async handleUpscalingImages() {
    try {
      if (! this.observer) {
        await this.start();
      }

      if (! this.isUpscaling) {
        await this.upscaleImages(document.querySelector('body'));
      }
    } catch (error) {
      console.error('Failed to handle upscaling images:', error); // eslint-disable-line no-console
    }
  }
}

const init = async () => {
  addStyles([styles, viewsStyles], 'image-upscaling');

  imageUpscaler = new ImageUpscaler();
  imageUpscaler.handleUpscalingImages();

  onRequest('*', imageUpscaler.handleUpscalingImages, true, [], true);

  onEvent('mh-improved-init', imageUpscaler.handleUpscalingImages);
  onDialogShow('all', imageUpscaler.handleUpscalingImages);

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
