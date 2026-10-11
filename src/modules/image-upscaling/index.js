import { addExternalStyles, addStyles, getData, getFlag, onEvent, onNavigation } from '@utils';

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

const maxPendingImages = 200;

/**
 * The ImageUpscaler class.
 */
class ImageUpscaler {
  /**
   * Create a new ImageUpscaler.
   */
  constructor() {
    this.mapping = {};
    // Every `src` we've seen, mapped to its upscaled URL or '' when it's left alone.
    this.resolved = new Map();
    this.pendingImages = new Set();
    this.pendingFullScan = false;
    this.pendingFrame = null;
    this.observer = null;
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
   * Check if the URL should be skipped.
   *
   * @param {string} url The stripped URL to check.
   *
   * @return {boolean} If the URL should be skipped.
   */
  shouldSkipUrl(url) {
    if (url.startsWith('https://www.gravatar.com') || url.startsWith('https://graph.facebook.com') || url.startsWith('https://i.mouse.rip')) {
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
   * Get the upscaled URL for an image source.
   *
   * @param {string} src The image's current `src`.
   *
   * @return {string} The upscaled URL, or '' if the image should be left alone.
   */
  resolve(src) {
    if (!src) {
      return '';
    }

    if (this.resolved.has(src)) {
      return this.resolved.get(src);
    }

    const strippedUrl = this.stripUrl(src);
    let mappedUrl = '';
    if (strippedUrl && !this.shouldSkipUrl(strippedUrl)) {
      const mapped = this.mapping[strippedUrl];
      if (mapped) {
        mappedUrl = mapped.includes('https://') ? mapped : `https://www.mousehuntgame.com/images/${mapped}`;
      }
    }

    this.resolved.set(src, mappedUrl === src ? '' : mappedUrl);
    if (mappedUrl) {
      // Already upscaled, so seeing it again is a no-op.
      this.resolved.set(mappedUrl, '');
    }

    return this.resolved.get(src);
  }

  /**
   * Upscale a single image element.
   *
   * @param {HTMLImageElement} image The image element.
   */
  upscaleImage(image) {
    const mappedUrl = this.resolve(image.getAttribute('src'));
    if (mappedUrl) {
      image.setAttribute('src', mappedUrl);
    }
  }

  /**
   * Upscale every image on the page.
   */
  upscaleAllImages() {
    document.querySelectorAll('img').forEach((image) => this.upscaleImage(image));
  }

  /**
   * Upscale the images queued by the observer.
   */
  processPending() {
    this.pendingFrame = null;

    if (this.pendingFullScan) {
      this.pendingFullScan = false;
      this.pendingImages.clear();
      this.upscaleAllImages();
      return;
    }

    for (const node of this.pendingImages) {
      if ('IMG' === node.nodeName) {
        this.upscaleImage(node);
      } else {
        node.querySelectorAll('img').forEach((image) => this.upscaleImage(image));
      }
    }

    this.pendingImages.clear();
  }

  /**
   * Queue a pass for the next frame.
   */
  schedule() {
    if (!this.pendingFrame) {
      this.pendingFrame = requestAnimationFrame(() => this.processPending());
    }
  }

  /**
   * Queue a pass over the whole page.
   */
  scheduleFullScan() {
    this.pendingFullScan = true;
    this.schedule();
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
   * Queue the images added or changed by a batch of mutations.
   *
   * @param {MutationRecord[]} mutations The mutations.
   */
  handleMutations(mutations) {
    // A full scan is already queued, so there's nothing to track.
    if (this.pendingFullScan) {
      return;
    }

    let queued = false;

    for (const mutation of mutations) {
      if ('attributes' === mutation.type) {
        this.pendingImages.add(mutation.target);
        queued = true;
        continue;
      }

      if (this.isSkippableMutation(mutation)) {
        continue;
      }

      for (const node of mutation.addedNodes) {
        if (Node.ELEMENT_NODE === node.nodeType) {
          this.pendingImages.add(node);
          queued = true;
        }
      }
    }

    if (!queued) {
      return;
    }

    // Frames don't run in background tabs, so rather than holding on to every
    // added node until the tab is shown again, fall back to one full scan.
    if (this.pendingImages.size > maxPendingImages) {
      this.pendingImages.clear();
      this.pendingFullScan = true;
    }

    this.schedule();
  }

  /**
   * Start upscaling: upscale what's on the page now, then watch for new images.
   */
  async start() {
    this.mapping = (await getData('upscaled-images')) || {};
    if (!Object.keys(this.mapping).length) {
      return;
    }

    this.upscaleAllImages();

    this.observer = new MutationObserver((mutations) => this.handleMutations(mutations));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    });
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

  const imageUpscaler = new ImageUpscaler();
  try {
    await imageUpscaler.start();
  } catch (error) {
    console.error('Failed to start image upscaling:', error); // eslint-disable-line no-console
  }

  // The observer catches new images, but give everything a once-over after all the modules load.
  onEvent('mh-improved-init', () => imageUpscaler.scheduleFullScan());

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
  type: 'advanced',
  default: true,
  load: init,
};
