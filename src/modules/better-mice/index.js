import {
  addStyles,
  addSubmenuItem,
  doRequest,
  getArForMouse,
  getData,
  getRelicHunterLocation,
  getSetting,
  makeElement,
  makeFavoriteButton,
  makeLink,
  makeTooltip,
  onOverlayChange,
  setPage
} from '@utils';

import hoverMice from './hover-mice';
import mousePage from './mouse-page';
import settings from './settings';
import sidebar from './sidebar';

import styles from './styles.css';

/**
 * Get the markup for the mouse links.
 *
 * @param {string} name The name of the mouse.
 * @param {string} id   The ID of the mouse.
 *
 * @return {string} The markup for the mouse links.
 */
const getLinkMarkup = (name, id) => {
  return makeLink('MHCT AR', `https://api.mouse.rip/mhct-redirect/${id}`) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}`);
};

/**
 * Add links to the mouse overlay.
 *
 * @param {string} id The ID of the mouse.
 */
const addLinks = (id) => {
  const title = document.querySelector('.mouseView-title');
  if (! title) {
    return;
  }

  const currentLinks = document.querySelector('.mh-ui-mouse-links');
  if (currentLinks) {
    currentLinks.remove();
  }

  const div = document.createElement('div');
  div.classList.add('mh-ui-mouse-links');
  div.innerHTML = getLinkMarkup(title.innerText, id);
  title.parentNode.insertBefore(div, title);

  // Move the values into the main text.
  const values = document.querySelector('.mouseView-values');
  const desc = document.querySelector('.mouseView-descriptionContainer');
  if (values && desc) {
    // insert as first child of desc
    desc.insertBefore(values, desc.firstChild);
  }
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

  if (! favorites?.page?.tabs?.kings_crowns?.subtabs[0]?.mouse_crowns?.favourite_mice.length) {
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

/**
 * Add the minluck to the mouse view.
 *
 * @param {string}      mouseId   The ID of the mouse.
 * @param {HTMLElement} mouseView The mouse view element.
 */
const addMinluck = async (mouseId, mouseView) => {
  // get the description container
  const appendTo = mouseView.querySelector('.mouseView-contentContainer');
  if (! appendTo) {
    return;
  }

  const minluckContainer = makeElement('div', 'minluck-container');
  const titleText = makeElement('div', 'minluck-title', 'Minlucks');

  makeTooltip({
    appendTo: titleText,
    text: 'If your current luck is above the minluck, you are guaranteed to catch the mouse if you attract it.',
  });

  minluckContainer.append(titleText);

  // foreach minluck, output the power type and the minluck
  const minluckList = makeElement('ul', 'minluck-list');

  // find the mouse in the minlucks data by id
  const minluck = minlucks.find((m) => m.id === Number.parseInt(mouseId, 10));
  const mouseMinlucks = minluck?.minlucks || {};

  // We need the keys and values in our loop,
  // so we can't use a for...in loop.
  Object.keys(mouseMinlucks).forEach((powerType) => {
    if (! mouseMinlucks[powerType] || '∞' === mouseMinlucks[powerType]) {
      return;
    }

    const minluckItem = makeElement('li', 'minluck-item');

    const powerTypeImg = makeElement('img', 'minluck-power-type-img');
    powerTypeImg.src = `https://www.mousehuntgame.com/images/powertypes/${powerType.toLowerCase()}.png`;
    minluckItem.append(powerTypeImg);

    makeElement('div', 'minluck-power-type-minluck', mouseMinlucks[powerType], minluckItem);

    minluckList.append(minluckItem);
  });

  minluckContainer.append(minluckList);

  appendTo.append(minluckContainer);
};

/**
 * Add the wisdom to the mouse view.
 *
 * @param {string}      mouseId   The ID of the mouse.
 * @param {HTMLElement} mouseView The mouse view element.
 */
const addWisdom = async (mouseId, mouseView) => {
  const values = mouseView.querySelector('.mouseView-values');
  if (! values) {
    return;
  }

  if (! wisdoms) {
    wisdoms = await getData('wisdom');
  }

  let wisdom = wisdoms.find((m) => m.id === Number.parseInt(mouseId, 10));

  wisdom = wisdom?.wisdom || 0;

  // comma separate the wisdom number
  wisdom = wisdom.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
  makeElement('span', 'wisdom-container', ` / ${wisdom} Wisdom`, values);
};

/**
 * Update the mouse view.
 */
