import {
  addStyles,
  debug,
  makeElement,
  onNavigation,
  sessionGet,
  sessionSet
} from '@utils';

import profileStyles from './profile.css';
import styles from './styles.css';

/**
 * Get the user highlighting shield.
 *
 * @param {string} type The type of user highlighting.
 *
 * @return {HTMLElement} The user highlighting shield.
 */
const getUserHighlightingShield = (type) => {
  let text = '';
  switch (type) {
  case 'developer':
    text = 'MH Improved Developer';
    break;
  case 'contributor':
    text = 'MH Improved Contributor';
    break;
  case 'supporter':
    text = 'MH Improved Supporter';
    break;
  }

  const wrapper = makeElement('div', ['blackTooltip', 'mh-improved-user-shield']);
  makeElement('div', 'hunterInfoView-verifiedUserImage', null, wrapper);
  makeElement('span', 'blackTooltiptext hunterInfoView-verifiedUser', text, wrapper);

  return wrapper;
};

/**
 * Highlight users on the profile page.
 */
const highlightUsers = async () => {
  const existing = document.querySelectorAll('.mh-improved-user-shield');
  if (existing) {
    existing.forEach((el) => {
      el.remove();
    });
  }

  const id = document.querySelector('.hunterInfoView-hunterId-idText span');
  if (! id) {
    return;
  }

  const profilePage = document.querySelector('#mousehuntContainer.PageHunterProfile');
  if (! profilePage) {
    return;
  }

  const idHeader = document.querySelector('.hunterInfoView-idCardBlock-secondaryHeader');
  if (! idHeader) {
    return;
  }

  const userId = Number.parseInt(id.textContent, 10);
  // query api.mouse.rip/highlight-user/:id to get the user highlighting data

  let data = sessionGet(`mh-improved-user-highlighting-${userId}`);
  if (! data) {
    const userHighlighting = await fetch(`https://api.mouse.rip/highlight-user/${userId}`);
    data = await userHighlighting.json();

    debug(`Retrieved user highlighting data for ${userId}`, data);

    sessionSet(`mh-improved-user-highlighting-${userId}`, data);
  }

  if (! data || ! data?.highlighted) {
    return;
  }

  const type = data.type;

  profilePage.classList.add('mh-improved-highlight-user', `mh-improved-${type}`);
  idHeader.append(getUserHighlightingShield(type));

  // brad gets some real fancy profile styling.
  if (8209591 === userId) {
    profilePage.classList.add('mh-improved-highlight-user', 'mh-improved-fancy-profile');
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([styles, profileStyles], 'highlight-users');

  onNavigation(highlightUsers, {
    page: 'hunterprofile',
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'highlight-users',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
