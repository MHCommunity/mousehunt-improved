import { addHudStyles } from '@utils';

import styles from './styles.css';
import addHudListener from '../../shared/hud-listener';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  const plankContainer = document.querySelector('.mousoleumHUD-plankContainer');
  if (plankContainer) {
    addHudListener(plankContainer, 'click', () => {
      hg.views.HeadsUpDisplayMousoleumView.spawnShards(Math.floor(Math.random() * 20));
    });
  }
};
