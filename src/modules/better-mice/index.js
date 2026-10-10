import {
  addStyles,
  addSubmenuItem,
  doRequest,
  getArForMouse,
  getData,
  getFlag,
  getRelicHunterLocation,
  getSetting,
  loadFeatures,
  makeCollapsible,
  makeElement,
  makeFavoriteButton,
  makeMhButton,
  onNavigation,
  onOverlayChange,
  onTurn,
  setPage,
  wikiUrl,
} from '@utils';

import { makeMouseLootSection } from '@utils/shared/loot';

import featureManifest from './feature-manifest';
import settings from './settings';
import { addPrizeInfo, isPrizeMouse } from './modules/prize-info';

import mhctRatesStyles from '../../utils/styles/mhct-rates.css';
import styles from './styles.css';

/**
 * Add a wiki link below the mouse description.
 *
 * @param {string}      name      The mouse name.
 * @param {HTMLElement} mouseView The mouse view element.
 */
const addWikiLink = (name, mouseView) => {
  const description = mouseView.querySelector('.mouseView-description');
  if (!description || mouseView.querySelector('.mouseview-wiki-link')) {
    return;
  }

  const link = makeElement('a', 'mouseview-wiki-link', 'View on wiki →');
  link.href = wikiUrl(name);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  description.after(link);
};

/**
 * Check if the mouse is a favorite.
 *
 * @param {string} mouseId The ID of the mouse.
 *
 * @return {boolean} Whether the mouse is a favorite.
 */
const isFavorite = async (mouseId) => {
  const favorites = await doRequest('managers/ajax/pages/page.php', {
    page_class: 'HunterProfile',
    'page_arguments[tab]': 'kings_crowns',
    'page_arguments[sub_tab]': false,
    'page_arguments[snuid]': window.user.sn_user_id,
  });

  if (!favorites?.page?.tabs?.kings_crowns?.subtabs[0]?.mouse_crowns?.favourite_mice.length) {
    return false;
  }

  // check if the mouseId matches the id property of any of the favorite mice
  return favorites.page.tabs.kings_crowns.subtabs[0].mouse_crowns.favourite_mice.some((mouse) => {
    return mouse.id && mouse.id === Number.parseInt(mouseId, 10);
  });
};

/**
 * Add the favorite button to the mouse view.
 *
 * @param {string}      mouseId   The ID of the mouse.
 * @param {HTMLElement} mouseView The mouse view element.
 */
const addFavoriteButton = async (mouseId, mouseView) => {
  const state = await isFavorite(mouseId);

  const fave = await makeFavoriteButton({
    target: mouseView,
    size: 'large',
    isSetting: false,
    state,
    /**
     * Save the favorite state when the button is clicked.
     */
    onChange: () => {
      doRequest('managers/ajax/mice/mouse_crowns.php', {
        action: 'toggle_favourite',
        user_id: window.user.user_id,
        mouse_id: mouseId,
      });
    },
  });

  const mouseviewImage = mouseView.querySelector('.mouseView-imageContainer');
  if (mouseviewImage) {
    mouseviewImage.append(fave);
  } else {
    mouseView.append(fave);
  }
};
// Power types in the order the minlucks use, which the effectiveness lists follow too. Parental
// is left out, as no one hunts with it.
const powerTypes = ['arcane', 'draconic', 'forgotten', 'hydro', 'physical', 'shadow', 'tactical', 'law', 'rift'];

// King's crowns, highest first.
const crownLevels = [
  { name: 'diamond', min: 2500 },
  { name: 'platinum', min: 1000 },
  { name: 'gold', min: 500 },
  { name: 'silver', min: 100 },
  { name: 'bronze', min: 10 },
];

/**
 * Make a power type icon.
 *
 * @param {string} powerType The power type.
 *
 * @return {HTMLElement} The icon.
 */
const makePowerTypeIcon = (powerType) => {
  const icon = makeElement('img', 'mouseview-power-type-img');
  icon.src = `https://www.mousehuntgame.com/images/powertypes/${powerType}.png`;
  icon.alt = powerType;

  return icon;
};

