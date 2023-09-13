import { addUIStyles } from '../utils';

// Unsorted styles.
import styles from './styles.css';

import betterLuckyCatchIcon from './styles/better-lucky-catch-icon.css';
import corkboard from './styles/corkboard.css';
import eventStyles from './styles/events.css';
import footer from './styles/footer.css';
import friendsStyles from './styles/friends.css';
import hudStyles from './styles/hud.css';
import overlays from './styles/overlays.css';
import profile from './styles/profile.css';
import recipeStyles from './styles/recipes.css';
import scoreboards from './styles/scoreboards.css';
import select2 from './styles/select2.css';
import sidebar from './styles/sidebar.css';
import tabs from './styles/tabs.css';
import team from './styles/team.css';
import trapStyles from './styles/traps.css';
import tsituSendSupplies from './styles/tsitu-send-supplies.css';

// scripts
import friends from './friends';
import hud from './hud';
import mousepage from './mousepage';
import recipes from './recipes';
import traps from './traps';

export default () => {
  addUIStyles([
    betterLuckyCatchIcon,
    corkboard,
    footer,
    eventStyles,
    friendsStyles,
    hudStyles,
    overlays,
    profile,
    recipeStyles,
    scoreboards,
    select2,
    sidebar,
    styles,
    tabs,
    team,
    trapStyles,
    tsituSendSupplies,
  ].join('\n'));

  friends();
  hud();
  mousepage();
  recipes();
  traps();
};
