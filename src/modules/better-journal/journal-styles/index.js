import { addEvent, addStyles } from '@utils';

import * as imported from './styles/**/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Add a class to show the badge type.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const addBadgeClass = (entry) => {
  if (! entry) {
    return;
  }

  const isBadge = entry.classList.contains('badge');
  if (! isBadge) {
    return;
  }

  const badgeType = entry.querySelector('.journalimage img');
  if (! badgeType) {
    return;
  }

  const badgeTypeClass = badgeType.src
    .replace('https://www.mousehuntgame.com/images/ui/crowns/crown_', '')
    .replace('.png', '')
    .trim();

  entry.classList.add(`better-journal-styles-badge-${badgeTypeClass}`);

  const content = entry.querySelector('.journaltext');
  if (! content) {
    return;
  }

  content.innerHTML = content.innerHTML
    .replace('I can view my trophy crowns on my', '')
    .replace('<a href="https://www.mousehuntgame.com/hunterprofile.php?tab=kings_crowns">hunter profile</a>', '')
    .replace('<br>', '')
    .replace('.', '')
    .trim();
};

export default async () => {
  addStyles(styles, 'better-journal-styles');

  addEvent('journal-entry', addBadgeClass, { id: 'better-journal-styles-badge' });
};