/**
 * Fill in the gold, points, and wisdom pills.
 *
 * @param {string}      mouseId   The ID of the mouse.
 * @param {HTMLElement} mouseView The mouse view element.
 * @param {HTMLElement} wrapper   The element to add the rewards to.
 */
const addRewards = async (mouseId, mouseView, wrapper) => {
  const values = mouseView.querySelector('.mouseView-values');
  if (!values) {
    wrapper.remove();
    return;
  }

  if (!wisdoms) {
    wisdoms = await getData('wisdom');
  }

  const wisdom = wisdoms.find((m) => m.id === Number.parseInt(mouseId, 10))?.wisdom;

  const rewards = [
    { key: 'gold', label: 'Gold', value: values.textContent.match(/([\d,]+)\s*Gold/i)?.[1] },
    { key: 'points', label: 'Points', value: values.textContent.match(/([\d,]+)\s*Points/i)?.[1] },
    { key: 'wisdom', label: 'Wisdom', value: wisdom ? wisdom.toLocaleString() : null },
  ];

  rewards.forEach(({ key, label, value }) => {
    if (!value) {
      return;
    }

    const reward = makeElement('div', ['mouseview-reward', key], `${value} ${label.toLowerCase()}`);
    reward.title = `${value} ${label}`;
    wrapper.append(reward);
  });

  values.classList.add('hidden');
};

/**
 * Add what the mouse drops, after the attraction rates.
 *
 * @param {string}      mouseId   The ID of the mouse.
 * @param {HTMLElement} mouseView The mouse view.
 */
const addLoot = async (mouseId, mouseView) => {
  const section = await makeMouseLootSection(mouseId);
  if (!section || !mouseView.isConnected || mouseView.getAttribute('data-mouse-id') !== `${mouseId}` || mouseView.querySelector('.mh-improved-loot')) {
    return;
  }

  (mouseView.querySelector('.mouseView-contentContainer') || mouseView).append(section);
};

/**
 * Fill in the minlucks, showing every power type and fading the ones that can't catch the mouse.
 * Rift only gets a spot when it can, as it's otherwise noise for most mice.
 *
 * @param {string}      mouseId The ID of the mouse.
 * @param {HTMLElement} section The element to add the minlucks to.
 */
const addMinluck = async (mouseId, section) => {
  if (!minlucks) {
    minlucks = await getData('minlucks');
  }

  const mouseMinlucks = minlucks.find((m) => m.id === Number.parseInt(mouseId, 10))?.minlucks || {};
  const isEffective = (powerType) => mouseMinlucks[powerType] && '∞' !== mouseMinlucks[powerType];
  if (!powerTypes.some((powerType) => isEffective(powerType))) {
    section.remove();
    return;
  }

  makeElement('div', ['minluck-title', 'mouseview-section-title'], 'Minlucks', section);

  const minluckList = makeElement('ul', 'minluck-list');
  powerTypes
    .filter((powerType) => 'rift' !== powerType || isEffective(powerType))
    .forEach((powerType) => {
      const effective = isEffective(powerType);
      const minluckItem = makeElement('li', ['minluck-item', effective ? 'is-effective' : 'is-faded']);
      minluckItem.title = effective ? `${powerType}: ${mouseMinlucks[powerType]}` : `${powerType}: not effective`;
      minluckItem.append(makePowerTypeIcon(powerType));

      if (effective) {
        makeElement('div', 'minluck-power-type-minluck', mouseMinlucks[powerType], minluckItem);
      }

      minluckList.append(minluckItem);
    });

  section.append(minluckList);
};

/**
 * Swap the game's weakness lists for ones in the minluck order, without parental.
 *
 * @param {HTMLElement} mouseView The mouse view element.
 * @param {HTMLElement} section   The element to add the lists to.
 */
