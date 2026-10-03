import { addStyles, formatNumber, getCurrentLocation, getSetting, getUserItems, make, onRequest, replaceOrAppend, sessionGet, sessionSet } from '@utils';

import styles from './styles.css';

const selectorStates = new Map();

/**
 * Toggle a selector weapon while remembering the weapon equipped before the group.
 *
 * @param {HTMLElement} control   The clicked selector.
 * @param {Object}      item      The selected weapon.
 * @param {Object[]}    weapons   The selector weapons.
 * @param {string}      location  The location owning the selector.
 * @param {Object}      state     The selector state.
 * @param {Function}    isEnabled Whether the selector is still enabled.
 */
const toggleWeapon = (control, item, weapons, location, state, isEnabled) => {
  if (state.isChangingWeapon || !control.isConnected || control.classList.contains('disabled') || !isEnabled()) {
    return;
  }

  const currentWeaponId = Number(user.weapon_item_id);
  const currentIsSelectorWeapon = weapons.some((weapon) => Number(weapon.item_id) === currentWeaponId);
  const storageKey = `${location.replaceAll('_', '-')}.previous-weapon.${user.user_id}`;
  const weaponToArm = currentWeaponId === Number(item.item_id) ? sessionGet(storageKey, null) : item.type;
  if (!weaponToArm) {
    return;
  }

  state.isChangingWeapon = true;
  control.classList.add('busy');

  const finish = () => {
    state.isChangingWeapon = false;
    control.classList.remove('busy');
  };

  hg.utils.TrapControl.armItem(weaponToArm, 'weapon');
  hg.utils.TrapControl.go(() => {
    if (!currentIsSelectorWeapon) {
      sessionSet(storageKey, currentWeaponId);
    }

    finish();
  }, finish);
};

/**
 * Add a refreshing cheese and weapon selector to a location HUD.
 *
 * Clicking an equipped selector weapon restores the weapon armed before the selector group.
 * Each location keeps its own render state and previous weapon.
 *
 * @param {string}   location              The location name or type.
 * @param {string[]} itemTypes             Cheese and weapon types in display order.
 * @param {Object}   [options]             Selector options.
 * @param {string}   [options.hudSelector] An optional selector identifying the location HUD.
 *
 * @example
 * addItemSelector('zugzwang-tower', ['super_brie_cheese', 'mystic_low_weapon'], { hudSelector: '.zuzwangsTowerHUD' });
 */
const addItemSelector = (location, itemTypes, { hudSelector = null } = {}) => {
  location = location.replaceAll('-', '_');
  addStyles(styles, 'location-huds-item-selectors');

  if (!selectorStates.has(location)) {
    selectorStates.set(location, { renderVersion: 0, isChangingWeapon: false });
  }

  const state = selectorStates.get(location);
  const wrapperClass = `mh-ui-item-selector-${location}`;
  const isEnabled = () => location === getCurrentLocation() && getSetting(`location-huds-enabled.${location}`, true);
  const hasHud = (hud) => hud?.isConnected && (!hudSelector || hud.querySelector(hudSelector));

  const updateSelectors = async () => {
    const version = ++state.renderVersion;
    const hud = document.querySelector('#hudLocationContent');
    if (!hasHud(hud) || !isEnabled()) {
      return;
    }

    const items = await getUserItems(itemTypes);
    if (version !== state.renderVersion || !hasHud(hud) || !isEnabled()) {
      return;
    }

    const wrapper = make('div', ['townOfGnawniaHUD', 'allBountiesComplete', 'mh-ui-cheese-selector-wrapper', 'mh-ui-item-selector-wrapper', wrapperClass]);
    const container = make('div', ['townOfGnawniaHUD-baitContainer', 'mh-ui-cheese-selector'], '', wrapper);
    const weapons = items.filter((item) => 'weapon' === item.classification);

    for (const itemType of itemTypes) {
      const item = items.find((inventoryItem) => inventoryItem.type === itemType);
      if (!item || !['bait', 'weapon'].includes(item.classification)) {
        continue;
      }

      const control = make('div', ['townOfGnawniaHUD-bait', `mh-ui-cheese-selector-${item.type}`], '', container);
      control.setAttribute('data-item-type', item.type);
      control.setAttribute('data-item-classification', item.classification);
      control.addEventListener('click', () => {
        if ('weapon' === item.classification) {
          toggleWeapon(control, item, weapons, location, state, isEnabled);
        } else if (control.isConnected && isEnabled()) {
          hg.utils.TrapControl.toggleItem(control);
        }
      });
      control.setAttribute('title', item.name);
      control.classList.toggle('active', Number(user[`${item.classification}_item_id`]) === Number(item.item_id));
      control.classList.toggle('disabled', item.quantity <= 0);

      const image = make('div', 'townOfGnawniaHUD-bait-image', '', control);
      image.style.backgroundImage = `url(${item.thumbnail_transparent || item.thumbnail})`;
      make('div', ['townOfGnawniaHUD-bait-name', 'quantity'], item.name, control);

      if ('bait' === item.classification) {
        make('div', ['townOfGnawniaHUD-bait-quantity', 'quantity'], formatNumber(item.quantity), control);
      }
    }

    replaceOrAppend(hud, `.${wrapperClass}`, wrapper);
  };

  updateSelectors();
  onRequest('*', updateSelectors);
};

export default addItemSelector;
