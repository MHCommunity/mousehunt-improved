import { getCurrentPage } from './page';

/**
 * Check if an item is in the inventory.
 *
 * @async
 *
 * @param {Array}   items       The item to check for.
 * @param {boolean} forceUpdate Force an update of the user's inventory.
 *
 * @return {Array} The item data.
 */
const getUserItems = async (items, forceUpdate = false) => {
  return new Promise((resolve) => {
    hg.utils.UserInventory.getItems(items, (resp) => {
      resolve(resp);
    }, (err) => {
      console.error('Error getting user items:', items, err); // eslint-disable-line no-console
      resolve([]);
    }, forceUpdate);
  });
};

/**
 * Get the user's setup details.
 *
 * @return {Object} The user's setup details.
 */
const getUserSetupDetails = () => {
  const userObj = user;
  const setup = {
    type: userObj.trap_power_type_name,
    stats: {
      power: userObj.trap_power,
      powerBonus: userObj.trap_power_bonus,
      luck: userObj.trap_luck,
      attractionBonus: userObj.trap_attraction_bonus,
      cheeseEffect: userObj.trap_cheese_effect,
    },
    bait: {
      id: Number.parseInt(userObj.bait_item_id, 10),
      name: userObj.bait_name,
      quantity: Number.parseInt(userObj.bait_quantity, 10),
      power: 0,
      powerBonus: 0,
      luck: 0,
      attractionBonus: 0,
    },
    base: {
      id: Number.parseInt(userObj.base_item_id, 10),
      name: userObj.base_name,
      power: 0,
      powerBonus: 0,
      luck: 0,
      attractionBonus: 0,
    },
    charm: {
      id: Number.parseInt(userObj.trinket_item_id, 10),
      name: userObj.trinket_name,
      quantity: Number.parseInt(userObj.trinket_quantity, 10),
      power: 0,
      powerBonus: 0,
      luck: 0,
      attractionBonus: 0,
    },
    weapon: {
      id: Number.parseInt(userObj.weapon_item_id, 10),
      name: userObj.weapon_name,
      power: 0,
      powerBonus: 0,
      luck: 0,
      attractionBonus: 0,
    },
    aura: {
      lgs: { active: false, power: 0, powerBonus: 0, luck: 0 },
      lightning: { active: false, power: 0, powerBonus: 0, luck: 0 },
      chrome: { active: false, power: 0, powerBonus: 0, luck: 0 },
      slayer: { active: false, power: 0, powerBonus: 0, luck: 0 },
      festive: { active: false, power: 0, powerBonus: 0, luck: 0 },
      luckycodex: { active: false, power: 0, powerBonus: 0, luck: 0 },
      riftstalker: { active: false, power: 0, powerBonus: 0, luck: 0 },
    },
    location: {
      name: userObj.environment_name,
      id: userObj.environment_id,
      slug: userObj.environment_type,
    },
  };

  if ('camp' !== getCurrentPage()) {
    return setup;
  }

  const calculations = document.querySelectorAll('.campPage-trap-trapStat');
  if (! calculations) {
    return setup;
  }

  calculations.forEach((calculation) => {
    if (calculation.classList.length <= 1) {
      return;
    }

    const type = calculation.classList[1];
    const math = calculation.querySelectorAll('.math .campPage-trap-trapStat-mathRow');
    if (! math) {
      return;
    }

    math.forEach((row) => {
      if (row.classList.contains('label')) {
        return;
      }

      let value = row.querySelector('.campPage-trap-trapStat-mathRow-value')?.innerText || '0';
      const name = row.querySelector('.campPage-trap-trapStat-mathRow-name')?.innerText;

      if (! name) {
        return;
      }

      let tempType = type;
      let isBonus = false;
      if (value.includes('%')) {
        tempType = type + 'Bonus';
        isBonus = true;
      }

      // Because attraction_bonus is silly.
      tempType = tempType.replace('_bonusBonus', 'Bonus');

      value = value.replace('%', '');
      value = value.replace(',', '');
      value = Number.parseInt(value * 100) / 100;

      if (tempType === 'attractionBonus') {
        value = value / 100;
      }

      // Check if the name matches either setup.weapon.name, setup.base.name, setup.charm.name, setup.bait.name and if so, update the setup object with the value
      if (setup.weapon.name === name) {
        setup.weapon[tempType] = value;
      } else if (setup.base.name === name) {
        setup.base[tempType] = value;
      } else if (setup.charm.name === name) {
        setup.charm[tempType] = value;
      } else if (setup.bait.name === name) {
        setup.bait[tempType] = value;
      } else if ('Your trap has no cheese effect bonus.' === name) {
        setup.cheeseEffect = 'No Effect';
      } else {
        let auraType = name.replace(' Aura', '');
        if (! auraType) {
          return;
        }

        auraType = auraType.toLowerCase();
        auraType = auraType.replaceAll(' ', '_');
        // remove any non alphanumeric characters
        auraType = auraType.replaceAll(/\W/gi, '');
        auraType = auraType.replace('golden_luck_boost', 'lgs');
        auraType = auraType.replace('2023_lucky_codex', 'luckycodex');
        auraType = auraType.replace('_set_bonus_2_pieces', '');
        auraType = auraType.replace('_set_bonus_3_pieces', '');

        if (setup.aura[auraType]) {
          setup.aura[auraType].active = true;
          setup.aura[auraType].type = auraType;
        } else {
          setup.aura[auraType] = {
            active: true,
            type: auraType,
            power: 0,
            powerBonus: 0,
            luck: 0,
          };
        }

        value = Number.parseInt(value);

        if (isBonus) {
          value = value / 100;
        }

        setup.aura[auraType][tempType] = value;
      }
    });
  });

  return setup;
};

