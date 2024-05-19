import { addStyles } from '@utils';

import itemPage from './fixes/item-page';
import marketplaceBuyButton from './fixes/marketplace-buy-button';
import passingParcel from './fixes/passing-parcel';
import riftTooltipQuantities from './fixes/rift-tooltip-quantities';

import * as imported from './styles/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'fixes');

  itemPage();
  marketplaceBuyButton();
  passingParcel();
  riftTooltipQuantities();
};

/**
 * Initialize the module.
 */
export default {
  id: 'fixes',
  name: 'Fixes',
  type: 'feature',
  description: 'Fixes various bugs and issues in the game.',
  default: true,
  load: init,
};
