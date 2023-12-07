import { addUIStyles, makeElement, onDialogShow } from '@/utils';

import styles from './styles.css';

import gwh from './great-winter-hunt';
import halloween from './halloween';


export default (location) => {
  switch (location) {
  case 'halloween_event_location':
    halloween();
    break;
  case 'winter_hunt_grove':
  case 'winter_hunt_workshop':
  case 'winter_hunt_fortress':
    gwh();
    break;
  default:
    break;
  }

  // Need to fire it always because the showdown styles are always loaded
  addUIStyles(styles);

};
