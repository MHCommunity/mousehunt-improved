import { parseMouseHuntDate } from './date';
import { addEvent } from './event-registry';

// The aura data from the last response that included the trap image, by aura type: { status, expiry }.
let responseAuras = null;
let tracking = false;
const changeCallbacks = new Set();

/**
 * Start keeping the aura data the game sends with the trap image. The game renders the trap's
 * aura icons from the same data, but this still has it when the icons aren't on the page.
 */
const trackAuras = () => {
  if (tracking) {
    return;
  }
  tracking = true;

  addEvent(
    'ajax_response',
    (response) => {
      if (!response?.trap_image?.auras) {
        return;
      }

      responseAuras = response.trap_image.auras;
      for (const callback of changeCallbacks) {
        callback();
      }
    },
    {
      // Before the Trap Effectiveness label (1000) reads them.
      weight: 95,
      id: 'mh-improved-auras',
    }
  );
};

/**
 * Run a callback whenever a response brings new aura data.
 *
 * @param {Function} callback The callback.
 */
const onAurasChange = (callback) => {
  trackAuras();
  changeCallbacks.add(callback);
};

/**
 * Get the aura type from an aura icon's classes, like 'QuestDragonsMightAura'.
 *
 * @param {HTMLElement} element The aura icon.
 *
 * @return {string|undefined} The aura type.
 */
const getAuraTypeFromElement = (element) => [...element.classList].find((cls) => cls.startsWith('Quest') || cls.startsWith('MiniEvent') || cls.startsWith('Event'));

/**
 * Make a readable name from an aura type, for auras without an icon to read it from.
 *
 * @param {string} type The aura type, like 'QuestDragonsMightAura'.
 *
 * @return {string} The name, like 'Dragons Might'.
 */
const getAuraNameFromType = (type) =>
  type
    .replace(/^(Quest|MiniEvent|Event)/, '')
    .replace(/Aura$/, '')
    .replaceAll(/([a-z])([A-Z])/g, '$1 $2')
    .trim() || type;

/**
 * Get the trap's aura icons, by aura type.
 *
 * @return {Map<string, HTMLElement>} The icons.
 */
const getAuraElements = () => {
  const elements = new Map();
  for (const element of document.querySelectorAll('.trapImageView-trapAura.mousehuntTooltipParent')) {
    const type = getAuraTypeFromElement(element);
    // The trap selector can show the trap more than once; the first is the camp's.
    if (type && !elements.has(type)) {
      elements.set(type, element);
    }
  }

  return elements;
};

/**
 * Get the types of the trap's active auras, from the last response with the trap image and the
 * aura icons on the page. Either one is enough.
 *
 * @return {string[]} The aura types, like 'QuestDragonsMightAura', sorted.
 */
const getActiveAuraTypes = () => {
  const types = new Set();

  for (const [type, element] of getAuraElements()) {
    if (element.classList.contains('active')) {
      types.add(type);
    }
  }

  for (const [type, aura] of Object.entries(responseAuras || {})) {
    if ('active' === aura?.status) {
      types.add(type);
    }
  }

  return [...types].sort();
};

/**
 * Get the trap's active auras with their names and expiry times.
 *
 * @return {Promise<Object[]>} The auras: { type, name, expiry (ms), expiryText, remaining (seconds), element (or null) }.
 */
const getActiveAuras = async () => {
  const elements = getAuraElements();

  const auras = await Promise.all(
    getActiveAuraTypes().map(async (type) => {
      const element = elements.get(type) || null;

      const title = element?.querySelector('.trapImageView-tooltip-trapAura-title')?.textContent;
      const name =
        title
          ?.replace('You have the ', '')
          .replace(/Aura!?\s*$/, '')
          .trim() || getAuraNameFromType(type);

      // The response has the newest expiry; the icon has the one the page loaded with.
      const expiryText = (responseAuras?.[type]?.expiry || element?.querySelector('.trapImageView-tooltip-trapAura-expiry span')?.textContent || '').replaceAll(/\s+/g, ' ').trim();
      const expiry = await parseMouseHuntDate(expiryText);

      return {
        type,
        name,
        expiry,
        expiryText: expiryText.replace('(Local Time)', '').trim(),
        remaining: null === expiry ? null : Math.max(0, Math.floor((expiry - Date.now()) / 1000)),
        element,
      };
    })
  );

  return auras;
};

export { getActiveAuraTypes, getActiveAuras, onAurasChange, trackAuras };
