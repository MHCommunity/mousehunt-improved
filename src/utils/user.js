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
  return new Promise((resolve, reject) => {
    try {
      hg.utils.UserInventory.getItems(items, (resp) => {
        resolve(resp);
      }, (err) => {
        console.error('Error getting user items:', items, err); // eslint-disable-line no-console
        reject(err);
      }, forceUpdate);
    } catch (error) {
      console.error('Error getting user items:', items, error); // eslint-disable-line no-console
      reject(error);
    }
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

  try {
    // Used to generate a unique hash for the user that doesn't change but is unique and anonymous. props MHCT.
    const msgUint8 = new TextEncoder().encode(user.user_id.toString().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = [...new Uint8Array(hashBuffer)];
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Error getting user hash:', error); // eslint-disable-line no-console
    throw error;
  }
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

/**
 * Get the user's title shield.
 *
 * @param {string} titleId The title ID.
 *
 * @return {string|boolean} The title shield URL or false if not found.
 */
const getUserTitleShield = (titleId = null) => {
  if (! titleId) {
    titleId = getUserTitle();
  }

  const shields = {
    recruit: 'https://www.mousehuntgame.com/images/titles/3f1e44bbaa7138da4c326819e9f3f0a8.png',
    apprentice: 'https://www.mousehuntgame.com/images/titles/6f4673dd2d9d1e98b4569667d702a775.png',
    initiate: 'https://www.mousehuntgame.com/images/titles/e96387f7261b95c0eeab9291e4e594e1.png',
    journeyman: 'https://www.mousehuntgame.com/images/titles/ad6875955f541159133c6d3798519f81.png',
    master: 'https://www.mousehuntgame.com/images/titles/35ee6056a09037fb13a9195881875045.png',
    grandmaster: 'https://www.mousehuntgame.com/images/titles/0da3761747914f497c16dc2051ba132d.png',
    legendary: 'https://www.mousehuntgame.com/images/titles/fca35751046f4bcc972716ca484b6d61.png',
    hero: 'https://www.mousehuntgame.com/images/titles/0567284d6e12aaaed35ca5912007e070.png',
    knight: 'https://www.mousehuntgame.com/images/titles/398dca9a8c7703de969769491622ca32.png',
    lord: 'https://www.mousehuntgame.com/images/titles/9a6acd429a9a3a4849ed13901288b0b8.png',
    baron: 'https://www.mousehuntgame.com/images/titles/ea9c0ec2e6d3d81c14e61f5ce924d0e1.png',
    count: 'https://www.mousehuntgame.com/images/titles/dd11711a25b80db90e0306193f2e8d78.png',
    duke: 'https://www.mousehuntgame.com/images/titles/eb46ac1e8197b13299ab860f07d963db.png',
    grand_duke: 'https://www.mousehuntgame.com/images/titles/87937fa96bbb3b2dd3225df883002642.png',
    archduke: 'https://www.mousehuntgame.com/images/titles/043efe31de4f0f2e0ddca590fe829032.png',
    viceroy: 'https://www.mousehuntgame.com/images/titles/e2e79f6f9201a4d4e7a89684fbb5356f.png',
    elder: 'https://www.mousehuntgame.com/images/titles/0f3cf224bf98457f6b5bad91ab1c7bd2.png',
    sage: 'https://www.mousehuntgame.com/images/titles/cb49e43c5e4460da7c09fe28ca4f44ce.png',
    fabled: 'https://www.mousehuntgame.com/images/titles/5daba92a8d609834aa8b789f37544e08.png',
  };

  if (titleId in shields) {
    return shields[titleId];
  }

  return false;
};

export {
  getUserItems,
  getAnonymousUserHash,
  getUserSetupDetails,
  isUserTitleAtLeast,
  getUserTitle,
  getUserTitleShield
};
