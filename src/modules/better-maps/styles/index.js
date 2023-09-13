import { addUIStyles } from '../../utils';

import general from './general.css';
import hunter from './hunter.css';
import mapArea from './map-ar.css';
import mhct from './mhct.css';
import sidebar from './sidebar.css';
import sorted from './sorted.css';

const main = () => {
  addUIStyles([
    general,
    hunter,
    mapArea,
    mhct,
    sidebar,
    sorted,
  ].join('\n'));
};

export default main;
