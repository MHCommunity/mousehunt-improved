import { doRequest } from '@utils';
import { getData } from '@utils/data';

let miceEffs;
let hasGottenEffs = false;

/**
 * Get the mice eff values.
 *
 * @return {Array} The mice eff values.
 */
const getMiceEffectiveness = async () => {
  if (! hasGottenEffs) {
    miceEffs = await getData('effs');
    hasGottenEffs = true;
  }

  const response = await doRequest('managers/ajax/users/getmiceeffectiveness.php');

  return response?.effectiveness;
};

/**
 * Get the mouse data.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {Object} The mouse data.
 */
const getMouse = async (mouseId) => {
  if (! miceEffs || ! hasGottenEffs) {
    miceEffs = await getData('effs');
    hasGottenEffs = true;
  }

  // Find the mouse in the effs data. based on name.
  const mouse = miceEffs.find((m) => m.type === mouseId);

  return mouse;
};

/**
 * Get the mouse power.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {number} The mouse power.
 */
const getMousePower = async (mouseId) => {
  const mouse = await getMouse(mouseId);
  if (! mouse || ! mouse.effectivenesses) {
    return 0;
  }

  return mouse?.effectivenesses?.power;
};

/**
 * Get the mouse effectiveness.
 *
 * @param {string} mouseId The mouse ID.
 *
 * @return {number} The mouse effectiveness.
 */
const getMouseEffectiveness = async (mouseId) => {
  const mouse = await getMouse(mouseId);
  if (! mouse || ! mouse.effectivenesses) {
    return 0;
  }

  return mouse.effectivenesses[user.trap_power_type_name.toLowerCase()];
};

/**
 * Get the minluck based on the mouse power and effectiveness.
 *
 * @param {number} mousePower    The mouse power.
 * @param {number} effectiveness The mouse effectiveness.
 *
 * @return {number} The minluck.
 */
const getMinluck = async (mousePower, effectiveness) => {
  if (effectiveness === 0) {
    return '∞';
  }

  // Props tsitu @ github.com:tsitu/MH-Tools.
  const minluck = Math.ceil(
    Math.ceil(Math.sqrt(mousePower / 2)) / Math.min((effectiveness / 100), 1.4)
  );

  // If we don't get 100% catch rate at minluck, bump it up by 1.
  const checkCatchRate = getCatchRate(mousePower, effectiveness, 0, minluck);

  return checkCatchRate.rate === 1 ? minluck : minluck + 1;
};

/**
 * Convert a rate to a percentage.
 *
 * @param {number} rate The rate.
 *
 * @return {string} The percentage.
 */
const getPercent = (rate) => {
  if (rate === 1) {
    return '100%';
  }

  const percent = (rate * 100).toFixed(2);

  return `${percent}%`;
};

/**
 * Get the catch rate.
 *
 * @param {number} mousePower    The mouse power.
 * @param {number} effectiveness The mouse effectiveness.
 * @param {number} power         The trap power.
 * @param {number} luck          The trap luck.
 *
 * @return {Object} The catch rate.
 */
const getCatchRate = (mousePower, effectiveness, power = null, luck = null) => {
  effectiveness = effectiveness / 100;

  if (null === power) {
    power = user.trap_power;
  }

  if (null === luck) {
    luck = user.trap_luck;
  }

  // Props tsitu @ github.com:tsitu/MH-Tools.
  const rate = Math.min(1,
    ((effectiveness * power) + (
      2 * Math.pow(Math.floor(Math.min(effectiveness, 1.4) * luck), 2)
    )) / ((effectiveness * power) + mousePower)
  );

  return {
    rate,
    percent: getPercent(rate),
  };
};

export {
  getCatchRate,
  getMiceEffectiveness,
  getMinluck,
  getMouseEffectiveness,
  getMousePower
};
