import { doRequest } from '@utils';

import miceEffs from '@data/mice-effs.json';

const getMiceEffectivness = async () => {
  const response = await doRequest('managers/ajax/users/getmiceeffectiveness.php');
  return response?.effectiveness;
};

const getMouse = (mouseName) => {
  return miceEffs[mouseName];
};

const getMousePower = (mouseName) => {
  return getMouse(mouseName)?.power;
};

const getMouseEffectiveness = (mouseName) => {
  const powerTypes = [
    'Arcane',
    'Draconic',
    'Forgotten',
    'Hydro',
    'Parental',
    'Physical',
    'Shadow',
    'Tactical',
    'Law',
    'Rift'
  ];

  return getMouse(mouseName)?.effs[powerTypes.indexOf(user.trap_power_type_name)];
};

const getMinluck = (mousePower, effectiveness) => {
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
    percent: getPercent(rate)
  };
};

export {
  getCatchRate,
  getMiceEffectivness,
  getMinluck,
  getMouseEffectiveness,
  getMousePower
};
