import { addExternalStyles, addStyles, getData, getFlag, onDialogShow, onEvent, onNavigation, onRequest } from '@utils';

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

// Elements that change often but never add images, so their changes don't need an upscaling pass.
const skipClasses = new Set([
  'huntersHornView__timerState', // Horn countdown.
  'huntersHornView__timer', // Legacy horn countdown.
  'mousehuntHeaderView-newsTicker', // News ticker.
  'mousehuntHud-gameInfo',
  'campPage-daily-tomorrow-countDown',
  'ticker',
  'mousehuntHeaderView-menu-notification',
  'mousehunt-improved-lgs-reminder-new',
  'mousehunt-improved-lgs-reminder',
  // Select2, search boxes on marketplace and friends list.
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

const skipIds = new Set(['mh-improved-cre', 'mhhh_flast_message_div']);

const skipElements = new Set(['head', 'title', 'optgroup', 'option']);

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
    this.pendingFrame = null;
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
    if (!url) {
      return '';
    }

    url = url
      .replaceAll('//images', '/images')
      .replaceAll('https://www.mousehuntgame.com/images/', '')
      .replaceAll(/\?cv=\d+/g, '')
      .replaceAll(/\?asset_cache_version=\d+/g, '')
      .replaceAll(/\?.+/g, '') // Remove query parameters.
      .replaceAll(/#.+/g, '') // Remove fragments.
      .replaceAll('//', '/')
      .trim();

    return url;
  }

  /**
   * Get the mapped URL for an image.
   *
   * @param {string} strippedUrl The stripped URL.
   *
   * @return {string} The mapped URL.
   */
  getMappedUrl(strippedUrl) {
    if (!strippedUrl) {
      return '';
    }

    const mappedUrl = this.mapping[strippedUrl];
    if (!mappedUrl) {
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
   * Build a hash of the current `src` of every image element.
   *
   * @param {NodeList} items The image elements.
   *
   * @return {string} The hash of the image sources.
   */
  hashImages(items) {
    return [...items].map((item) => item.getAttribute('src') || '').join(',');
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
    if (!images) {
      return;
    }

    // Skip if nothing has changed since the last pass. We compare against the
    // hash left over from the previous *completed* pass (which reflects the
    // post-upscale srcs), so a DOM that reverts to un-upscaled srcs — e.g. the
    // game re-rendering a journal entry back to its original image — is
    // correctly treated as new work rather than a no-op.
    if (this.lastCheck === this.hashImages(images)) {
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

    // Record the post-upscale state so the next pass dedupes against the
    // swapped srcs, not the originals.
    this.lastCheck = this.hashImages(images);
  }

  /**
   * Check if a mutation is from something that changes often but never adds images, like timers,
   * tickers, and search boxes.
   *
   * @param {MutationRecord} mutation The mutation to check.
   *
   * @return {boolean} Whether the mutation can be ignored.
   */
  isSkippableMutation(mutation) {
    const target = mutation.target;
    if (!target) {
      return false;
    }

    if (target.nodeName && skipElements.has(target.nodeName.toLowerCase())) {
      return true;
    }

    if (target.id && skipIds.has(target.id)) {
      return true;
    }

    return Boolean(target.classList && [...target.classList].some((className) => skipClasses.has(className)));
  }

  /**
   * Start the observer.
   */
  startObserver() {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      // Only skip the batch if everything in it can be ignored, so images added alongside a timer
      // tick still get upscaled.
      if (mutations.every((mutation) => this.isSkippableMutation(mutation)) || this.pendingFrame) {
        return;
      }

      // Coalesce bursts of mutations into a single pass per frame, rather than scanning every image
      // for each batch.
      this.pendingFrame = requestAnimationFrame(() => {
        this.pendingFrame = null;
        this.upscaleImageElements();
      });
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

    // Always clear the flag, otherwise one failure would stop upscaling for the rest of the session.
    try {
      await this.fetchMapping();

      this.upscaleImageElements();

      this.startObserver();
    } finally {
      this.isUpscaling = false;
    }
  }

  /**
   * Fetch the mapping for the upscaled images.
   */
  async fetchMapping() {
    // This runs on every request, so only fetch the mapping until we have it.
    if (this.mapping && Object.keys(this.mapping).length) {
      return;
    }

    this.mapping = await getData('upscaled-images');
  }

  /**
   * Handle upscaling images.
   */
  async handleUpscalingImages() {
    try {
      if (!this.isUpscaling) {
        await this.upscaleImages(document.querySelector('body'));
      }
    } catch (error) {
      console.error('Failed to handle upscaling images:', error); // eslint-disable-line no-console
    }
  }
}

/**
 * Add the upscaled journal theme styles, but only once a journal is on the page.
 *
 * These rules only ever theme the journal itself, so there's nothing for them to do
 * anywhere else.
 */
const addJournalThemeStyles = () => {
  if (!document.querySelector('#journalContainer')) {
    return;
  }

  addExternalStyles('upscaled-journal-theme-images.css');
};

/**
 * The ImageUpscaler instance.
 */
const init = async () => {
  // Check for a ?no-image-upscaling query parameter to disable the image upscaling.
  if (window.location.search.includes('no-image-upscaling')) {
    return;
  }

  addStyles([styles, viewsStyles], 'image-upscaling');

  // These two stay on every page on purpose. They override an item or mouse image
  // wherever it turns up (inventory, journal, crafting, marketplace, HUD, popups),
  // so there is no page they can be safely skipped on.
  addExternalStyles('upscaled-images.css');
  addExternalStyles('upscaled-mice-images.css');

  try {
    await getData('upscaled-images');
  } catch (error) {
    console.error('Failed to preload upscaled images:', error); // eslint-disable-line no-console
  }

  imageUpscaler = new ImageUpscaler();
  imageUpscaler.handleUpscalingImages();

  onRequest('*', imageUpscaler.handleUpscalingImages, true, [], true);

  onEvent('mh-improved-init', imageUpscaler.handleUpscalingImages);
  onDialogShow('all', imageUpscaler.handleUpscalingImages);

  if (!getFlag('no-image-upscaling-journal-themes')) {
    addJournalThemeStyles();
    onNavigation(addJournalThemeStyles);
  }
};

/**
 * Initialize the module.
 */
export default {
  id: 'image-upscaling',
  name: 'Image Upscaling & Transparency',
  type: 'appearance',
  default: true,
  load: init,
};
