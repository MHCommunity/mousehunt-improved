import { doRequest } from './utils';

const months = new Map([
  ['january', 0],
  ['february', 1],
  ['march', 2],
  ['april', 3],
  ['may', 4],
  ['june', 5],
  ['july', 6],
  ['august', 7],
  ['september', 8],
  ['october', 9],
  ['november', 10],
  ['december', 11],
]);

let accountTimezoneOffsetPromise;

/**
 * Get the UTC offset used for dates rendered by MouseHunt.
 *
 * @return {Promise<number|null>} The offset in minutes, or null when unavailable.
 */
const getAccountTimezoneOffset = async () => {
  if (!accountTimezoneOffsetPromise) {
    accountTimezoneOffsetPromise = (async () => {
      const response = await doRequest('managers/ajax/pages/page.php', {
        page_class: 'Preferences',
        'page_arguments[tab]': 'personal_info',
        'page_arguments[sub_tab]': false,
      });

      const timezone = Number.parseFloat(response?.page?.form_data?.timezone);
      const timezoneOffset = Number.parseFloat(response?.page?.form_data?.timezone_offset || 0);
      if (!Number.isFinite(timezone) || !Number.isFinite(timezoneOffset)) {
        return null;
      }

      return (timezone + timezoneOffset) * 60;
    })();
  }

  return accountTimezoneOffsetPromise;
};

/**
 * Parse a date rendered by MouseHunt into an absolute timestamp.
 *
 * Supports account-local aura dates such as
 * "September 11, 2025 @ 3:41pm (Local Time)" and UTC dates such as
 * "Wednesday, July 8th 2026 @ 10:02:41 PM (UTC)".
 *
 * @param {string} text The rendered MouseHunt date.
 *
 * @return {Promise<number|null>} The parsed timestamp, or null when it cannot be parsed.
 */
const parseMouseHuntDate = async (text) => {
  if (!text) {
    return null;
  }

  const match = text.match(
    /^(?:[A-Za-z]+,\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\s+@?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)\s*(?:\((UTC|Local Time)\))?\s*$/i
  );
  if (!match) {
    return null;
  }

  const [, monthName, dayText, yearText, hourText, minuteText, secondText = '0', meridiem, timezoneLabel] = match;
  const month = months.get(monthName.toLowerCase());
  if (undefined === month) {
    return null;
  }

  const day = Number.parseInt(dayText, 10);
  const year = Number.parseInt(yearText, 10);
  let hour = Number.parseInt(hourText, 10);
  const minute = Number.parseInt(minuteText, 10);
  const second = Number.parseInt(secondText, 10);

  if (day < 1 || day > 31 || hour < 1 || hour > 12 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }

  if (12 === hour) {
    hour = 0;
  }
  if ('pm' === meridiem.toLowerCase()) {
    hour += 12;
  }

  const wallClock = Date.UTC(year, month, day, hour, minute, second);
  const parsedWallClock = new Date(wallClock);
  if (parsedWallClock.getUTCFullYear() !== year || parsedWallClock.getUTCMonth() !== month || parsedWallClock.getUTCDate() !== day) {
    return null;
  }

  let accountOffsetInMinutes = 0;
  if ('utc' !== timezoneLabel?.toLowerCase()) {
    accountOffsetInMinutes = (await getAccountTimezoneOffset()) ?? -new Date(wallClock).getTimezoneOffset();
  }

  return wallClock - accountOffsetInMinutes * 60 * 1000;
};

export { parseMouseHuntDate };
