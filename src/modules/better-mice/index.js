import {
  addSubmenuItem,
  addUIStyles,
  createFavoriteButton,
  doRequest,
  getArForMouse,
  makeElement,
  makeLink,
  onOverlayChange
} from '@/utils';

import mousepage from './mousepage';

import minlucks from '@data/minlucks.json';
import wisdoms from '@data/wisdom.json';

import styles from './styles.css';

/**
 * Get the markup for the mouse links.
 *
 * @param {string} name The name of the mouse.
 *
 * @return {string} The markup for the mouse links.
 */
const getLinkMarkup = (name) => {
  return makeLink('MHCT AR', `https://www.mhct.win/attractions.php?mouse_name=${name}`) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}`);
};

/**
 * Add links to the mouse overlay.
 */
const addLinks = () => {
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
  div.innerHTML = getLinkMarkup(title.innerText);
  title.parentNode.insertBefore(div, title);

  // Move the values into the main text.
  const values = document.querySelector('.mouseView-values');
  const desc = document.querySelector('.mouseView-descriptionContainer');
  if (values && desc) {
    // insert as first child of desc
    desc.insertBefore(values, desc.firstChild);
  }
};

const isFavorite = async (mouseId) => {
  const favorites = await doRequest('managers/ajax/pages/page.php', {
    page_class: 'HunterProfile',
    'page_arguments[tab]': 'kings_crowns',
    'page_arguments[sub_tab]': false,
    'page_arguments[snuid]': window.user.sn_user_id,
  });

  if (! favorites.page?.tabs?.kings_crowns?.subtabs[0]?.mouse_crowns?.favourite_mice.length) {
    return false;
  }

  // check if the mouseId matches the id property of any of the favorite mice
  return favorites.page.tabs.kings_crowns.subtabs[0].mouse_crowns.favourite_mice.some((mouse) => {
    return mouse.id && mouse.id === parseInt(mouseId, 10);
  });
};

const addFavoriteButton = async (mouseId, mouseView) => {
  const state = await isFavorite(mouseId);

  const fave = await createFavoriteButton({
    target: mouseView,
    size: 'large',
    isSetting: false,
    state,
    onChange: () => {
      doRequest('managers/ajax/mice/mouse_crowns.php', {
        action: 'toggle_favourite',
        user_id: window.user.user_id,
        mouse_id: mouseId,
      });
    },
  });

  mouseView.append(fave);
};

const addMinluck = async (mouseName, mouseView) => {
  let minluck = false;
  if (minlucks[mouseName.innerText]) {
    minluck = minlucks[mouseName.innerText];
  } else if (minlucks[mouseName.innerText.replace(' Mouse', '')]) {
    minluck = minlucks[mouseName.innerText.replace(' Mouse', '')];
  } else {
    return;
  }

  // get the description container
  const appendTo = mouseView.querySelector('.mouseView-contentContainer');
  if (! appendTo) {
    return;
  }

  const minluckContainer = makeElement('div', 'minluck-container');
  makeElement('div', 'minluck-title', 'Minlucks', minluckContainer);

  // foreach minluck, output the power type and the minluck
  const minluckList = makeElement('ul', 'minluck-list');
  Object.keys(minluck).forEach((powerType) => {
    if (! minluck[powerType] || '∞' === minluck[powerType]) {
      return;
    }

    const minluckItem = makeElement('li', 'minluck-item');

    const powerTypeImg = makeElement('img', 'minluck-power-type-img');
    powerTypeImg.src = `https://www.mousehuntgame.com/images/powertypes/${powerType.toLowerCase()}.png`;
    minluckItem.append(powerTypeImg);

    makeElement('div', 'minluck-power-type-minluck', minluck[powerType], minluckItem);

    minluckList.append(minluckItem);
  });

  minluckContainer.append(minluckList);

  appendTo.append(minluckContainer);
};

