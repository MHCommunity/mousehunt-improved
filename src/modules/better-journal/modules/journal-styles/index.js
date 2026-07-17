import { addStyles, getUserTitle, getUserTitleShield, onJournalEntry } from '@utils';

import * as imported from './styles/**/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Add a class to show the badge type.
 *
 * @param {Object} model The journal entry model.
 */
const cleanBadgeText = (model) => {
  if (!model.classes.has('badge')) {
    return;
  }

  model.setHtml(
    model.html
      .replace('I can view my trophy crowns on my', '')
      .replace('<a href="https://www.mousehuntgame.com/hunterprofile.php?tab=kings_crowns">hunter profile</a>', '')
      .replace('<br>', '')
      .replace('.', '')
      .trim()
  );
};

/**
 * Add a class to show the badge type.
 *
 * @param {Object} model The journal entry model.
 */
const addBadgeClass = (model) => {
  const entry = model.el;
  if (!model.classes.has('badge')) {
    return;
  }

  const badgeType = entry.querySelector('.journalimage img');
  if (!badgeType) {
    return;
  }

  const badgeTypeClass = badgeType.src.replace('https://www.mousehuntgame.com/images/ui/crowns/crown_', '').replace('.png', '').trim();

  entry.classList.add(`better-journal-styles-badge-${badgeTypeClass}`);
};

/**
 * Replace the rank up icon with the user's title shield.
 *
 * @param {Object} model The journal entry model.
 */
const updateRankUpIcon = (model) => {
  if (!model.classes.has('titlechange')) {
    return;
  }

  const entry = model.el;
  const rankUp = entry.querySelector('.journalimage img');
  if (!rankUp) {
    return;
  }

  const shield = getUserTitleShield(getUserTitle());
  if (!shield) {
    return;
  }

  rankUp.src = shield;
};

/**
 * Toggle the expanded state of collapsed travel entries on click.
 *
 * @param {Object} model The journal entry model.
 */
const addTravelEntryToggle = (model) => {
  const entry = model.el;
  if (!model.classes.has('floatingIslands')) {
    return;
  }

  if (!(model.classes.has('skyPalaceTravel') || model.classes.has('dirigibleTravel'))) {
    return;
  }

  entry.addEventListener('click', (event) => {
    // Don't toggle when clicking a link in the entry.
    if (event.target.closest('a')) {
      return;
    }

    entry.classList.toggle('better-journal-travel-expanded');
  });
};

/**
 * Toggle the expanded state of collapsed gift entries on click.
 *
 * @param {Object} model The journal entry model.
 */
const addGiftEntryToggle = (model) => {
  const entry = model.el;
  if (!model.classes.has('socialGift-send')) {
    return;
  }

  entry.addEventListener('click', (event) => {
    // Don't toggle when clicking a link in the entry.
    if (event.target.closest('a')) {
      return;
    }

    entry.classList.toggle('better-journal-gift-expanded');
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-journal-styles');

  onJournalEntry(cleanBadgeText, {
    id: 'better-journal-styles-badge-text',
    stage: 'text',
  });

  onJournalEntry(addBadgeClass, {
    id: 'better-journal-styles-badges',
    stage: 'style-classes',
  });

  onJournalEntry(updateRankUpIcon, {
    id: 'better-journal-styles-rankup',
    stage: 'images',
  });

  onJournalEntry(addTravelEntryToggle, {
    id: 'better-journal-styles-travel-toggle',
    stage: 'interactions',
  });

  onJournalEntry(addGiftEntryToggle, {
    id: 'better-journal-styles-gift-toggle',
    stage: 'interactions',
  });
};
