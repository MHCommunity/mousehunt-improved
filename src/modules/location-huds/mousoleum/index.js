import { addHudStyles } from '@utils';

import styles from './styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  const plankContainer = document.querySelector('.mousoleumHUD-plankContainer');
  if (plankContainer) {
    plankContainer.addEventListener('click', () => {
      hg.views.HeadsUpDisplayMousoleumView.spawnShards(Math.floor(Math.random() * 20));
    });
  }
};
