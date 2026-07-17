import { onJournalEntry } from '@utils';

import { excludedItemTypes } from './shared/item-linking';

const keepOriginalClasses = new Set(['lunar_lantern', 'valentines_matchmaker', 'vending_machine_purchase', 'fullyExplored', 'folkloreForest-bookClaimed', 'claimBooty']);

/**
 * Whether behavior fixes should leave an entry untouched.
 *
 * @param {Object} model The journal entry model.
 *
 * @return {boolean} Whether to skip the entry.
 */
const shouldSkip = (model) => {
  return [...model.classes].some((entryClass) => keepOriginalClasses.has(entryClass));
};

/**
 * Make item links consistently open the in-game item view.
 *
 * @param {Object} model The journal entry model.
 */
const updateItemLinks = (model) => {
  if (shouldSkip(model) || model.classes.has('iceberg_defeated')) {
    return;
  }

  model.el.querySelectorAll('.journaltext a[href*="item.php"]').forEach((link) => {
    const itemType = link.href.match(/item\.php\?item_type=(\w+)/);
    if (!itemType || 2 !== itemType.length) {
      return;
    }

    if (excludedItemTypes.has(itemType[1])) {
      link.replaceWith(...link.childNodes);
      return;
    }

    link.addEventListener('click', (event) => {
      event.preventDefault();
      hg.views.ItemView.show(itemType[1]);
    });
  });

  model.el.querySelectorAll('.journaltext a[onclick]').forEach((link) => {
    if ('#' !== link.getAttribute('href')) {
      return;
    }

    const itemType = link.getAttribute('onclick').match(/hg\.views\.ItemView\.show\('(\w+)'\)/);
    if (!itemType || 2 !== itemType.length) {
      return;
    }

    if (excludedItemTypes.has(itemType[1])) {
      link.replaceWith(...link.childNodes);
      return;
    }

    link.setAttribute('href', `https://www.mousehuntgame.com/item.php?item_type=${itemType[1]}`);
  });
};

/**
 * Make mouse thumbnails consistently open the in-game mouse view.
 *
 * @param {Object} model The journal entry model.
 */
const updateMouseImageLinks = (model) => {
  if (shouldSkip(model) || !model.mouseType) {
    return;
  }

  const mouseImageLink = model.el.querySelector('.journalimage a[onclick]');
  if (mouseImageLink) {
    mouseImageLink.setAttribute('onclick', `hg.views.MouseView.show('${model.mouseType}'); return false;`);
  }
};

/**
 * Turn the progress-log link into a labeled button.
 *
 * @param {Object} model The journal entry model.
 */
const updateProgressLog = (model) => {
  if (shouldSkip(model) || !model.classes.has('log_summary')) {
    return;
  }

  const link = model.el.querySelector('td a');
  if (!link) {
    return;
  }

  link.classList.add('mh-ui-progress-log-link', 'mousehuntActionButton', 'small', 'lightBlue');

  const span = document.createElement('span');
  span.innerText = 'View Progress Log';
  link.innerText = '';
  link.append(span);
};

/**
 * Register journal behavior fixes that are independent of text replacements.
 */
export default () => {
  onJournalEntry(updateItemLinks, {
    id: 'better-journal-item-links',
    stage: 'links',
  });

  onJournalEntry(updateMouseImageLinks, {
    id: 'better-journal-mouse-image-links',
    stage: 'links',
  });

  onJournalEntry(updateProgressLog, {
    id: 'better-journal-progress-log',
    stage: 'interactions',
  });
};
