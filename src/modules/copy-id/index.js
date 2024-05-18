import { addStyles, getSetting, makeElement } from '@utils';

import settings from './settings';

import styles from './styles.css';

/**
 * Main function.
 */
const main = () => {
  const profilePic = document.querySelector('.mousehuntHud-userStatBar .mousehuntHud-profilePic');
  if (! profilePic) {
    return;
  }

  const copyIdButton = makeElement('div', ['mh-copy-id-button', 'mousehuntActionButton', 'tiny']);

  const hidebutton = getSetting('copy-id-button.hide-button');
  if (hidebutton) {
    copyIdButton.classList.add('hidden');
  }

  makeElement('span', 'mh-copy-id-button-text', 'Copy ID', copyIdButton);
  profilePic.parentNode.insertBefore(copyIdButton, profilePic.nextSibling);

  const successMessage = makeElement('div', 'mh-copy-id-success-message', 'Copied!');
  successMessage.style.opacity = 0;
  copyIdButton.parentNode.insertBefore(successMessage, copyIdButton.nextSibling);

  /**
   * Copy the user ID to the clipboard.
   *
   * @param {Event} e The event object.
   */
  const clickAction = (e) => {
    e.preventDefault();

    const Id = user.user_id;
    navigator.clipboard.writeText(Id);

    successMessage.style.opacity = 1;
    setTimeout(() => {
      successMessage.style.opacity = 0;
    }, 1000);
  };

  copyIdButton.addEventListener('click', clickAction);

  if (hidebutton) {
    profilePic.setAttribute('onclick', '');
    profilePic.addEventListener('click', clickAction);
  } else {
    // When hovering over the profile pic, show the copy button and hide it if they're not hovering the profile pic or teh button.
    profilePic.addEventListener('mouseenter', () => {
      copyIdButton.style.display = 'block';
    });

    profilePic.addEventListener('mouseleave', () => {
      copyIdButton.style.display = 'none';
    });

    copyIdButton.addEventListener('mouseenter', () => {
      copyIdButton.style.display = 'block';
    });

    copyIdButton.addEventListener('mouseleave', () => {
      copyIdButton.style.display = 'none';
    });
  }
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'copy-id');

  main();
};

/**
 * Initialize the module.
 */
export default {
  id: 'copy-id',
  name: 'Copy ID Button',
  type: 'feature',
  default: true,
  description: 'Hover over your profile picture in the HUD for a quick \'Copy ID to clipboard\' button.',
  load: init,
  settings,
};
