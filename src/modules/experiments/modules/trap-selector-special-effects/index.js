import { addModuleStyles, getCurrentLocation, onEvent, onTravel } from '@utils';

import specialEffects from '@data/trap-special-effects.json';

const addSpecialEffectsStyles = async () => {
  const styles = [];

  specialEffects.all.forEach((item) => {
    styles.push(`.campPage-trap-itemBrowser-item.${item}`);
  });

  const currentLocation = getCurrentLocation();
  const currentLocationEffects = specialEffects[currentLocation];
  if (currentLocationEffects) {
    specialEffects[currentLocation].forEach((item) => {
      styles.push(`.mh-improved-location-${currentLocation} .campPage-trap-itemBrowser-item.${item}`);
    });
  }

  addModuleStyles(`${styles.join(' .campPage-trap-itemBrowser-item-name::after,')}
.mh-improved-special-effects-highlight {
  position: absolute;
  top: 4px;
  right: 3px;
  display: inline-block;
  width: 10px;
  height: 10px;
  content: "";
  background-color: #48b0a9;
  border-radius: 50%;
}`, 'mh-improved-trap-selector-special-effects', true);
};

hasAddedSpecialEffectsStyles = false;
/**
 * Initialize the module.
 */
const init = async () => {
  onEvent('camp_page_toggle_blueprint', () => {
    if (! hasAddedSpecialEffectsStyles) {
      addSpecialEffectsStyles();
      hasAddedSpecialEffectsStyles = true;
    }
  });

  onTravel(() => {
    hasAddedSpecialEffectsStyles = false;
  });
};

export default {
  id: 'trap-selector-special-effects',
  name: 'Add an indicator to items in the trap selector that have special effects',
  description: '',
  load: init
};
