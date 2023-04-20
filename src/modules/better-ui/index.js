import { addUIStyles } from '../utils';
import styles from './styles.css';
import tabs from './tabs.css';
import traps from './traps.css';

export default () => {
  const combined = [
    tabs,
    traps,
    styles,
  ].join('\n');

  addUIStyles(combined);

  onAjaxRequest(() => {
    const kingsPromo = document.querySelector('.shopsPage-kingsCalibratorPromo');
    if (kingsPromo) {
      kingsPromo.innerHTML = kingsPromo.innerHTML.replace('and even', 'and');
    }
  }, 'managers/ajax/users/dailyreward.php');
};
