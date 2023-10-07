import { makeLink } from '../../utils';
import { addMHCTData } from '../map-utils';
import { addArToggle, removeArToggle } from './toggle-ar';
import addConsolationPrizes from './consolation-prizes';

const getLinkMarkup = (name) => {
  return makeLink('MHCT AR', `https://www.mhct.win/attractions.php?mouse=${name}`, true) +
    makeLink('Wiki', `https://mhwiki.hitgrab.com/wiki/index.php/${name}_Mouse`) +
    makeLink('mhdb', `https://dbgames.info/mousehunt/mice/${name}_Mouse`);
};

/**
 * Add links to the mouse details on the map.
 */
const addMouseLinksToMap = async () => {
  const overlay = document.getElementById('overlayPopup');
  if (! (overlay && overlay.classList.contains('treasureMapPopup'))) {
    return;
  }

  const mouseIcon = document.querySelectorAll('.treasureMapView-goals-group-goal');
  if (! mouseIcon || mouseIcon.length === 0) {
    return;
  }

  const mapViewClasses = document.querySelector('.treasureMapView');
  if (! mapViewClasses) {
    return;
  }

  let type = 'mouse';
  if (mapViewClasses.classList.value.indexOf('scavenger_hunt') !== -1) {
    type = 'item';
  }

  mouseIcon.forEach((mouse) => {
    let mouseType = mouse.classList.value
      .replace('treasureMapView-goals-group-goal', '')
      .replace(' mouse', '')
      .replace(' item', '')
      .replace(' complete', '')
      .replace('landscape', '')
      .replace('notAvailable', '')
      .replaceAll(' ', '')
      .trim();

    if ('item' === type) {
      mouseType = mouse.getAttribute('data-unique-id');
    }

    mouse.addEventListener('click', async () => {
      const title = document.querySelector('.treasureMapView-highlight-name');
      if (! title) {
        return;
      }

      title.classList.add('mh-ui-mouse-links-map-name');

      title.addEventListener('click', () => {
        if (type === 'item') {
          hg.views.ItemView.show(mouseType);
        } else if (type === 'mouse') {
          hg.views.MouseView.show(mouseType);
        }
      });

      title.setAttribute('data-mouse-id', mouseType);

      const existing = document.querySelector(`#mh-ui-mouse-links-map-${mouseType}-${type}`);
      if (existing) {
        return;
      }

      const div = makeElement('div', 'mh-ui-mouse-links-map');
      div.id = `mh-ui-mouse-links-map-${mouseType}-${type}`;
      div.innerHTML = getLinkMarkup(title.innerText);

      const envs = document.querySelector('.treasureMapView-highlight-environments');
      if (envs) {
        envs.parentNode.insertBefore(div, envs.nextSibling);
      }

      let appendMHCTto = document.querySelector('.treasureMapView-highlight-weaknessContainer');
      if (! appendMHCTto) {
        appendMHCTto = document.querySelector('.mh-ui-mouse-links-map');
      }

      const existingArs = document.querySelectorAll('.mh-ui-mouse-links-map-ars');
      if (existingArs && existingArs.length > 0) {
        existingArs.forEach((ar) => ar.remove());
      }

      const container = document.querySelector('.treasureMapView-highlight.goal.active');
      if (! container) {
        return;
      }

      const arsEl = makeElement('div', 'mh-ui-mouse-links-map-ars');
      arsEl.id = `mh-ui-mouse-links-map-ars-${mouseType}-${type}`;
      await addMHCTData({ unique_id: mouseType }, arsEl, type);

      // if there wasn't a change to theArsEl div, then don't add it.
      if (arsEl.innerHTML === '') {
        return;
      }

      container.classList.add('has-mhct-ars');

      container.appendChild(arsEl);
    });
  });
};

