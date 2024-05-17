/**
 * Get the current page slug.
 *
 * @return {string|null} The page slug or null if not found.
 */
const getCurrentPage = () => {
  if (! hg?.utils?.PageUtil?.getCurrentPage) {
    return null;
  }

  const page = hg.utils.PageUtil.getCurrentPage();
  if (! page) {
    const query = hg?.utils?.PageUtil?.getQueryParams() || {};
    if (query?.switch_to && 'mobile' === query.switch_to) {
      return 'camp';
    }

    return null;
  }

  return page.toLowerCase();
};

/**
 * Go to the specified page.
 *
 * @param {string} page The page to go to.
 * @param {...any} args The arguments to pass to the page.
 */
const setPage = (page, ...args) => {
  if ('wiki' === page.toLowerCase()) {
    doEvent('mh-improved-open-wiki');
    return;
  }

  // Uppercase the first letter of the page.
  page = page.charAt(0).toUpperCase() + page.slice(1);

  hg?.utils?.PageUtil?.setPage?.(page, ...args);
};

/**
 * Set the current page tab.
 *
 * @param {string} tab  The tab to set.
 * @param {...any} args The arguments to pass to the tab.
 */
const setTab = (tab, ...args) => {
  hg?.utils?.PageUtil?.setPageTab?.(tab, ...args);
};

/**
 * Get the current page tab, defaulting to the current page if no tab is found.
 *
 * @return {string} The page tab.
 */
const getCurrentTab = () => {
  if (! hg?.utils?.PageUtil?.getCurrentPageTab) {
    return getCurrentPage();
  }

  const tab = hg.utils.PageUtil.getCurrentPageTab() || '';

  if (tab.length <= 0) {
    return getCurrentPage();
  }

  return tab ? tab.toLowerCase() : getCurrentPage();
};

/**
 * Get the current page sub tab, defaulting to the current tab if no sub tab is found.
 *
 * @return {string} The page tab.
 */
const getCurrentSubtab = () => {
  const subtab = hg.utils.PageUtil.getCurrentPageSubTab();
  if (! subtab || subtab.length <= 0) {
    return getCurrentTab();
  }

  return subtab ? subtab.toLowerCase() : getCurrentTab();
};

/**
 * Get the current overlay.
 *
 * @return {string} The current overlay.
 */
const getCurrentDialog = () => {
  const overlay = document.querySelector('#overlayPopup');
  if (! overlay || ! overlay.classList || overlay.classList.length <= 0) {
    return null;
  }

  const replaceMap = {
    jsDialogFixed: '',
    default: '',
    wide: '',
    ajax: '',
    overlay: '',
    treasureMapPopup: 'map',
    itemViewPopup: 'item',
    mouseViewPopup: 'mouse',
    largerImage: 'image',
    convertibleOpenViewPopup: 'convertible',
    adventureBookPopup: 'adventureBook',
    marketplaceViewPopup: 'marketplace',
    giftSelectorViewPopup: 'gifts',
    supportPageContactUsForm: 'support',
    MHCheckout: 'premiumShop',
  };

  overlayType = overlay.classList.value.split(' ').map((cls) => replaceMap[cls] || cls).join(' ').trim();

  return 'Popup' === overlayType ? false : overlayType;
};

/**
 * Check if the page matches the target page, optionally checking the tab and subtab.
 *
 * @param {string} targetPage         The target page.
 * @param {string} targetTab          The target tab.
 * @param {string} targetSubtab       The target subtab.
 * @param {string} forceCurrentPage   The current page.
 * @param {string} forceCurrentTab    The current tab.
 * @param {string} forceCurrentSubtab The current subtab.
 *
 * @return {boolean} True if the page matches, false otherwise.
 */
const isCurrentPage = (
  targetPage = null,
  targetTab = null,
  targetSubtab = null,
  forceCurrentPage = null,
  forceCurrentTab = null,
  forceCurrentSubtab = null
) => {
  if (! targetPage) {
    return false;
  }

  // Only targetPage is being checked.
  const currentPage = forceCurrentPage || getCurrentPage();
  if (! targetTab) {
    return currentPage === targetPage;
  }

  // Only targetTab is being checked.
  const currentTab = forceCurrentTab || getCurrentTab();
  if (! targetSubtab) {
    return currentPage === targetPage && currentTab === targetTab;
  }

  // Only targetSubtab is being checked.
  const currentSubtab = forceCurrentSubtab || getCurrentSubtab();
  if (currentSubtab === currentTab) {
    return currentPage === targetPage && currentTab === targetTab;
  }

  return currentPage === targetPage && currentTab === targetTab && currentSubtab === targetSubtab;
};

export {
  getCurrentPage,
  getCurrentTab,
  getCurrentSubtab,
  getCurrentDialog,
  isCurrentPage,
  setPage,
  setTab
};
