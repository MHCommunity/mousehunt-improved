import { addStyles, makePage, onEvent } from '@utils';

import styles from './styles.css';

const openWiki = () => {
  const iframe = document.createElement('iframe');
  iframe.id = 'wiki-iframe';
  iframe.src = 'https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki';

  makePage(iframe);
};

const addMenuListener = () => {
  const wikiLink = document.querySelector('.mousehuntHud-menu ul li ul li.wiki a');
  if (! wikiLink) {
    return;
  }

  wikiLink.addEventListener('click', (e) => {
    e.preventDefault();
    openWiki();
  });
};

const main = () => {
  addStyles(styles);

  addMenuListener();
  onEvent('mh-improved-open-wiki', () => {
    const wikiLink = document.querySelector('.mousehuntHud-menu ul li ul li.wiki a');
    if (wikiLink) {
      wikiLink.click();
    }

    return true;
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  main();
};

export default {
  id: 'inline-wiki',
  name: 'Inline Wiki',
  type: 'feature',
  default: true,
  description: 'Clicking \'Wiki\' in the menu will load it right in the page, rather than opening a new tab.',
  load: init,
};
