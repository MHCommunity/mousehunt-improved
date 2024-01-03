import { addStyles, makeElement, onNavigation } from '@utils';

import profileStyles from './profile.css';
import styles from './styles.css';

import userHighlighting from '@data/user-highlighting.json';

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

const highlightUsers = () => {
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

  // for each key in userHiglighting, check if the user id is in the array and add the key as a class
  Object.keys(userHighlighting).forEach((key) => {
    const userId = Number.parseInt(id.innerText, 10);
    if (userHighlighting[key].includes(userId)) {
      profilePage.classList.add('mh-improved-highlight-user', `mh-improved-${key}`);
      idHeader.append(getUserHighlightingShield(key));
    }

    // brad gets some real fancy profile styling.
    if (8209591 === userId) {
      profilePage.classList.add('mh-improved-highlight-user', 'mh-improved-fancy-profile');
    }
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([
    styles,
    profileStyles,
  ]);

  onNavigation(highlightUsers, {
    page: 'hunterprofile',
  });
};

export default {
  id: 'highlight-users',
  type: 'required',
  load: init,
};
