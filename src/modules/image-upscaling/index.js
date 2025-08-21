import {
  addExternalStyles,
  addStyles,
  debounce,
  doInternalEvent,
  getData,
  getFlag,
  onDialogShow,
  onEvent,
  onRequest
} from '@utils';

import styles from './styles.css';
import viewsStyles from './views.css';

const pathsToSkip = [
  'mice/*',
  'ui/auras/*',
  'ui/hud/menu/*',
  'ui/crowns/*',
  'ui/camp/*',
  'ui/hunters_horn/*',
  'items/skins/*',
  'items/weapons/*',
  'powertypes/*',
  'teams/*',
  'environments/*',
  'folklore_forest_upgrades/*',
  'promo/page_banners/*',
  'grouplogos/*',
  'ui/adventure_book/*',
  'map/dynamic/*',
  'io_appstore_button.png',
  'google-play-badge.png',
  'icons/externalLink.png',
  'buttons/discord.png',
  'hg_logo.png',
  'payment/thumb/logo_paypal.png',
];

const skipPrefixes = new Set();
const skipExact = new Set();
for (const p of pathsToSkip) {
  if (p.endsWith('*')) {
    skipPrefixes.add(p.slice(0, -1));
  } else {
    skipExact.add(p);
  }
}

/**
 * The ImageUpscaler class.
 */
class ImageUpscaler {
  /**
   * Create a new ImageUpscaler.
   */
  constructor() {
    this.mapping = null;
    this.unupscaledImages = new Set();
    this.upscaledImages = new Set();
    this.isUpscaling = false;
    this.observer = null;
    this.elementSrcCache = new WeakMap();
    this.mappedCache = new Map();
    this.handleUpscalingImages = this.handleUpscalingImages.bind(this);
    this.debouncedMutationHandler = debounce(this._onMutations.bind(this), 50);
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
   * Fetch the mapping of images to their upscaled versions.
   *
   * @return {Promise<Object>} The mapping of images.
   */
  async fetchMapping() {
    if (this.mapping) {
      return this.mapping;
    }

    try {
      this.mapping = upscaledImagesMapping;
    } catch {
      this.mapping = {};
    }

    return this.mapping;
  }

  /**
   * Get the mapped URL for a stripped URL.
   *
   * @param {string} strippedUrl The stripped URL.
   *
   * @return {string} The mapped URL, or an empty string if not found.
   */
  getMappedUrl(strippedUrl) {
    if (! strippedUrl) {
      return '';
    }

    if (this.mappedCache.has(strippedUrl)) {
      return this.mappedCache.get(strippedUrl);
    }

    const map = this.mapping || {};
    const mapped = map[strippedUrl];
    if (! mapped) {
      this.mappedCache.set(strippedUrl, '');
      return '';
    }

    const final = mapped.includes('https://') ? mapped : `https://www.mousehuntgame.com/images/${mapped}`;

    this.upscaledImages.add(final);
    this.mappedCache.set(strippedUrl, final);
    return final;
  }

  /**
   * Determine if a URL should be skipped.
   *
   * @param {string} url The URL to check.
   *
   * @return {boolean} True if the URL should be skipped, false otherwise.
   */
  shouldSkipUrl(url) {
    if (! url) {
      return true;
    }

    if (this.unupscaledImages.has(url) || this.upscaledImages.has(url)) {
      return true;
    }

    if (url.startsWith('https://www.gravatar.com') ||
        url.startsWith('https://graph.facebook.com') ||
        url.startsWith('https://i.mouse.rip')) {
      return true;
    }

    const clean = url.replace(/^\/+/, '');
    if (skipExact.has(clean)) {
      return true;
    }

    for (const prefix of skipPrefixes) {
      if (clean.startsWith(prefix)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Upscale image elements within a root element.
   *
   * @param {Element|Document} [root=document] The root element to search within.
   *
   * @return {Promise<void>} A promise that resolves when done.
   */
  async upscaleImageElements(root = document) {
    const images = (root === document ? document.querySelectorAll('img') : root.querySelectorAll?.('img')) || [];
    if (! images.length) {
      return;
    }

    for (const image of images) {
      try {
        const originalUrl = image.getAttribute('src');
        if (! originalUrl) {
          continue;
        }

        const strippedUrl = this.stripUrl(originalUrl);
        doInternalEvent('image-upscaling-image', { image, originalUrl, strippedUrl });

        if (this.shouldSkipUrl(strippedUrl)) {
          this.unupscaledImages.add(strippedUrl);
          continue;
        }

        const mapped = this.getMappedUrl(strippedUrl);
        if (mapped && originalUrl !== mapped) {
          const lastSet = this.elementSrcCache.get(image);
          if (lastSet === mapped) {
            continue;
          }

          image.setAttribute('src', mapped);
          this.elementSrcCache.set(image, mapped);
        } else if (! mapped) {
          this.unupscaledImages.add(strippedUrl);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error upscaling image:', error);
      }
    }
  }

  /**
   * Start observing the document for changes.
   *
   * @return {Promise<void>} A promise that resolves when done.
   */
  async start() {
    if (this.observer) {
      return;
    }

    await getData('upscaled-images');
    await this.fetchMapping();

    this.observer = new MutationObserver(this.debouncedMutationHandler);
    this.observer.observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class', 'id'],
    });

    await this.upscaleImageElements(document);
  }

  /**
   * Handle mutations observed in the document.
   *
   * @param {MutationRecord[]} mutations The mutations observed.
   *
   * @return {Promise<void>} A promise that resolves when done.
   */
  async _onMutations(mutations) {
    const roots = new Set();
    for (const m of mutations) {
      if (! m.target) {
        continue;
      }

      const nodeName = m.target.nodeName && m.target.nodeName.toLowerCase();
      if (nodeName && (nodeName === 'head' || nodeName === 'title' || nodeName === 'optgroup' || nodeName === 'option')) {
        continue;
      }

      const targetId = m.target.id;
      if (targetId && (targetId === 'mh-improved-cre' || targetId === 'mhhh_flast_message_div')) {
        continue;
      }

      const classList = m.target.classList ? [...m.target.classList] : [];

      const heavyClasses = new Set([
        'huntersHornView__timerState',
        'mousehuntHud-gameInfo',
        'campPage-daily-tomorrow-countDown',
        'ticker',
        'mousehuntHeaderView-menu-notification',
        'mousehunt-improved-lgs-reminder-new',
        'mousehunt-improved-lgs-reminder',
        'select2-chosen',
        'select2-offscreen',
        'select2-container',
        'select2-search',
        'select2-drop',
        'marketplaceView-header-searchContainer',
        'highcharts-tracker',
        'highcharts-grid',
        'highcharts-axis',
        'highcharts-axis-labels',
      ]);

      if (classList.some((c) => heavyClasses.has(c))) {
        continue;
      }

      roots.add(m.target);
      if (m.target.nodeName && m.target.nodeName.toLowerCase() === 'img') {
        roots.add(m.target);
      }
    }

    for (const root of roots) {
      try {
        await this.upscaleImageElements(root);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Error upscaling image elements:', error);
      }
    }
  }

  /**
   * Handle upscaling images.
   */
  async handleUpscalingImages() {
    if (this.isUpscaling) {
      return;
    }

    this.isUpscaling = true;

    try {
      await this.start();
    } finally {
      this.isUpscaling = false;
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

  const imageUpscaler = new ImageUpscaler();
  await imageUpscaler.fetchMapping();
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
