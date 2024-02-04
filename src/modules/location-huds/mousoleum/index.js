import { addHudStyles } from '@utils';

import styles from './styles.css';

const spawnPlanks = () => {
  const plankContainer = document.querySelector('.mousoleumHUD-plankContainer');
  if (! plankContainer) {
    return;
  }

  plankContainer.addEventListener('click', () => {
    hg.views.HeadsUpDisplayMousoleumView.spawnShards(Math.floor(Math.random() * 20));
  });
};

const main = () => {
  spawnPlanks();
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  main();
};
