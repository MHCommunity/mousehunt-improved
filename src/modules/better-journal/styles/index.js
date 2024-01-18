import { addStyles } from '@utils';

import backgrounds from './backgrounds.css';
import dateHiding from './date-hiding.css';
import fullstop from './fullstop.css';
import general from './general.css';
import goldPoints from './gold-points.css';
import linkColors from './link-colors.css';
import miniEntries from './mini-entries.css';
import progressLog from './progress-log.css';

// Custom entries.
import crafting from './custom-entries/crafting.css';
import drawWinner from './custom-entries/draw-winner.css';
import maps from './custom-entries/maps.css';
import other from './custom-entries/other.css';
import quesoPump from './custom-entries/queso-pump.css';
import rankUp from './custom-entries/rank-up.css';
import socialGift from './custom-entries/social-gift.css';
import tournaments from './custom-entries/tournaments.css';

import baseAlchemistCookbook from './custom-entries/base/alchemist-cookbook.css';
import catchBonus from './custom-entries/catch/bonus.css';
import catchFailure from './custom-entries/catch/failure.css';
import catchLucky from './custom-entries/catch/lucky.css';
import catchPrize from './custom-entries/catch/prize.css';
import charmGilded from './custom-entries/charm/gilded.css';
import charmRiftVacuum from './custom-entries/charm/rift-vacuum.css';
import charmTorch from './custom-entries/charm/torch.css';
import charmUltimate from './custom-entries/charm/ultimate.css';
import charmUnstable from './custom-entries/charm/unstable.css';
import locationBrift from './custom-entries/location/brift.css';
import locationBwRift from './custom-entries/location/bwrift.css';
import locationFolkloreForest from './custom-entries/location/folklore-forest.css';
import locationFrift from './custom-entries/location/frift.css';
import locationHalloween from './custom-entries/location/halloween.css';
import locationLabyrinth from './custom-entries/location/labyrinth.css';
import locationToxicSpill from './custom-entries/location/toxic-spill.css';
import locationVrift from './custom-entries/location/vrift.css';
import mouseGlazy from './custom-entries/mouse/glazy.css';
import mouseStuckSnowball from './custom-entries/mouse/stuck-snowball.css';

const main = () => {
  addStyles([
    general,
    backgrounds,
    dateHiding,
    fullstop,
    progressLog,
    goldPoints,
    linkColors,
    miniEntries,
    crafting,
    drawWinner,
    maps,
    other,
    quesoPump,
    rankUp,
    socialGift,
    tournaments,
    baseAlchemistCookbook,
    catchBonus,
    catchFailure,
    catchLucky,
    catchPrize,
    charmGilded,
    charmRiftVacuum,
    charmTorch,
    charmUltimate,
    charmUnstable,
    locationBrift,
    locationBwRift,
    locationFolkloreForest,
    locationFrift,
    locationHalloween,
    locationLabyrinth,
    locationToxicSpill,
    locationVrift,
    mouseGlazy,
    mouseStuckSnowball,
  ]);
};

export default main;