const addClassesToGroups = (mapData) => {
  const groups = document.querySelectorAll('.treasureMapView-goals-groups');
  groups.forEach((group) => {
    const title = group.querySelector('.treasureMapView-block-content-heading');
    if (! title) {
      return;
    }

    if (title.classList.contains('mh-ui-goals-group-completed-title')) {
      return;
    }

    const completed = title.innerText.indexOf(' found these mice:') !== -1 || title.innerText.indexOf(' found this mouse:') !== -1;
    group.classList.add('mh-ui-goals-group', completed ? 'completed' : 'incomplete');

    let countText = '';
    const count = group.querySelector('.treasureMapView-block-content-heading-count');
    if (count) {
      group.setAttribute('data-mouse-count', count.innerText.replace('(', '').replace(')', ''));
      countText = count.innerText;
    }

    if (! completed) {
      return;
    }
    // get the hunter name by removing the count and the 'found these mice' text
    const hunterName = title.innerText
      .replace(countText, '')
      .replace(' found these mice:', '')
      .replace(' found this mouse:', '')
      .trim();

    // find the hunter in the list of hunters but looking at mapData.hunters and finding the matching name
    let hunter = mapData.hunters.find((h) => h.name.trim() === hunterName);
    if (! hunter) {
      // match the hunter using the image url
      const image = group.querySelector('.treasureMapView-block-content-heading-image');
      if (! image) {
        return;
      }

      // get the style property of the image and get the url from it
      const url = image.getAttribute('style')
        .replace('background-image:url(', '')
        .replace('background-image: url(', '')
        .replace(');', '');

      hunter = mapData.hunters.find((h) => h.profile_pic === url);
    }

    // Finally, fallback to trying to match the hunter name to the user's name in case of weirdness idk.
    if (! hunter) {
      if (hunterName === `${user.firstname} ${user.lastname}` || hunterName === `${user.firstname}${user.lastname}`) {
        hunter = {
          name: `${user.firstname} ${user.lastname}`,
          sn_user_id: user.sn_user_id,
        };
      }
    }

    if (! hunter) {
      return;
    }

    const image = group.querySelector('.treasureMapView-block-content-heading-image');
    if (! image) {
      image.title = `Go to ${hunter.name}'s profile`;
      image.classList.add('mh-ui-goals-group-completed-image');

      image.addEventListener('click', () => {
        hg.utils.PageUtil.showHunterProfile(hunter.sn_user_id);
      });
    }

    const replacementTitle = makeElement('div', 'treasureMapView-block-content-heading');

    if (image) {
      replacementTitle.appendChild(image);
    }

    const nameLink = makeElement('a', 'mh-ui-goals-group-completed-title', hunter.name);
    nameLink.setAttribute('data-snuid', hunter.sn_user_id);
    nameLink.addEventListener('click', (e) => {
      e.preventDefault();
      hg.utils.PageUtil.showHunterProfile(hunter.sn_user_id);
    });
    replacementTitle.appendChild(nameLink);

    makeElement('span', 'mh-ui-goals-group-completed-text', ' found these mice:', replacementTitle);
    if (count) {
      replacementTitle.appendChild(count);
    }

    title.replaceWith(replacementTitle);
  });
};

const moveLeaveButton = () => {
  const leaveButton = document.querySelector('.treasureMapView-mapLeaveContainer .treasureMapView-leaveMapButton');
  if (! leaveButton) {
    return;
  }

  const actions = document.querySelector('.treasureMapView-mapMenu-group-actions');
  if (! actions) {
    return;
  }

  const clone = leaveButton.cloneNode(true);
  clone.classList.add('mh-ui-leave-map-button');
  clone.classList.remove('lightBlue');

  clone.addEventListener('click', () => {
    // click the original button.
    leaveButton.click();
  });

  actions.insertBefore(clone, actions.firstChild);
};

const showGoalsTab = (mapData) => {
  addArToggle();
  addMouseLinksToMap();

  addConsolationPrizes();

  addClassesToGroups(mapData);

  moveLeaveButton();
};

const hideGoalsTab = () => {
  removeArToggle();
};

export {
  showGoalsTab,
  hideGoalsTab
};
