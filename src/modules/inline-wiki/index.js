import { addUIStyles } from '@/utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
export default () => {
  const injectIframe = async () => {
    const wikiPage = document.querySelector('#wiki-page');
    if (wikiPage) {
      const iframe = document.createElement('iframe');
      iframe.id = 'wiki-iframe';
      iframe.src = 'https://mhwiki.hitgrab.com/wiki/index.php/MouseHunt_Wiki';

      wikiPage.append(iframe);

      // modify the <title> of the page to match the wiki page
      const title = document.querySelector('title');
      if (title) {
        title.innerHTML = 'MouseHunt | MouseHunt Wiki';
      }
    }
  };

  const wikiLink = document.querySelector('.mousehuntHud-menu ul li ul li.wiki a');
  if (wikiLink) {
    wikiLink.addEventListener('click', (e) => {
      e.preventDefault();
      hg.utils.TemplateUtil.addTemplate('PagePrivacyPolicy', '<div id="wiki-page"></div>');
      hg.utils.PageUtil.setPage('PrivacyPolicy', '', injectIframe);
    });
  }

  addUIStyles(styles);
};