const addEffectiveness = (mouseView, section) => {
  const weaknessContainer = mouseView.querySelector('.mouseView-weaknessContainer');
  if (!weaknessContainer) {
    section.remove();
    return;
  }

  weaknessContainer.querySelectorAll('.mouseView-categoryContent-subgroup-mouse-weaknesses').forEach((group) => {
    const types = new Set([...group.querySelectorAll('.mouseView-weakness')].map((weakness) => weakness.getAttribute('title')?.toLowerCase()));
    const effective = powerTypes.filter((powerType) => types.has(powerType));
    if (!effective.length) {
      return;
    }

    const label = group.querySelector('.mouseView-categoryContent-subgroup-mouse-weaknesses-label')?.textContent.trim() || 'Effective';
    makeElement('div', 'mouseview-effectiveness-label', label, section);

    const row = makeElement('div', 'mouseview-effectiveness-row');
    effective.forEach((powerType) => {
      const icon = makePowerTypeIcon(powerType);
      icon.title = powerType;
      row.append(icon);
    });

    section.append(row);
  });

  weaknessContainer.classList.add('hidden');

  if (!section.children.length) {
    section.remove();
  }
};

/**
 * Show the catches large in the title row, with the crown they've earned.
 *
 * @param {HTMLElement} mouseView The mouse view element.
 */
const addCatches = (mouseView) => {
  const titleContainer = mouseView.querySelector('.mouseView-titleContainer');
  const catchesRow = [...mouseView.querySelectorAll('.mouseView-statsContainer tr')].find((row) => /catches/i.test(row.textContent));
  const catches = catchesRow
    ?.querySelector('abbr')
    ?.getAttribute('title')
    ?.replace(/\s*catches\s*/i, '')
    .trim();
  if (!titleContainer || !catches) {
    return;
  }

  const count = Number.parseInt(catches.replaceAll(',', ''), 10) || 0;
  const crown = crownLevels.find((c) => count >= c.min);

  const badge = makeElement('div', ['mouseview-catches', crown ? crown.name : 'no-crown']);
  badge.title = crown ? `${catches} catches: ${crown.name} crown` : `${catches} catches`;

  if (crown) {
    const crownImg = makeElement('img', 'mouseview-catches-crown');
    crownImg.src = `https://www.mousehuntgame.com/images/ui/crowns/crown_${crown.name}.png`;
    crownImg.alt = `${crown.name} crown`;
    badge.append(crownImg);
  }

  const text = makeElement('div', 'mouseview-catches-text');
  makeElement('div', 'mouseview-catches-count', catches, text);
  makeElement('div', 'mouseview-catches-label', 1 === count ? 'catch' : 'catches', text);
  badge.append(text);

  titleContainer.append(badge);
};

/**
 * Update the mouse view.
 */
