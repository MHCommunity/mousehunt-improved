import { addUIStyles } from '../../utils';

// Not-sorted / general styles.
import styles from './styles.css';

// Specific page styles.
import footerStyles from './styles/footer.css';
import menuStyles from './styles/menus.css';
import overlayStyles from './styles/overlays.css';
import sidebarStyles from './styles/sidebar.css';

// Minor styles.
import betterLuckyCatchIcon from './styles/better-lucky-catch-icon.css';

// HUD styles
import hudStyles from './hud/general.css';
import fiStyles from './hud/fi.css';
import trainStyles from './hud/train.css';

export default () => {
  const combined = [
    styles,
    footerStyles,
    menuStyles,
    overlayStyles,
    sidebarStyles,
    betterLuckyCatchIcon,
    hudStyles,
    fiStyles,
    trainStyles,
  ].join('\n');
  addUIStyles(combined);
};
