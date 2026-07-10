import {
  addStyles,
  debug,
  fetchMouseRip,
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
  case 'banned':
    text = 'Banned User';
    break;
  }

  const wrapper = makeElement('div', ['blackTooltip', 'mh-improved-user-shield']);
  makeElement('div', 'hunterInfoView-verifiedUserImage', null, wrapper);
  makeElement('span', 'blackTooltiptext hunterInfoView-verifiedUser', text, wrapper);

  return wrapper;
};

/**
 * Add a warning to the profile of a user banned from the MouseHunt Discord server.
 *
 * @param {string} reason The reason for the ban.
 */
const addDiscordBanWarning = (reason) => {
  const existingWarning = document.querySelector('.mh-improved-discord-ban-warning');
  if (existingWarning) {
    existingWarning.remove();
  }

  const idCardBlock = document.querySelector('.hunterInfoView-left .hunterInfoView-idCardBlock');
  if (! idCardBlock) {
    return;
  }

  const warning = makeElement('div', ['hunterInfoView-accountStatusWarning', 'mh-improved-discord-ban-warning'],
    `This hunter has the following restrictions:<ul><li>${reason || 'Banned'}</li></ul>`);
  makeElement('div', 'mh-improved-discord-ban-warning-note', 'This is a ban from the community-run MouseHunt Discord server.', warning);

  idCardBlock.after(warning);

  const wrapper = document.querySelector('.hunterInfoView-wrapper');
  if (wrapper) {
    wrapper.classList.add('mh-improved-discord-banned');
  }
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
  if (Number.isNaN(userId)) {
    return;
  }

  // query api.mouse.rip/highlight-user/:id to get the user highlighting data

  let data = sessionGet(`mh-improved-user-highlighting-${userId}`);
  if (! data) {
    try {
      data = await fetchMouseRip(`highlight-user/${userId}`);
      if (! data) {
        throw new Error('Unexpected user highlighting response');
      }

      debug(`Retrieved user highlighting data for ${userId}`, data);

      sessionSet(`mh-improved-user-highlighting-${userId}`, data);
    } catch (error) {
      console.error('Error fetching user highlighting data', error); // eslint-disable-line no-console
      return;
    }
  }

  if (data?.banned) {
    addDiscordBanWarning(data.reason);
  }

  if (! data || ! data?.highlighted) {
    return;
  }

  const type = data.type;
  if (! ['developer', 'contributor', 'supporter'].includes(type)) {
    return;
  }

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