const addWisdom = async (mouseName, mouseView) => {
  let wisdom = false;
  if (wisdom[mouseName.innerText]) {
    wisdom = wisdoms[mouseName.innerText];
  } else if (wisdoms[mouseName.innerText.replace(' Mouse', '')]) {
    wisdom = wisdoms[mouseName.innerText.replace(' Mouse', '')];
  } else {
    return;
  }

  const values = mouseView.querySelector('.mouseView-values');
  if (! values) {
    return;
  }

  // comma separate the wisdom number
  wisdom = wisdom.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  makeElement('span', 'wisdom-container', ` / ${wisdom} Wisdom`, values);
};

const updateMouseView = async () => {
  const mouseView = document.querySelector('#overlayPopup .mouseView');
  if (! mouseView) {
    return;
  }

  const mouseId = mouseView.getAttribute('data-mouse-id');
  if (! mouseId) {
    return;
  }

  const catchesEl = document.querySelectorAll('.mouseView-statsContainer-block-padding td abbr');
  if (catchesEl && catchesEl.length > 0) {
    catchesEl.forEach((el) => {
      // remove the ' catches' from the title and use it as the text
      const catchesNumber = el.getAttribute('title')
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

  addLinks();
  addFavoriteButton(mouseId, mouseView);
  const name = mouseView.querySelector('.mouseView-title');

  addMinluck(name, mouseView);
  addWisdom(name, mouseView);

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

    imageContainer.append(movedContainer);
  }

  const arWrapper = makeElement('div', 'ar-wrapper');
  const title = makeElement('div', 'ar-header');
  makeElement('div', 'ar-title', 'Attraction Rates', title);

  const link = makeElement('a', 'ar-link', 'View on MHCT →');
  link.href = `https://www.mhct.win/attractions.php?mouse_name=${name.innerText}`;
  link.target = '_mhct';
  title.append(link);

  arWrapper.append(title);

  const mhctjson = await getArForMouse(mouseId, 'mouse');
  if (! mhctjson || typeof mhctjson === 'undefined' || mhctjson.length === 0 || 'error' in mhctjson) {
    return;
  }

  const miceArWrapper = makeElement('div', 'mice-ar-wrapper');
  const hasStages = mhctjson.some((mouseAr) => mouseAr.stage);
  if (hasStages) {
    miceArWrapper.classList.add('has-stages');
  }

  // if mhctjson is not able to be sliced, then it is an error
  if (! mhctjson.slice) {
    return;
  }

  mhctjson.slice(0, 15).forEach((mouseAr) => {
    const mouseArWrapper = makeElement('div', 'mouse-ar-wrapper');

    makeElement('div', 'location', mouseAr.location, mouseArWrapper);

    if (hasStages) {
      makeElement('div', 'stage', mouseAr.stage, mouseArWrapper);
    }

    makeElement('div', 'cheese', mouseAr.cheese, mouseArWrapper);
    makeElement('div', 'rate', `${(mouseAr.rate / 100).toFixed(2)}%`, mouseArWrapper);

    miceArWrapper.append(mouseArWrapper);
  });

  if (mhctjson.length > 0) {
    arWrapper.append(miceArWrapper);
    container.append(arWrapper);
  }
};

const main = () => {
  onOverlayChange({ mouse: { show: updateMouseView } });

  addSubmenuItem({
    menu: 'mice',
    label: 'Groups',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/mice.png?asset_cache_version=2',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=groups',
  });

  addSubmenuItem({
    menu: 'mice',
    label: 'Regions',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/travel.png?asset_cache_version=2',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=regions',
  });

  addSubmenuItem({
    menu: 'mice',
    label: 'Your Stats',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/special.png?asset_cache_version=2',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=your_stats',
  });

  addSubmenuItem({
    menu: 'mice',
    label: 'King\'s Crowns',
    icon: 'https://www.mousehuntgame.com/images/ui/crowns/crown_silver.png?asset_cache_version=2',
    href: 'https://www.mousehuntgame.com/adversaries.php?tab=kings_crowns',
  });
};

export default () => {
  addUIStyles(styles);
  main();
  mousepage();
};
