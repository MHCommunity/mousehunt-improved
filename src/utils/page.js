/**
 * Get the current page slug.
 *
 * @return {string} The page slug.
 */
const getCurrentPage = () => {
  return hg.utils.PageUtil.getCurrentPage().toLowerCase();
};

/**
 * Get the current page tab, defaulting to the current page if no tab is found.
 *
 * @return {string} The page tab.
 */
const getCurrentTab = () => {
  const tab = hg.utils.PageUtil.getCurrentPageTab().toLowerCase();
  if (tab.length <= 0) {
    return getCurrentPage();
  }

  return tab;
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

  return subtab.toLowerCase();
};

/**
 * Get the current overlay.
 *
 * @return {string} The current overlay.
 */
const getCurrentDialog = () => {
  const overlay = document.querySelector('#overlayPopup');
  if (overlay && overlay.classList.length <= 0) {
    return null;
  }

  let overlayType = overlay.classList.value;
  overlayType = overlayType.replace('jsDialogFixed', '');
  overlayType = overlayType.replace('default', '');
  overlayType = overlayType.replace('wide', '');
  overlayType = overlayType.replace('ajax', '');
  overlayType = overlayType.replace('overlay', '');

  // Replace some overlay types with more readable names.
  overlayType = overlayType.replace('treasureMapPopup', 'map');
  overlayType = overlayType.replace('itemViewPopup', 'item');
  overlayType = overlayType.replace('mouseViewPopup', 'mouse');
  overlayType = overlayType.replace('largerImage', 'image');
  overlayType = overlayType.replace('convertibleOpenViewPopup', 'convertible');
  overlayType = overlayType.replace('adventureBookPopup', 'adventureBook');
  overlayType = overlayType.replace('marketplaceViewPopup', 'marketplace');
  overlayType = overlayType.replace('giftSelectorViewPopup', 'gifts');
  overlayType = overlayType.replace('supportPageContactUsForm', 'support');
  overlayType = overlayType.replace('MHCheckout', 'premiumShop');

  overlayType = overlayType.trim();

  if ('Popup' === overlayType) {
    return false;
  }

  return overlayType;
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
const isCurrentPage = (targetPage = null, targetTab = null, targetSubtab = null, forceCurrentPage = null, forceCurrentTab = null, forceCurrentSubtab = null) => {
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
  isCurrentPage
};
