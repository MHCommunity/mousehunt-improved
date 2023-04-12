import { addUIStyles } from '../../utils';

// Not-sorted / general styles.
import styles from './styles.css';
import footerStyles from './styles/footer.css';
import overlayStyles from './styles/overlays.css';
import sidebarStyles from './styles/sidebar.css';
import betterLuckyCatchIcon from './styles/better-lucky-catch-icon.css';

// HUD styles
import fiStyles from './locations/fi.css';
import trainStyles from './locations/train.css';

export default () => {
  const combined = [
    styles,
    footerStyles,
    overlayStyles,
    sidebarStyles,
    betterLuckyCatchIcon,
    fiStyles,
    trainStyles,
  ].join('\n');
  addUIStyles(combined);
};
