import { addEvent, addStyles, getUserTitle, getUserTitleShield } from '@utils';
import onJournalEntry from '../journal-event';

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

/**
 * Replace the rank up icon with the user's title shield.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const updateRankUpIcon = (entry) => {
  if (! entry.classList.contains('titlechange')) {
    return;
  }

  const rankUp = entry.querySelector('.journalimage img');
  if (! rankUp) {
    return;
  }

  const shield = getUserTitleShield(getUserTitle());
  if (! shield) {
    return;
  }

  rankUp.src = shield;
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-styles');

  onJournalEntry(addBadgeClass, 4000);
  onJournalEntry(updateRankUpIcon, 4000);
};
