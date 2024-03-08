import {
  addStyles,
  makePage,
  onActivation,
  onDeactivation,
  onEvent
} from '@utils';

import styles from './styles.css';

const openWiki = () => {
  const iframe = document.createElement('iframe');
  iframe.id = 'wiki-iframe';
  iframe.src = 'https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki';

  makePage(iframe);
};

const getLink = () => {
  const wikiLink = document.querySelector('.mousehuntHud-menu ul li ul li.wiki a');
  if (wikiLink) {
    return wikiLink;
  }

  return null;
};

const wikiListener = (e) => {
  e.preventDefault();
  openWiki();
};

const addMenuListener = () => {
  const wikiLink = getLink();
  if (wikiLink && ! listener) {
    listener = wikiLink.addEventListener('click', wikiListener);
  }
};

const removeMenuListener = () => {
  const wikiLink = getLink();
  if (wikiLink && listener) {
    wikiLink.removeEventListener('click', wikiListener);
    listener = null;
  }
};

const clickWiki = () => {
  const wikiLink = getLink();
  if (wikiLink) {
    wikiLink.click();
  }
};

let listener = null;
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

export default {
  id: 'inline-wiki',
  name: 'Inline Wiki',
  type: 'feature',
  default: true,
  description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.',
  load: init,
};
