import { addUIStyles } from '../../utils';

import betterLuckyCatchIcon from './better-lucky-catch-icon.css';
import corkboard from './corkboard.css';
import events from './events.css';
import footer from './footer.css';
import friends from './friends.css';
import general from './general.css';
import gifts from './gifts.css';
import hud from './hud.css';
import kingsReward from './kings-reward.css';
import overlays from './overlays.css';
import profile from './profile.css';
import recipes from './recipes.css';
import scoreboards from './scoreboards.css';
import select2 from './select2.css';
import sidebar from './sidebar.css';
import tabs from './tabs.css';
import team from './team.css';
import traps from './traps.css';
import tsituSendSupplies from './tsitu-send-supplies.css';

const main = () => {
  addUIStyles([
    general,
    betterLuckyCatchIcon,
    corkboard,
    events,
    footer,
    friends,
    gifts,
    hud,
    kingsReward,
    overlays,
    profile,
    recipes,
    scoreboards,
    select2,
    sidebar,
    tabs,
    team,
    traps,
    tsituSendSupplies,
  ].join('\n'));
};

export default main;
