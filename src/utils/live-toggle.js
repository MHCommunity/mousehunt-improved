import { addBodyClass, removeBodyClass } from './utils';
import { createLifecycle, runInLifecycle } from './lifecycle';
import { debug } from './debug';
import { getSetting } from './settings';
import { onEvent } from './event-registry';
import { replaceInTemplate } from './templates';

/**
 * Live toggling lets a module be turned on and off from the settings page without a refresh.
 *
 * A module opts in with `liveToggle: true`. It's then loaded inside a lifecycle, so the
 * long-lived callbacks it registers synchronously (onRequest, onNavigation, onTurn, onTravel,
 * onDialogShow, onEvent) go quiet while it's disabled and resume when it's re-enabled, without
 * being registered twice. Anything else it changes is undone with the helpers below.
 *
 * A module that's off at page load is loaded the first time it's enabled. After that, enabling
 * and disabling only runs its toggle handlers; `load()` is never run a second time.
 */

const liveModules = new Map();
const liveSettings = new Set();

/**
 * Register a module that can be toggled without a refresh.
 *
 * @param {Object}  module  The module definition.
 * @param {boolean} enabled Whether the module is being loaded on this page load.
 */
const registerLiveModule = (module, enabled) => {
  liveModules.set(module.id, {
    module,
    enabled,
    loaded: false,
    lifecycle: createLifecycle(`module:${module.id}`),
    handlers: [],
  });
};

/**
 * Check if a module can be toggled without a refresh.
 *
 * @param {string} id The module ID.
 *
 * @return {boolean} Whether the module is live toggled.
 */
const isLiveModule = (id) => liveModules.has(id);

/**
 * Mark a setting as one that applies without a refresh.
 *
 * @param {string} key The setting key.
 */
const markSettingLive = (key) => {
  liveSettings.add(key);
};

/**
 * Check if changing a setting takes effect without a refresh.
 *
 * @param {string} key The setting key.
 *
 * @return {boolean} Whether the setting applies live.
 */
const isLiveSetting = (key) => isLiveModule(key) || liveSettings.has(key);

/**
 * Check if a module is currently enabled.
 *
 * Live modules report their current state, so callbacks the lifecycle can't guard (observers,
 * wrapped game methods, work registered after an await) can bail while the module is off.
 *
 * @param {string} id The module ID.
 *
 * @return {boolean} Whether the module is enabled.
 */
const isModuleEnabled = (id) => {
  const state = liveModules.get(id);
  return state ? state.enabled : !!getSetting(id, false);
};

/**
 * Load a live module within its lifecycle.
 *
 * @param {string} id The module ID.
 *
 * @return {Promise} The module's load result.
 */
const loadLiveModule = async (id) => {
  const state = liveModules.get(id);
  if (!state || state.loaded) {
    return;
  }

  state.loaded = true;
  state.lifecycle.active = true;

  return runInLifecycle(state.lifecycle, () => state.module.load());
};

/**
 * Run code when a live module is enabled or disabled.
 *
 * Neither callback runs on page load; `enable` re-applies what `load()` did, and `disable` undoes it.
 *
 * @param {string}   id               The module ID.
 * @param {Object}   handlers         The handlers.
 * @param {Function} handlers.enable  Run when the module is re-enabled.
 * @param {Function} handlers.disable Run when the module is disabled.
 */
const onModuleToggle = (id, { enable = null, disable = null }) => {
  liveModules.get(id)?.handlers.push({ enable, disable });
};

/**
 * Add a persistent body class that follows a live module's state.
 *
 * @param {string} id        The module ID.
 * @param {string} className The class to add.
 */
const addModuleBodyClass = (id, className) => {
  addBodyClass(className, true);

  onModuleToggle(id, {
    enable: () => addBodyClass(className, true),
    disable: () => removeBodyClass(className),
  });
};

/**
 * Wrap a game method so the replacement only runs while a module is enabled.
 *
 * The wrapper stays in place when the module is disabled and falls through to the original, so
 * wrappers other modules add on top of it keep working.
 *
 * @param {string}   id          The module ID.
 * @param {Object}   target      The object that owns the method.
 * @param {string}   method      The method name.
 * @param {Function} replacement Called as `replacement.call(this, original, ...args)`.
 */
const overrideWhileEnabled = (id, target, method, replacement) => {
  const original = target?.[method];
  if ('function' !== typeof original) {
    return;
  }

  target[method] = function (...args) {
    return isModuleEnabled(id) ? replacement.call(this, original, ...args) : original.apply(this, args);
  };
};

/**
 * Make text replacements in a game template while a module is enabled.
 *
 * The replacements are reversed when the module is disabled, so each replacement string needs to
 * be unique within the template.
 *
 * @param {string} id           The module ID.
 * @param {string} templateId   The template ID.
 * @param {Array}  replacements The [find, replace] pairs.
 */
const replaceInTemplateWhileEnabled = (id, templateId, replacements) => {
  replaceInTemplate(templateId, replacements);

  onModuleToggle(id, {
    enable: () => replaceInTemplate(templateId, replacements),
    disable: () =>
      replaceInTemplate(
        templateId,
        replacements.map(([find, replace]) => [replace, find])
      ),
  });
};

/**
 * Enable or disable a live module.
 *
 * @param {string}  id      The module ID.
 * @param {boolean} enabled Whether the module should be enabled.
 */
const setModuleEnabled = async (id, enabled) => {
  const state = liveModules.get(id);
  if (!state || state.enabled === enabled) {
    return;
  }

  state.enabled = enabled;

  if (enabled && !state.loaded) {
    await loadLiveModule(id);
    return;
  }

  state.lifecycle.active = enabled;
  for (const handler of state.handlers) {
    try {
      (enabled ? handler.enable : handler.disable)?.();
    } catch (error) {
      debug(`Error ${enabled ? 'enabling' : 'disabling'} "${id}"`, error);
    }
  }
};

onEvent('mh-improved-settings-changed', ({ key, value }) => {
  if (isLiveModule(key)) {
    setModuleEnabled(key, !!value).catch((error) => debug(`Error loading "${key}"`, error));
  }
});

export {
  addModuleBodyClass,
  isLiveModule,
  isLiveSetting,
  isModuleEnabled,
  loadLiveModule,
  markSettingLive,
  onModuleToggle,
  overrideWhileEnabled,
  registerLiveModule,
  replaceInTemplateWhileEnabled,
};
