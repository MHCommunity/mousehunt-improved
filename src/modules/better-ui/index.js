import { addUIStyles } from '../utils';

// Unsorted styles.
import styles from './styles.css';

import betterLuckyCatchIcon from './styles/better-lucky-catch-icon.css';
import corkboard from './styles/corkboard.css';
import footer from './styles/footer.css';
import friends from './styles/friends.css';
import overlays from './styles/overlays.css';
import profile from './styles/profile.css';
import recipes from './styles/recipes.css';
import scoreboards from './styles/scoreboards.css';
import select2 from './styles/select2.css';
import sidebar from './styles/sidebar.css';
import tabs from './styles/tabs.css';
import team from './styles/team.css';
import tournamentStyles from './styles/tournaments.css';
import traps from './styles/traps.css';
import tsituSendSupplies from './styles/tsitu-send-supplies.css';

// scripts
import updateFriends from './friends';
import updateTournaments from './tournaments';
import updateRecipes from './recipes';

export default () => {
  addUIStyles([
    betterLuckyCatchIcon,
    corkboard,
    footer,
    friends,
    overlays,
    profile,
    recipes,
    scoreboards,
    select2,
    sidebar,
    styles,
    tabs,
    team,
    tournamentStyles,
    traps,
    tsituSendSupplies,
  ].join('\n'));

  updateFriends();
  updateTournaments();
  updateRecipes();
};
