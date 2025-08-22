import { addHudStyles, addStyles } from '@utils';

import styles from './styles.css';

/**
 * Add userscript styles.
 */
const maybeAddUserscriptStyles = () => {
  const check = document.querySelector('.riftBristleWoodsHUD .item_container .item-Btn');
  if (! check) {
    return;
  }

  const userscriptStyles = [
    '.riftBristleWoodsHUD .item_container, .riftBristleWoodsHUD .charm_container { margin-top: 15px; }',
    '.riftBristleWoodsHUD { margin-bottom: 30px; }',
  ].join('\n');

  addStyles(userscriptStyles, 'riftBristleWoodsHUD', 'mh-improved-rift-bristle-woods-userscript-styles');
};

/**
 * Initialize the module.
 */
export default () => {
  addHudStyles(styles);

  setTimeout(maybeAddUserscriptStyles, 1000);
};
