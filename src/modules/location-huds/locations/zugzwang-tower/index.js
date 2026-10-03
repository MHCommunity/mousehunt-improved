import { addHudStyles } from '@utils';

import addItemSelector from '../../shared/item-selectors';

import styles from './styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);
  addItemSelector('zugzwang-tower', ['super_brie_cheese', 'checkmate_cheese', 'mystic_low_weapon', 'technic_low_weapon'], { hudSelector: '.zuzwangsTowerHUD' });
};
