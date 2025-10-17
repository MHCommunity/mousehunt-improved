import { getHeaders, sessionGet, sessionSet } from '@utils/data';
import { makeElement } from '@utils/elements';

/**
 * Ping https://rh-api.mouse.rip/ to get the current location of the Relic Hunter.
 *
 * @return {Object} Relic Hunter location data.
 */
const getRelicHunterLocation = () => {
  // Cache it in session storage for 5 minutes.
  const cacheExpiry = 5 * 60 * 1000;
  const cacheKey = 'mh-improved-relic-hunter-location';
  let cached = sessionGet(cacheKey);
  if (cached) {
    cached = JSON.parse(cached);
  }

  // If we have a cached value and it's not expired, return it.
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  // Otherwise, fetch the data and cache it.
  return fetch('https://api.mouse.rip/relic-hunter', { headers: getHeaders() })
    .then((response) => response.json())
    .then((data) => {
      const expiry = Date.now() + cacheExpiry;
      sessionSet(cacheKey, JSON.stringify({ expiry, data }));
      return data;
    })
    .catch((error) => {
      console.error(error); // eslint-disable-line no-console
    });
};

/**
 * Travel to a location.
 *
 * @param {string} location The location to travel to.
 */
const travelTo = async (location) => {
  if (! app?.pages?.TravelPage?.travel) {
    return;
  }

  const header = document.querySelector('.mousehuntHeaderView');
  if (! header) {
    return;
  }

  const existing = header.querySelector('.mh-improved-travel-message');
  if (existing) {
    existing.remove();
  }

  const travelMessage = makeElement('div', ['mh-improved-travel-message', 'travelPage-map-message'], 'Traveling...');
  header.append(travelMessage);

  try {
    app.pages.TravelPage.travel(location);
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    travelMessage.textContent = 'Failed to travel. Please try again.';
    travelMessage.classList.add('error');
  }
};

export {
  getRelicHunterLocation,
  travelTo
};
