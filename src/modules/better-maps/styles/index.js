import { addUIStyles } from '../../utils';

import general from './general.css';
import hunters from './hunters.css';
import mapArea from './map-ar.css';
import mhct from './mhct.css';
import sidebar from './sidebar.css';
import sorted from './sorted.css';
import sortedMap from './sorted-map.css';

const main = () => {
  addUIStyles([
    general,
    hunters,
    mapArea,
    mhct,
    sidebar,
    sorted,
    sortedMap,
  ]);
};

export default main;