const updateMouseView = async () => {
  const mouseView = document.querySelector('#overlayPopup .mouseView');
  if (! mouseView) {
    return;
  }

  const mouseId = mouseView.getAttribute('data-mouse-id');
  if (! mouseId) {
    return;
  }

  const name = mouseView.querySelector('.mouseView-title');
  if (! name) {
    return;
  }

  const catchesEl = document.querySelectorAll('.mouseView-statsContainer-block-padding td abbr');
  if (catchesEl && catchesEl.length > 0) {
    catchesEl.forEach((el) => {
      // remove the ' catches' from the title and use it as the text
      const catchesNumber = el
        .getAttribute('title')
        .replace(' Catches', '')
        .replace(' catches', '')
        .replace(' Misses', '')
        .replace(' misses', '')
        .trim();
      if (catchesNumber) {
        el.innerText = catchesNumber;
      }
    });
  }

  addLinks(mouseId);

  addFavoriteButton(mouseId, mouseView);

  addMinluck(mouseId, mouseView);

  addWisdom(mouseId, mouseView);

  mouseView.classList.add('mouseview-has-mhct');

  const group = document.querySelector('.mouseView-group');
  if (group) {
    group.classList.add('mouseview-title-group');

    const descContainer = document.querySelector('.mouseView-descriptionContainer');
    if (descContainer) {
      if (descContainer.childNodes.length > 1) {
        descContainer.insertBefore(group, descContainer.childNodes[1]);
      } else {
        descContainer.append(group);
      }
    }
  }

  const groupTitle = mouseView.querySelector('.mouseView-group.mouseview-title-group');
  if (groupTitle) {
    let newHtml = groupTitle.innerHTML.replace('Group: ', '');
    const subGroups = newHtml.split('(');
    if (subGroups.length > 1) {
      newHtml = `<span class="mouseview-group">${subGroups[0]}</span><span class="mouseview-subgroup">(${subGroups[1]}</span>`;
      groupTitle.classList.add('mouseview-title-group-has-subgroup');
    } else {
      newHtml = `<span class="mouseview-group">${newHtml}</span>`;
    }

    groupTitle.innerHTML = newHtml;
  }

  const container = mouseView.querySelector('.mouseView-contentContainer');
  if (! container) {
    return;
  }

  const imageContainer = mouseView.querySelector('.mouseView-imageContainer');
  if (imageContainer) {
    const movedContainer = makeElement('div', 'mouseView-movedContainer');

    const statsContainer = mouseView.querySelector('.mouseView-statsContainer');
    if (statsContainer) {
      movedContainer.append(statsContainer);
    }

    const weaknessContainer = mouseView.querySelector('.mouseView-weaknessContainer');
    if (weaknessContainer) {
      movedContainer.append(weaknessContainer);
      const weaknesses = weaknessContainer.querySelectorAll('.mouseView-categoryContent-subgroup-mouse-weaknesses-padding');
      weaknesses.forEach((w) => {
        const weakness = w.querySelector('.mouseView-weakness');
        if (! weakness) {
          w.classList.add('mouseview-weakness-empty');
          w.classList.add('hidden');
        }
      });
    }

    if (401 === Number.parseInt(mouseId, 10)) {
      const location = await getRelicHunterLocation();

      if (location && location.name) {
        const relicHunterBox = makeElement('div', ['mouseview-relicHunter', 'mouseview-relicHunter']);
        makeElement('div', 'hint', location.name, relicHunterBox);
        const button = makeElement('div', ['mousehuntActionButton', 'small']);
        makeElement('span', '', 'Travel', button);
        button.addEventListener('click', () => {
          app.pages.TravelPage.travel(location.id);
          setPage('Camp');
        });

        relicHunterBox.append(button);

        movedContainer.append(relicHunterBox);
      }
    }

    imageContainer.append(movedContainer);
  }

  if (! getSetting('better-mice.show-attraction-rates', true)) {
    return;
  }

  const arWrapper = makeElement('div', 'ar-wrapper');
  const title = makeElement('div', 'ar-header');
  const titleText = makeElement('div', 'ar-title', 'Attraction Rates', title);

  makeTooltip({
    appendTo: titleText,
    text: 'The best location and bait, according to data gathered by <a href="https://mhct.win/" target="_blank" rel="noopener noreferrer">MHCT</a>.',
  });

  const link = makeElement('a', 'ar-link', 'View on MHCT →');
  link.href = `https://api.mouse.rip/mhct-redirect/${mouseId}`;
  link.target = '_mhct';
  title.append(link);

  arWrapper.append(title);

  let mhctJson = await getArForMouse(mouseId, 'mouse');
  if (! mhctJson || mhctJson === undefined || mhctJson.length === 0 || 'error' in mhctJson) {
    return;
  }

  mhctJson = mhctJson.slice(0, 15);

  const miceArWrapper = makeElement('div', 'mice-ar-wrapper');
  const hasStages = mhctJson.some((mouseAr) => mouseAr.stage);
  if (hasStages) {
    miceArWrapper.classList.add('has-stages');
  }

  mhctJson.forEach((mouseAr) => {
    const mouseArWrapper = makeElement('div', 'mouse-ar-wrapper');

    makeElement('div', 'location', mouseAr.location, mouseArWrapper);

    if (hasStages) {
      makeElement('div', 'stage', mouseAr.stage, mouseArWrapper);
    }

    makeElement('div', 'cheese', mouseAr.cheese, mouseArWrapper);
    makeElement('div', 'rate', `${(mouseAr.rate / 100).toFixed(2)}%`, mouseArWrapper);

    miceArWrapper.append(mouseArWrapper);
  });

  if (mhctJson.length > 0) {
    arWrapper.append(miceArWrapper);
    container.append(arWrapper);
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
    label: 'Your Stats',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/special.png',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=your_stats',
  });

  addSubmenuItem({
    menu: 'mice',
    label: 'King\'s Crowns',
    icon: 'https://www.mousehuntgame.com/images/ui/crowns/crown_silver.png',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=kings_crowns',
  });
};

let wisdoms;
let minlucks;
/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'better-mice');
  main();
  mousePage();

  if (getSetting('better-mice.show-mouse-hover', true)) {
    excludeFromStandaloneUserscript: hoverMice();
  }

  if (getSetting('better-mice.show-mice-sidebar', true)) {
    excludeFromStandaloneUserscript: sidebar();
  }

  replaceShowMouseImage();
};

/**
 * Initialize the module.
 */
export default {
  id: 'better-mice',
  name: 'Better Mice',
  type: 'better',
  default: true,
  description: 'Adds attraction rate stats and links to MHWiki and MHCT to mouse dialogs. Adds sorting to the mouse stats pages, and adds the King\'s Crown tab to the mouse pages.',
  load: init,
  settings,
};
