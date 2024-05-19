import { addHudStyles, makeElement, onRequest } from '@utils';

import styles from './styles.css';

import areaMice from './area-mice.json';
import miceNameImages from './mice-name-images.json';

/**
 * Create a list of mice.
 *
 * @param {string}      type        The type of mice.
 * @param {string}      title       The title of the mice.
 * @param {string[]}    mice        The mice.
 * @param {string}      currentType The current type.
 * @param {HTMLElement} appendTo    The element to append to.
 *
 * @return {HTMLElement} The wrapper element.
 */
const makeMiceList = (type, title, mice, currentType, appendTo) => {
  const wrapper = makeElement('div', ['mouse-type', type]);
  if (currentType === type) {
    wrapper.classList.add('active');
  }

  const mTitle = makeElement('a', 'mouse-type-title', title);
  mTitle.addEventListener('click', () => {
    let id = 1426; // magical string.
    if ('terra' === type) {
      id = 1551;
    } else if ('polluted' === type) {
      id = 1550;
    }

    hg.utils.TrapControl.setBait(id);
    hg.utils.TrapControl.go();
  });

  wrapper.append(mTitle);

  const miceWrapper = makeElement('div', 'mouse-type-mice');

  mice.forEach((mouse) => {
    const mouseWrapper = makeElement('div', 'mouse-type-mouse');
    const mouseLink = makeElement('a', 'mouse-type-mouse-link');
    mouseLink.addEventListener('click', (e) => {
      hg.views.MouseView.show(mouse);
      e.preventDefault();
    });

    const mouseImage = makeElement('img', 'mouse-type-mouse-image');
    mouseImage.src = `https://www.mousehuntgame.com/images/mice/thumb/${miceNameImages[mouse].image}`;
    mouseLink.append(mouseImage);

    makeElement('div', 'mouse-type-mouse-name', miceNameImages[mouse].name, mouseLink);

    mouseWrapper.append(mouseLink);
    miceWrapper.append(mouseWrapper);
  });

  wrapper.append(miceWrapper);
  appendTo.append(wrapper);

  return wrapper;
};

/**
 * Update the HUD.
 */
const hud = () => {
  if (! user?.quests?.QuestRiftBurroughs) {
    return;
  }

  const quest = user.quests.QuestRiftBurroughs;

  const armedBait = quest?.armed_bait || 'disarmed';
  const mistLevel = quest?.mist_released || 0;
  const mistTier = quest?.mist_tier || 'tier_0';

  const hudEl = document.querySelector('#hudLocationContent .riftBurroughsHud');
  if (! hudEl) {
    return;
  }

  let color = 'yellow';
  if (mistLevel >= 6) {
    color = 'green';
  }
  if (mistLevel >= 19) {
    color = 'red';
  }

  const existing = document.querySelector('.brift-ui');
  if (existing) {
    existing.remove();
  }

  const wrapper = makeElement('div', ['brift-ui']);

  const mist = makeElement('div', ['mist-display', `state-${color}`], `${mistLevel} / 20 `);

  mist.addEventListener('click', (e) => {
    hg.views.HeadsUpDisplayRiftBurroughsView.toggleMist(e.target);
  });

  wrapper.append(mist);

  const availableMice = areaMice[mistTier];

  const mouseWrapper = makeElement('div', 'mouse-list');

  let currentType = null;
  switch (armedBait) {
  case 'brie_string_cheese':
  case 'marble_string_cheese':
  case 'magical_string_cheese':
    currentType = 'string';
    break;
  case 'polluted_parmesan_cheese':
    currentType = 'polluted';
    break;
  case 'terre_ricotta_cheese':
    currentType = 'terra';
    break;
  }

  makeMiceList('string', 'Magical String', availableMice.string, currentType, mouseWrapper);
  makeMiceList('terra', 'Terra Ricotta', availableMice.terra, currentType, mouseWrapper);
  makeMiceList('polluted', 'Polluted Parm.', availableMice.polluted, currentType, mouseWrapper);

  wrapper.append(mouseWrapper);

  hudEl.append(wrapper);
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  hud();
  onRequest('*', hud);
};
