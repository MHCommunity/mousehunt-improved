import {
  addOnboardingMessage,
  addStyles,
  getSetting,
  makeElement,
  saveSetting
} from '@utils';

import styles from './styles.css';

const addToggleListener = (wrapper) => {
  const container = document.querySelector('.headsUpDisplayRonzasTravelingShoppeView__mainHudContainer');
  if (! container || ! wrapper) {
    return;
  }

  let isToggled = getSetting('location-huds.ronza-info-toggled', false);

  if ('hidden' === isToggled) {
    wrapper.classList.add('headsUpDisplayRonzasTravelingShoppeView__mainHudContainer--closed');
  } else if ('miniview' === isToggled) {
    wrapper.classList.add('headsUpDisplayRonzasTravelingShoppeView__mainHudContainer--miniview');
  }

  container.addEventListener('click', (e) => {
    // Only toggle if the click is on the container itself.
    if (e.target !== container) {
      return;
    }

    // Should go 'Full' -> 'Mini' -> 'Closed' -> 'Full'.
    if ('miniview' === isToggled) {
      wrapper.classList.remove('headsUpDisplayRonzasTravelingShoppeView__mainHudContainer--miniview');
      wrapper.classList.add('headsUpDisplayRonzasTravelingShoppeView__mainHudContainer--closed');
      isToggled = 'hidden';
    } else if ('hidden' === isToggled) {
      wrapper.classList.remove('headsUpDisplayRonzasTravelingShoppeView__mainHudContainer--closed');
      isToggled = false;
    } else {
      wrapper.classList.add('headsUpDisplayRonzasTravelingShoppeView__mainHudContainer--miniview');
      isToggled = 'miniview';
    }

    saveSetting('location-huds.ronza-info-toggled', isToggled);
  });
};

const reformatRonzaView = (wrapper) => {
  const main = wrapper.querySelector('.headsUpDisplayRonzasTravelingShoppeView__contentContainer');
  if (! main) {
    return;
  }

  const baits = wrapper.querySelectorAll('.headsUpDisplayRonzasTravelingShoppeView__baitContainer');

  const existingMiniview = main.querySelector('.ronza-miniview');
  if (existingMiniview) {
    existingMiniview.remove();
  }

  const newContainer = makeElement('div', 'ronza-miniview');
  const toClone = [
    wrapper.querySelector('.headsUpDisplayRonzasTravelingShoppeView__inventoryBlock.icy_isabirra_ingredient_stat_item'), // Ice Worm.
    wrapper.querySelector('.headsUpDisplayRonzasTravelingShoppeView__inventoryBlock.poisonous_provolone_ingredient_stat_item'), // Poison Worm.
    wrapper.querySelector('.headsUpDisplayRonzasTravelingShoppeView__inventoryBlock.fiery_fontina_ingredient_stat_item'), // Fire Worm.
    wrapper.querySelector('.headsUpDisplayRonzasTravelingShoppeView__inventoryBlock.dragonbane_trinket'), // Dragonbane Charms.
    wrapper.querySelector('.headsUpDisplayRonzasTravelingShoppeView__altInventoryBlock[data-item-type="dragonhide_sliver_stat_item"]'), // Slivers.
    ...baits
  ];

  toClone.forEach((item) => {
    if (item && ! item.classList.contains('ronza-miniview__item')) {
      const clone = item.cloneNode(true);
      clone.classList.add('ronza-miniview__item');
      newContainer.append(clone);
    }
  });

  main.prepend(newContainer);
};

const ronzaGlobal = async () => {
  addStyles(styles, 'location-hud-events-ronza');
};

const ronzaLocation = async () => {
  const wrapper = document.querySelector('.headsUpDisplayRonzasTravelingShoppeView');
  if (wrapper) {
    addToggleListener(wrapper);
    reformatRonzaView(wrapper);

    addOnboardingMessage({
      step: 'location-huds-ronza',
      page: 'camp',
      highlightSelector: '.headsUpDisplayRonzasTravelingShoppeView',
      content: 'Click the "Ronza\'s Shoppe" button to toggle between full, mini, and closed views.',
      direction: 'top',
      delay: 2500,
    });
  }
};

export {
  ronzaGlobal,
  ronzaLocation
};