const updateMouseView = async () => {
  const mouseView = document.querySelector('#overlayPopup .mouseView');
  if (!mouseView) {
    return;
  }

  const mouseId = mouseView.getAttribute('data-mouse-id');
  if (!mouseId) {
    return;
  }

  const name = mouseView.querySelector('.mouseView-title');
  if (!name) {
    return;
  }

  const imageContainer = mouseView.querySelector('.mouseView-imageContainer');
  if (!imageContainer || mouseView.classList.contains('mouseview-has-mhct')) {
    return;
  }

  mouseView.classList.add('mouseview-has-mhct');

  // Show the full catches and misses instead of the abbreviated ones.
  mouseView.querySelectorAll('.mouseView-statsContainer-block-padding td abbr').forEach((el) => {
    const number = el
      .getAttribute('title')
      .replace(/\s*(catches|misses)\s*/i, '')
      .trim();
    if (number) {
      el.innerText = number;
    }
  });

  // The name and group stack on the left of the title row, with the catches on the right.
  const titleContainer = mouseView.querySelector('.mouseView-titleContainer');
  if (titleContainer) {
    const titleText = makeElement('div', 'mouseview-title-text');
    titleContainer.prepend(titleText);
    titleText.append(name);

    const group = mouseView.querySelector('.mouseView-group');
    if (group) {
      group.classList.add('mouseview-title-group');
      titleText.append(group);

      const subGroups = group.innerHTML.replace('Group: ', '').split('(');
      group.innerHTML =
        subGroups.length > 1
          ? `<span class="mouseview-group">${subGroups[0]}</span><span class="mouseview-subgroup">(${subGroups[1]}</span>`
          : `<span class="mouseview-group">${subGroups[0]}</span>`;
    }
  }

  addCatches(mouseView);
  addWikiLink(name.innerText, mouseView);
  addFavoriteButton(mouseId, mouseView);

  // The stats and effectiveness sit under the image. The minlucks and attraction rates go under
  // the description.
  const movedContainer = makeElement('div', 'mouseView-movedContainer');
  imageContainer.append(movedContainer);

  // The rewards sit between the title and the description.
  const rewards = makeElement('div', 'mouseview-rewards');
  if (titleContainer) {
    titleContainer.after(rewards);
  } else {
    movedContainer.append(rewards);
  }
  addRewards(mouseId, mouseView, rewards);

  const minluckSection = makeElement('div', ['minluck-container', 'mouseview-section']);
  const descriptionContainer = mouseView.querySelector('.mouseView-descriptionContainer');
  if (descriptionContainer) {
    descriptionContainer.after(minluckSection);
  } else {
    movedContainer.append(minluckSection);
  }

  addMinluck(mouseId, minluckSection);

  const details = makeElement('div', 'mouseview-details');
  const statsContainer = mouseView.querySelector('.mouseView-statsContainer');
  if (statsContainer) {
    details.append(statsContainer);
  }

  const effectivenessSection = makeElement('div', 'mouseview-effectiveness');
  details.append(effectivenessSection);
  addEffectiveness(mouseView, effectivenessSection);

  movedContainer.append(details);

  addPrizeInfo(mouseId, mouseView);

  if (401 === Number.parseInt(mouseId, 10)) {
    const location = await getRelicHunterLocation();

    if (location && location.name) {
      const relicHunterBox = makeElement('div', ['mouseview-relicHunter', 'mouseview-relicHunter']);
      makeElement('div', 'hint', location.name, relicHunterBox);

      makeMhButton({
        text: 'Travel',
        size: 'small',
        callback: () => {
          hg.utils.User.travel(location.id);
          setPage('Camp');
        },
        appendTo: relicHunterBox,
      });

      movedContainer.append(relicHunterBox);
    }
  }

  if (getSetting('better-mice.show-loot', true)) {
    addLoot(mouseId, mouseView);
  }

  // Prize mice show cooldown info instead of attraction rates.
  if (isPrizeMouse(mouseId) || !getSetting('better-mice.show-attraction-rates', true)) {
    return;
  }

  const contentContainer = mouseView.querySelector('.mouseView-contentContainer');
  const arWrapper = makeElement('div', 'ar-wrapper');
  const title = makeElement('div', 'ar-header');
  const titleText = makeElement('div', 'ar-title', 'Attraction Rates');
  title.append(titleText);

  const link = makeElement('a', 'ar-link', 'View on MHCT →');
  link.href = `https://api.mouse.rip/mhct-redirect/${mouseId}`;
  link.target = '_blank';
  title.append(link);

  arWrapper.append(title);

  let mhctJson = await getArForMouse(mouseId, 'mouse');
  if (!mhctJson || mhctJson === undefined || mhctJson.length === 0 || 'error' in mhctJson) {
    return;
  }

  mhctJson = mhctJson.slice(0, 15);

  const miceArWrapper = makeElement('div', 'mice-ar-wrapper');
  const hasStages = mhctJson.some((mouseAr) => mouseAr.stage);
  if (hasStages) {
    miceArWrapper.classList.add('has-stages');
  }

  const calculateWidths = (weights) => {
    weights = {
      average: 0.8,
      median: 0.5,
      max: 0.4,
      shortest: 0.9,
      location: 0.4,
      stage: 0.6,
      cheese: 0.6,
      keyWidth: 10,
      ...weights,
    };

    const availableWidth = (contentContainer?.clientWidth || 450) - 20 - 60 - 10 * 3 - (hasStages ? 10 : 0);

    const calculateLengths = (key) => {
      const keyLengths = mhctJson.map((mouseAr) => mouseAr[key]?.length || 0).filter((l) => l > 0);
      keyLengths.sort((a, b) => a - b);

      const totalLength = keyLengths.reduce((a, b) => a + b, 0);
      const avgLength = totalLength / keyLengths.length;
      const medianLength =
        keyLengths.length % 2 === 0 ? (keyLengths[keyLengths.length / 2 - 1] + keyLengths[keyLengths.length / 2]) / 2 : keyLengths[Math.floor(keyLengths.length / 2)];

      return {
        avg: avgLength * weights.keyWidth,
        median: medianLength * weights.keyWidth,
        max: Math.max(...keyLengths) * weights.keyWidth,
        shortest: Math.min(...keyLengths) * weights.keyWidth,
      };
    };

    const lengths = {
      location: calculateLengths('location'),
      stage: hasStages ? calculateLengths('stage') : { avg: 1, median: 1, max: 1, shortest: 1 },
      cheese: calculateLengths('cheese'),
    };

    const weightedWidths = {
      location:
        (lengths.location.avg * weights.average + lengths.location.max * weights.max + lengths.location.median * weights.median + lengths.location.shortest * weights.shortest) *
        weights.location,

      stage: hasStages
        ? (lengths.stage.avg * weights.average + lengths.stage.max * weights.max + lengths.stage.median * weights.median + lengths.stage.shortest * weights.shortest) *
          weights.stage
        : 0,

      cheese:
        (lengths.cheese.avg * weights.average + lengths.cheese.max * weights.max + lengths.cheese.median * weights.median + lengths.cheese.shortest * weights.shortest) *
        weights.cheese,
    };

    const totalWeightedWidth = weightedWidths.location + weightedWidths.stage + weightedWidths.cheese;

    const calculateOptimalWidth = (key) => {
      const optimalWidth = (weightedWidths[key] / totalWeightedWidth) * availableWidth;
      return Math.floor(optimalWidth);
    };

    return {
      locationWidth: calculateOptimalWidth('location'),
      stageWidth: hasStages ? calculateOptimalWidth('stage') : 0,
      cheeseWidth: calculateOptimalWidth('cheese'),
    };
  };

  let locationWidth, stageWidth, cheeseWidth;
  if (!getFlag('better-mice-no-new-ar-widths')) {
    const widths = calculateWidths();
    locationWidth = widths.locationWidth;
    stageWidth = widths.stageWidth;
    cheeseWidth = widths.cheeseWidth;
  }

  mhctJson.forEach((mouseAr) => {
    const mouseArWrapper = makeElement('div', 'mouse-ar-wrapper');
    if (!getFlag('better-mice-no-new-ar-widths')) {
      mouseArWrapper.style.gridTemplateColumns = hasStages ? `${locationWidth}px ${stageWidth}px ${cheeseWidth}px 60px` : `${locationWidth}px ${cheeseWidth}px 60px`;
    }

    makeElement('div', 'location', mouseAr.location, mouseArWrapper);

    if (hasStages) {
      makeElement('div', 'stage', mouseAr.stage ? mouseAr.stage.replace('/', ' / ').replace('  /  ', ' / ') : '', mouseArWrapper);
    }

    makeElement('div', 'cheese', mouseAr.cheese, mouseArWrapper);
    makeElement('div', 'rate', `${(mouseAr.rate / 100).toFixed(2)}%`, mouseArWrapper);

    miceArWrapper.append(mouseArWrapper);
  });

  if (mhctJson.length > 0) {
    arWrapper.append(miceArWrapper);
    makeCollapsible({ key: 'mouse-view.attraction-rates', section: arWrapper, header: title });

    // The loot goes after the attraction rates, whichever loads first.
    const loot = mouseView.querySelector('.mh-improved-loot');
    if (loot) {
      loot.before(arWrapper);
    } else {
      (contentContainer || mouseView).append(arWrapper);
    }
  }
};

