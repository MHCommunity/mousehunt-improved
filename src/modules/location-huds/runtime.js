import { createLifecycle, runInLifecycle } from '@utils';

/**
 * Create the runtime that owns location HUD activation and refresh behavior.
 *
 * Each raw location gets one lifecycle. Its long-lived callbacks are installed
 * once, remain dormant while another location is active, and are reused when
 * the hunter returns. Repeated updates still rerun the implementation's DOM
 * work, but lifecycle-aware event helpers suppress duplicate registrations.
 *
 * @return {Object} The location HUD runtime.
 */
const createLocationHudRuntime = () => {
  const lifecycles = new Map();
  let activeKey = null;

  const deactivate = () => {
    if (!activeKey) {
      return;
    }

    const active = lifecycles.get(activeKey);
    if (active) {
      active.lifecycle.active = false;
    }

    activeKey = null;
  };

  const activate = (key, implementation) => {
    if (activeKey && activeKey !== key) {
      deactivate();
    }

    let active = lifecycles.get(key);
    const isFirstActivation = !active;

    if (!active) {
      active = { lifecycle: createLifecycle(`location-hud:${key}`) };
      lifecycles.set(key, active);
    }

    active.lifecycle.active = true;
    activeKey = key;

    return runInLifecycle(active.lifecycle, implementation, isFirstActivation);
  };

  return {
    activate,
    deactivate,
    getActiveKey: () => activeKey,
  };
};

export default createLocationHudRuntime;
