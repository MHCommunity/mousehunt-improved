import { getSetting, makeElement, saveSetting } from '@utils';

const getTravelSetting = (settingName, defaultValue) => {
  return getSetting(`better-travel.${settingName}`, defaultValue);
};

const saveTravelSetting = (settingName, value) => {
  saveSetting(`better-travel.${settingName}`, value);
};

const travelTo = (location) => {
  const header = document.querySelector('.mousehuntHeaderView');
  if (header) {
    const existing = header.querySelector('.mh-improved-travel-message');
    if (existing) {
      existing.remove();
    }

    makeElement('div', ['mh-improved-travel-message', 'travelPage-map-message'], 'Traveling...', header);
  }
  app.pages.TravelPage.travel(location);
};

export {
  getTravelSetting,
  saveTravelSetting,
  travelTo
};