let _original;

/**
 * Replace the showMouseImage function to show the mouse view.
 */
const replaceShowMouseImage = () => {
  if (_original) {
    return;
  }

  _original = hg.views.MouseCrownsView.showMouseImage;

  /**
   * Show the mouse view.
   *
   * @param {HTMLElement} element The element that was clicked.
   */
  hg.views.MouseCrownsView.showMouseImage = (element) => {
    const type = element.getAttribute('data-mouse-type');
    if (type) {
      hg.views.MouseView.show(type);
      return;
    }

    _original(element);
  };
};

const addShowMouseToNewJournalEntries = () => {
  const newEntries = document.querySelectorAll('.newEntry');
  if (!newEntries.length) {
    return;
  }

  newEntries.forEach((entry) => {
    const mouseType = entry.getAttribute('data-mouse-type');
    const journalImageLink = entry.querySelector('.journalimage a');

    if (!mouseType || !journalImageLink) {
      return;
    }

    journalImageLink.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.MouseView.show(mouseType);
    });
  });
};

let copyListener;
const copyKingsCrowns = () => {
  copyListener?.remove();
  copyListener = document.addEventListener('copy', (e) => {
    if (window.getSelection && window.getSelection().toString().length > 0) {
      return;
    }

    const mice = document.querySelectorAll('.mouseCrownsView-group-mouse-padding');
    if (!mice || !mice.length) {
      return;
    }

    // Define the crown types and their thresholds
    const crowns = [
      { name: 'Diamond Crown', min: 2500, max: Number.POSITIVE_INFINITY },
      { name: 'Platinum Crown', min: 1000, max: 2499 },
      { name: 'Gold Crown', min: 500, max: 999 },
      { name: 'Silver Crown', min: 100, max: 499 },
      { name: 'Bronze Crown', min: 10, max: 99 },
      { name: 'No Crown', min: 0, max: 9 },
    ];

    // Prepare a map for each crown group
    const grouped = crowns.map((crown) => ({
      ...crown,
      mice: [],
    }));

    // Collect mouse data and group by crown
    mice.forEach((mouse) => {
      const catches = Number.parseInt(mouse.querySelector('.mouseCrownsView-group-mouse-catches').innerText.replaceAll(',', ''), 10);
      const name = mouse.querySelector('.mouseCrownsView-group-mouse-name').innerText.trim();

      const group = grouped.find((crown) => catches >= crown.min && catches <= crown.max);
      if (group && group.mice && !group.mice.some((m) => m.name === name && m.catches === catches)) {
        group.mice.push({ catches, name });
      }
    });

    // Sort each group by catches descending
    grouped.forEach((group) => {
      group.mice.sort((a, b) => b.catches - a.catches);
    });

    // Output format
    const lines = [];
    grouped.forEach((group) => {
      if (group.mice.length === 0) {
        return;
      }
      lines.push(`${group.name} (${group.mice.length})`, `Earned at ${group.min.toLocaleString()} catches`);
      group.mice.forEach((mouse) => {
        lines.push(`${mouse.catches}`, `${mouse.name}`);
      });
    });

    if (!lines.length) {
      return;
    }

    e.clipboardData.setData('text/plain', lines.join('\n'));
    e.preventDefault();
  });
};

