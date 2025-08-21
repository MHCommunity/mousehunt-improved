import { addStyles, makeElement, onEvent, onRequest } from '@utils';

import styles from './styles.css';

const addRandomSkinButton = () => {
  const header = document.querySelector('.trapSelectorView__itemBrowserContainer.trapSelectorView__outerBlock.campPage-trap-itemBrowser.skin .campPage-trap-itemBrowser-filterContainer');
  if (! header) {
    return;
  }

  if (document.querySelector('.random-skin-button')) {
    return;
  }

  const randomButton = makeElement('button', ['mousehuntActionButton', 'lightBlue', 'tiny', 'random-skin-button']);
  makeElement('span', '', 'Random', randomButton);
  randomButton.onclick = () => {
    const skins = document.querySelectorAll('.trapSelectorView__blueprint--active .campPage-trap-itemBrowser-item.skin.canArm a.campPage-trap-itemBrowser-item-armButton');
    if (skins.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * skins.length);
    const skin = skins[randomIndex];
    if (! skin) {
      return;
    }

    randomButton.classList.add('disabled');
    randomButton.disabled = 'disabled';

    skin.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      container: 'nearest'
    });

    skin.click();

    setTimeout(() => {
      randomButton.classList.remove('disabled');
      randomButton.disabled = '';
    }, 1000);
  };

  header.append(randomButton);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'better-ui.random-skin-button');
  onRequest('users/gettrapcomponents.php', addRandomSkinButton);
  onEvent('camp_page_toggle_blueprint', addRandomSkinButton);
};
