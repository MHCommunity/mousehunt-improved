import {
  addStyles,
  makePage,
  onActivation,
  onDeactivation,
  onEvent
} from '@utils';

import styles from './styles.css';

/**
 * Open the wiki in an iframe.
 */
const openWiki = () => {
  const iframe = document.createElement('iframe');
  iframe.id = 'wiki-iframe';
  iframe.src = 'https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki';

  makePage(iframe);
};

/**
 * Get the wiki link from the menu.
 *
 * @return {HTMLElement|null} The wiki link or null.
 */
const getLink = () => {
  const wikiLink = document.querySelector('.mousehuntHud-menu ul li ul li.wiki a');
  if (wikiLink) {
    return wikiLink;
  }

  return null;
};

/**
 * Open the wiki in an iframe.
 *
 * @param {Event} e The event.
 */
const wikiListener = (e) => {
  e.preventDefault();
  openWiki();
};

/**
 * Add the click listener to the wiki link in the menu.
 */
const addMenuListener = () => {
  const wikiLink = getLink();
  if (wikiLink && ! listener) {
    listener = wikiLink.addEventListener('click', wikiListener);
  }
};

/**
 * Remove the click listener from the wiki link in the menu.
 */
const removeMenuListener = () => {
  const wikiLink = getLink();
  if (wikiLink && listener) {
    wikiLink.removeEventListener('click', wikiListener);
    listener = null;
  }
};

/**
 * Click the wiki link in the menu.
 */
const clickWiki = () => {
  const wikiLink = getLink();
  if (wikiLink) {
    wikiLink.click();
  }
};

let listener = null;

/**
 * The main function.
 */
const main = () => {
  addMenuListener();
  onEvent('mh-improved-open-wiki', clickWiki);
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'inline-wiki');
  main();

  onActivation('inline-wiki', main);
  onDeactivation('inline-wiki', removeMenuListener);
};

/**
 * Initialize the module.
 */
export default {
  id: 'inline-wiki',
  name: 'Inline Wiki',
  type: 'feature',
  default: true,
  description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.',
  load: init,
};
