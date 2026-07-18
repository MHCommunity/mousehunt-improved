import { addHudStyles } from '@utils';

import { addAirshipRandomizer } from '../../shared/airship-randomizer';
import { addHullClick } from './ledger';
import { initRaidFavorites } from './raid-favorites';

import fullWidthAirshipStyles from '../floating-islands/full-width-airship.css';
import styles from './styles.css';

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles([styles, fullWidthAirshipStyles], 'cerulean-skyport');
  addAirshipRandomizer();
  addHullClick();
  initRaidFavorites();
};
