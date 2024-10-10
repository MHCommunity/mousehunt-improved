import {
  addExternalStyles,
  addStyles,
  getData,
  getFlag,
  onDialogShow,
  onEvent,
  onRequest
} from '@utils';

import pathsToSkip from '@data/image-upscaling-paths-to-skip.json';

import styles from './styles.css';
import viewsStyles from './views.css';

/**
 * The ImageUpscaler class.
 */
class ImageUpscaler {
  /**
   * Create a new ImageUpscaler.
   */
  constructor() {
    this.mapping = [];
    this.unupscaledImages = new Set();
    this.upscaledImages = new Set();
    this.lastCheck = '';
    this.isUpscaling = false;
    this.observerOptions = {
      childList: true,
      subtree: true,
    };
    this.observer = null;
    this.handleUpscalingImages = this.handleUpscalingImages.bind(this);
  }

  /**
   * Strip the URL of any unnecessary parts.
   *
   * @param {string} url The URL to strip.
   *
   * @return {string} The stripped URL.
   */
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

  /**
   * Get the mapped URL for an image.
   *
   * @param {string} strippedUrl The stripped URL.
   *
   * @return {string} The mapped URL.
   */
  getMappedUrl(strippedUrl) {
    if (! strippedUrl) {
      return '';
    }

    const mappedUrl = this.mapping[strippedUrl];
    if (! mappedUrl) {
      return '';
    }

    if (mappedUrl.includes('https://')) {
      return mappedUrl;
    }

    if (mappedUrl) {
      this.upscaledImages.add(mappedUrl);
    }

    return `https://www.mousehuntgame.com/images/${mappedUrl}`;
  }

  /**
   * Check if the image elements should be skipped.
   *
   * @param {NodeList} items The image elements.
   *
   * @return {boolean} If the update should be skipped.
   */
  shouldSkipUpdate(items) {
    const itemHash = [...items]
      .map((item) => item.getAttribute('src') || '')
      .join(',');

    const shouldSkip = this.lastCheck === itemHash;
    this.lastCheck = itemHash;

    return shouldSkip;
  }

  /**
   * Check if the URL should be skipped.
   *
   * @param {string} url The URL to check.
   *
   * @return {boolean} If the URL should be skipped.
   */
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

  /**
   * Upscale the image elements.
   */
  upscaleImageElements() {
    const images = document.querySelectorAll('img');
    if (! images) {
      return;
    }

    if (this.shouldSkipUpdate(images)) {
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

  /**
   * Start the observer.
   */
  startObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(() => {
      this.upscaleImageElements();
    });

    this.observer.observe(document.body, this.observerOptions);
  }

  /**
   * Upscale the images.
   */
  async upscaleImages() {
    if (this.isUpscaling) {
      return;
    }

    this.isUpscaling = true;

    await this.fetchMapping();

    this.upscaleImageElements();

    this.startObserver();

    this.isUpscaling = false;
  }

  /**
   * Fetch the mapping for the upscaled images.
   */
  async fetchMapping() {
    this.mapping = await getData('upscaled-images');
  }

  /**
   * Start the image upscaler observer.
   */
  async start() {
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

  /**
   * Handle upscaling images.
   */
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

/**
 * The ImageUpscaler instance.
 */
const init = async () => {
  // Check for a ?no-image-upscaling query parameter to disable the image upscaling.
  if (window.location.search.includes('no-image-upscaling')) {
    return;
  }

  addStyles([styles, viewsStyles], 'image-upscaling');
  addExternalStyles('upscaled-images.css');
  addExternalStyles('upscaled-mice-images.css');

  imageUpscaler = new ImageUpscaler();
  imageUpscaler.handleUpscalingImages();

  onRequest('*', imageUpscaler.handleUpscalingImages, true, [], true);

  onEvent('mh-improved-init', imageUpscaler.handleUpscalingImages);
  onDialogShow('all', imageUpscaler.handleUpscalingImages);

  if (! getFlag('no-image-upscaling-journal-themes')) {
    addExternalStyles('upscaled-journal-theme-images.css');
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'image-upscaling',
  name: 'Image Upscaling & Transparency',
  type: 'feature',
  default: true,
  description: 'Update all images to use higher resolution versions with transparent backgrounds.',
  load: init,
};
