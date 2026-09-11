import { addStyles, getFlag, getUserTitle, getUserTitleShield, makeElement, onJournalEntry } from '@utils';

import * as imported from './styles/**/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

const thiefBaseImages = {
  normal: 'https://www.mousehuntgame.com/images/items/bases/97f154ce0952303b5669a54597045aa8_vstealth.jpg',
  chrome: 'https://www.mousehuntgame.com/images/items/bases/7fa1ec55bb30282811d4bfc55b6c653e_vstealth.jpg',
};

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
 * The fullstop styles hide the first <br> in fullyExplored entries, which glues
 * the sentences of single-line entries together ("vault!I can continue"), so
 * swap a lone <br> for a space. Entries with more <br>s keep a visible break.
 *
 * @param {Object} model The journal entry model.
 */
const fixFullyExploredSpacing = (model) => {
  if (!(model.classes.has('floatingIslands') && model.classes.has('fullyExplored'))) {
    return;
  }

  const brs = model.html.match(/<br\s*\/?>/gi);
  if (brs && 1 === brs.length) {
    model.setHtml(model.html.replace(brs[0], ' '));
  }
};

/**
 * The fullstop styles hide the first and last <br> in an entry, which glues the
 * sentences of Zokor stealth-loss entries together ("ruckus!I lost 2 Stealth").
 * They read best as a single compact line, so swap every <br> for a space.
 *
 * @param {Object} model The journal entry model.
 */
const fixAncientStealthSpacing = (model) => {
  if (!model.classes.has('ancient-stealth')) {
    return;
  }

  model.setHtml(model.html.replaceAll(/<br\s*\/?>/gi, ' '));
};

/**
 * The Polar Vortex Trap's squall entry (noelWeaponEffect) ships without a
 * journal image, so add the weapon's image to lay it out like a normal entry.
 *
 * @param {Object} model The journal entry model.
 */
const addNoelWeaponImage = (model) => {
  if (!model.classes.has('noelWeaponEffect')) {
    return;
  }

  const entry = model.el;
  if (entry.querySelector('.journalimage')) {
    return;
  }

  const image = makeElement('div', 'journalimage');
  const img = document.createElement('img');
  img.src = 'https://www.mousehuntgame.com/images/items/weapons/63ed8bbae283944bba2268a8444f65c6.jpg';
  image.append(img);
  entry.prepend(image);
};

/**
 * The Zokor stealth-loss entries can omit their journal image, so add the
 * regular Thief Base as a Stealth-loss marker. Entries that name the Chrome
 * Thief Base receive its matching variant.
 *
 * @param {Object} model The journal entry model.
 */
const addThiefBaseImage = (model) => {
  if (!model.classes.has('ancient-stealth')) {
    return;
  }

  const entry = model.el;
  let image = entry.querySelector('.journalimage');
  if (image?.querySelector('img')) {
    return;
  }

  const text = entry.querySelector('.journaltext')?.textContent || '';

  if (!image) {
    image = makeElement('div', 'journalimage');
    entry.prepend(image);
  }

  const img = document.createElement('img');
  img.src = /my chrome thief base made a ruckus/i.test(text) ? thiefBaseImages.chrome : thiefBaseImages.normal;
  image.append(img);
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

  if (!getFlag('show-lucky-icon')) {
    addStyles('.journal .content .entry .journaltext .lucky::after { display: none; }', 'better-journal-styles-hide-lucky-icon');
  }

  onJournalEntry(cleanBadgeText, {
    id: 'better-journal-styles-badge-text',
    stage: 'text',
  });

  onJournalEntry(fixFullyExploredSpacing, {
    id: 'better-journal-styles-fully-explored-spacing',
    stage: 'text',
  });

  onJournalEntry(fixAncientStealthSpacing, {
    id: 'better-journal-styles-ancient-stealth-spacing',
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

  onJournalEntry(addNoelWeaponImage, {
    id: 'better-journal-styles-noel-weapon-image',
    stage: 'images',
  });

  onJournalEntry(addThiefBaseImage, {
    id: 'better-journal-styles-thief-base-image',
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
