import { addStyles, getUserTitle, getUserTitleShield, onJournalEntry } from '@utils';

import * as imported from './styles/**/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Add a class to show the badge type.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const addBadgeClass = (entry) => {
  if (! entry || ! entry.classList) {
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
  entry.setAttribute('data-badge-class-added', 'true');

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
  if (! entry || ! entry.classList) {
    return;
  }

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
 * Toggle the expanded state of collapsed travel entries on click.
 *
 * @param {HTMLElement} entry The journal entry.
 */
const addTravelEntryToggle = (entry) => {
  if (! entry || ! entry.classList || ! entry.classList.contains('floatingIslands')) {
    return;
  }

  if (! (entry.classList.contains('skyPalaceTravel') || entry.classList.contains('dirigibleTravel'))) {
    return;
  }

  if (entry.getAttribute('data-travel-toggle-added')) {
    return;
  }

  entry.setAttribute('data-travel-toggle-added', 'true');

  entry.addEventListener('click', (event) => {
    // Don't toggle when clicking a link in the entry.
    if (event.target.closest('a')) {
      return;
    }

    entry.classList.toggle('better-journal-travel-expanded');
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-styles');

  onJournalEntry(addBadgeClass, {
    id: 'better-journal-styles-badges',
    weight: 5000,
  });

  onJournalEntry(updateRankUpIcon, {
    id: 'better-journal-styles-rankup',
    weight: 6000,
  });

  onJournalEntry(addTravelEntryToggle, {
    id: 'better-journal-styles-travel-toggle',
    weight: 7000,
  });
};
