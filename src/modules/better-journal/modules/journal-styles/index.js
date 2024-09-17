import {
  addStyles,
  getUserTitle,
  getUserTitleShield,
  makeElement,
  onJournalEntry
} from '@utils';

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

const hoverImages = {
  mythweaver: 'https://i.mouse.rip/mythweaver.gif',
  mythical_giant_king: 'https://i.mouse.rip/mythical_giant_king.gif',
  mythical_master_sorcerer: 'https://i.mouse.rip/mythical_master_sorcerer.gif',
  mythical_dragon_emperor: 'https://i.mouse.rip/mythical_dragon_emperor.gif',
};

const addJournalHover = (entry) => {
  const mouseType = entry.getAttribute('data-mouse-type');
  if (! mouseType || ! hoverImages[mouseType]) {
    return;
  }

  const mouseLink = entry.querySelector('.journalimage a');
  if (! mouseLink) {
    return;
  }

  const mouseImage = mouseLink.querySelector('img');
  if (! mouseImage) {
    return;
  }

  const hoverImage = makeElement('img', 'hidden');
  hoverImage.src = hoverImages[mouseType];
  mouseLink.append(hoverImage);

  entry.addEventListener('mouseover', () => {
    hoverImage.classList.remove('hidden');
    mouseImage.classList.add('hidden');
  });

  entry.addEventListener('mouseout', () => {
    hoverImage.classList.add('hidden');
    masterSorcererImage.classList.remove('hidden');
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-styles');

  onJournalEntry(addBadgeClass, 4000);
  onJournalEntry(updateRankUpIcon, 4000);
  onJournalEntry(addJournalHover, 4000);
};
