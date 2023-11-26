import { addUIStyles } from '../../utils';

import adventure from './adventure.css';
import betterLuckyCatchIcon from './better-lucky-catch-icon.css';
import corkboard from './corkboard.css';
import events from './events.css';
import footer from './footer.css';
import friends from './friends.css';
import general from './general.css';
import gifts from './gifts.css';
import hud from './hud.css';
import inbox from './inbox.css';
import overlays from './overlays.css';
import profile from './profile.css';
import recipes from './recipes.css';
import scoreboards from './scoreboards.css';
import select2 from './select2.css';
import sidebar from './sidebar.css';
import skins from './skins.css';
import tabs from './tabs.css';
import team from './team.css';
import traps from './traps.css';
import userscripts from './userscripts.css';

const main = () => {
  addUIStyles([
    adventure,
    general,
    betterLuckyCatchIcon,
    corkboard,
    events,
    footer,
    friends,
    gifts,
    hud,
    inbox,
    overlays,
    profile,
    recipes,
    scoreboards,
    select2,
    sidebar,
    skins,
    tabs,
    team,
    traps,
    userscripts,
  ]);
};

export default main;
