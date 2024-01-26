import { doRequest } from '@utils';
import { getData } from '@utils/data';

let miceEffs;
let hasGottenEffs = false;

const getMiceEffectivness = async () => {
  if (! hasGottenEffs) {
    miceEffs = await getData('effs');
    hasGottenEffs = true;
  }

  const response = await doRequest('managers/ajax/users/getmiceeffectiveness.php');

  return response?.effectiveness;
};

const getMouse = async (mouseId) => {
  if (! miceEffs || ! hasGottenEffs) {
    miceEffs = await getData('effs');
    hasGottenEffs = true;
  }

  // Find the mouse in the effs data. based on name.
  const mouse = miceEffs.find((m) => m.type === mouseId);

  return mouse;
};

const getMousePower = async (mouseId) => {
  const mouse = await getMouse(mouseId);
  return mouse.effectivenesses.power;
};

const getMouseEffectiveness = async (mouseId) => {
  const mouse = await getMouse(mouseId);
  return mouse.effectivenesses[user.trap_power_type_name.toLowerCase()];
};

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

const getPercent = (rate) => {
  if (rate === 1) {
    return '100%';
  }

  const percent = (rate * 100).toFixed(2);

  return `${percent}%`;
};

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
  getMiceEffectivness,
  getMinluck,
  getMouseEffectiveness,
  getMousePower
};
