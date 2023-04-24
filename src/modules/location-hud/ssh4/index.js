import { addUIStyles, makeCheeseSelector } from '../../utils';
import styles from './styles.css';

const main = async () => {
  if ('ss_huntington_ii' !== getCurrentLocation()) {
    return;
  }

  makeCheeseSelector('mh-ui-ss-huntington-ii', 'ss_huntington_ii', [
    'cheddar_cheese',
    'gouda_cheese',
    'super_brie_cheese',
    'galleon_gouda_cheese'
  ]);
};

export default function ssh4() {
  addUIStyles(styles);

  run(main);
}