/**
 * Normalize the title.
 *
 * @param {string} title The title to normalize.
 *
 * @return {string} The normalized title.
 */
const normalizeTitle = (title = '') => {
  return title
    .toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('/', '_')
    .replaceAll('journeyman_journeywoman', 'journeyman')
    .replaceAll('journeywoman', 'journeyman')
    .replaceAll('lord_lady', 'lord')
    .replaceAll('lady', 'lord')
    .replaceAll('baron_baroness', 'baron')
    .replaceAll('baroness', 'baron')
    .replaceAll('count_countess', 'count')
    .replaceAll('countess', 'count')
    .replaceAll('grand_duke_grand_duchess', 'grand_duke')
    .replaceAll('grand_duchess', 'grand_duke')
    .replaceAll('archduke_archduchess', 'archduke')
    .replaceAll('archduchess', 'archduke')
    .replaceAll('duke_duchess', 'duke')
    .replaceAll('duke_dutchess', 'duke')
    .replaceAll('duchess', 'duke')
    .replaceAll('grand_duke', 'grandduke')
    .replaceAll('/', '')
    .replaceAll(' ', '')
    .toLowerCase();
};

/**
 * Check if the user's title is at least a certain title.
 *
 * @param {string} title The title to check against.
 *
 * @return {boolean} Whether the user's title is at least the title.
 */
const isUserTitleAtLeast = (title) => {
  const titles = [
    'novice',
    'recruit',
    'apprentice',
    'initiate',
    'journeyman',
    'master',
    'grandmaster',
    'legendary',
    'hero',
    'knight',
    'lord',
    'baron',
    'count',
    'duke',
    'grandduke',
    'archduke',
    'viceroy',
    'elder',
    'sage',
    'fable',
  ];

  const titleIndex = titles.indexOf(normalizeTitle(user.title_name));
  const checkIndex = titles.indexOf(normalizeTitle(title));

  return titleIndex >= checkIndex;
};

/**
 * Get a unique, encrypted hash for the user.
 *
 * @return {string} The user's hash.
 */
const getAnonymousUserHash = async () => {
  if (! user?.user_id) {
    return '';
  }

  // Used to generate a unique hash for the user that doesn't change but is unique and anonymous. props MHCT.
  const msgUint8 = new TextEncoder().encode(user.user_id.toString().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = [...new Uint8Array(hashBuffer)];
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Get the user's title, normalized.
 *
 * @return {string} The user's title.
 */
const getUserTitle = () => {
  let title = user.title_name || 'novice';

  if (title.includes('/')) {
    title = title.split('/')[0];
  }

  return title
    .toLowerCase()
    .replaceAll('lady', 'lord')
    .replace('wo', '')
    .replace('ess', '')
    .replace('duch', 'duke')
    .trim();
};

export {
  getUserItems,
  getAnonymousUserHash,
  getUserSetupDetails,
  isUserTitleAtLeast,
  getUserTitle
};