/**
 * Run the module.
 */
const main = async () => {
  onOverlayChange({ mouse: { show: updateMouseView } });

  minlucks = await getData('minlucks');
  wisdoms = await getData('wisdom');

  addSubmenuItem({
    menu: 'mice',
    label: 'Groups',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/mice.png',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=groups',
  });

  addSubmenuItem({
    menu: 'mice',
    label: 'Regions',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/travel.png',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=regions',
  });

  addSubmenuItem({
    menu: 'mice',
    label: 'Your Stats (Groups)',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/mice.png',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=your_stats&sub_tab=group',
  });

  addSubmenuItem({
    menu: 'mice',
    label: 'Your Stats (Locations)',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/travel.png',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=your_stats&sub_tab=location',
  });

  addSubmenuItem({
    menu: 'mice',
    label: "King's Crowns",
    icon: 'https://www.mousehuntgame.com/images/ui/crowns/crown_silver.png',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=kings_crowns',
  });
};

let wisdoms;
let minlucks;
/**
 * Initialize the module.
 */
const init = () => {
  addStyles([mhctRatesStyles, styles], 'better-mice');
  main();

  loadFeatures(featureManifest);

  replaceShowMouseImage();

  onNavigation(copyKingsCrowns, {
    page: 'hunterprofile',
    subtab: 'kings_crowns',
    tab: 'kings_crowns',
  });

  onNavigation(copyKingsCrowns, {
    page: 'adversaries',
    subtab: 'kings_crowns',
    tab: 'kings_crowns',
  });

  onTurn(addShowMouseToNewJournalEntries, 100);
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-mice',
  name: 'Better Mice',
  type: 'maps-mice',
  default: true,
  description:
    "Add attraction rates and MH Wiki and MHCT links to mouse popups, sort and total the mouse stats pages, add a King's Crown tab, and add a crown summary to King's Crowns.",
  load: init,
  settings,
};
