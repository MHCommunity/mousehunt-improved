import { addStyles } from '@utils';

import general from './general.css';
import helper from './helper.css';
import hunters from './hunters.css';
import mapArea from './map-ar.css';
import mhct from './mhct.css';
import sidebar from './sidebar.css';
import sorted from './sorted.css';
import sortedMap from './sorted-map.css';
import userscripts from './userscripts.css';

const main = () => {
  addStyles([
    general,
    helper,
    hunters,
    mapArea,
    mhct,
    sidebar,
    sorted,
    sortedMap,
    userscripts,
  ]);
};

export default main;
