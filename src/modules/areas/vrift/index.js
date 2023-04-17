import { addUIStyles } from '../../../utils';
import styles from './styles.css';

const main = () => {
  if ('rift_valour' !== getCurrentLocation()) {
    return;
  }

  const floorEl = document.querySelector('.valourRiftHUD-state.tower');
  if (! floorEl) {
    return;
  }

  floorEl.addEventListener('click', () => {
    clog('VRift Simulator', 'Go to Floating Islands instead.');
    showHornMessage({
      title: 'VRift Simulator',
      text: 'Go to Floating Islands instead.',
      button: 'Travel',
      action: () => {
        //
      },
    });
  });
};

export default function moduleTemplate() {
  addUIStyles(styles);

  main();
}
