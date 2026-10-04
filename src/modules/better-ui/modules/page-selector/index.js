import { addStyles, getCurrentPage, makeElement, makeMhButton } from '@utils';

import styles from './styles.css';

const pagerSelector = '.scoreboardTableView .pagerView-section.current, .PageFriends .pagerView-section.current';

/**
 * Get the game's pager for a scoreboard table or friends list.
 *
 * @param {HTMLElement} element An element inside the pager.
 *
 * @return {Object|null} The pager, or null if it can't be found.
 */
const getPager = (element) => {
  const category = element.closest('.scoreboardTableView')?.getAttribute('data-category');
  if (category) {
    return app?.pages?.ScoreboardsPage?.scoreboards?.[category]?.pager || null;
  }

  // Friends pagers are created per tab, e.g. 'PageFriends_view_friends' → 'tab_view_friends'.
  const container = element.closest('.pagerView-container');
  const tab = [...(container?.classList || [])].find((className) => className.startsWith('PageFriends_'));
  if (!tab) {
    return null;
  }

  return app?.pages?.FriendsPage?.[tab.replace('PageFriends_', 'tab_')]?.pager || null;
};

/**
 * Add a hint to the current page text so it's clear it can be clicked.
 *
 * @param {HTMLElement} current The current page section of the pager.
 */
const addHint = (current) => {
  if (!current.title) {
    current.title = 'Click to jump to a page';
  }
};

/**
 * Show the page selector under the current page text.
 *
 * @param {HTMLElement} current The current page section of the pager.
 */
const showPageSelector = (current) => {
  const pager = getPager(current);
  if (!pager) {
    return;
  }

  const pageSelector = makeElement('div', 'mh-page-selector');
  const pageInputLabel = makeElement('label', 'page-input-label', 'Go to page:');
  pageInputLabel.htmlFor = 'mh-page-input';
  pageSelector.append(pageInputLabel);

  const pageInput = makeElement('input', 'page-input');
  pageInput.id = 'mh-page-input';
  pageInput.type = 'number';
  pageInput.min = 1;
  pageInput.max = pager.getTotalPages();

  /**
   * Show the selected page.
   */
  const showPage = () => {
    const page = Number.parseInt(pageInput.value, 10);
    if (page >= 1 && page <= pager.getTotalPages()) {
      pager.showPage(page);
    }

    pageSelector.remove();
  };

  pageInput.addEventListener('keydown', (event) => {
    if ('Enter' === event.key) {
      event.preventDefault();
      showPage();
    } else if ('Escape' === event.key) {
      pageSelector.remove();
    }
  });

  const pageSubmit = makeMhButton({
    text: 'Go',
    className: 'page-submit',
    callback: showPage,
  });

  pageSelector.append(pageInput, pageSubmit);
  current.append(pageSelector);

  pageInput.focus();
};

/**
 * Toggle the page selector when the current page text is clicked.
 *
 * @param {MouseEvent} event The click event.
 */
const maybeTogglePageSelector = (event) => {
  if (!['scoreboards', 'friends'].includes(getCurrentPage())) {
    return;
  }

  const current = event.target.closest(pagerSelector);
  if (!current) {
    return;
  }

  // Clicks inside the selector itself shouldn't close it.
  if (event.target.closest('.mh-page-selector')) {
    return;
  }

  const existing = current.querySelector('.mh-page-selector');
  if (existing) {
    existing.remove();
    return;
  }

  showPageSelector(current);
};

/**
 * Initialize the module.
 */
export default () => {
  addStyles(styles, 'better-ui-page-selector');

  document.addEventListener('click', maybeTogglePageSelector);
  document.addEventListener('mouseover', (event) => {
    const current = event.target.closest?.(pagerSelector);
    if (current) {
      addHint(current);
    }
  });
};
