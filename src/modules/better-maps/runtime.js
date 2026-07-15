const MAP_RENDER_STAGES = [
  'structure',
  'state-classes',
  'navigation',
  'content',
  'interactions',
];

/**
 * Create the ordered Better Maps render runtime.
 *
 * @param {Object}   [dependencies]                Runtime adapters.
 * @param {Function} [dependencies.getRoot]        Find the mounted map root.
 * @param {Function} [dependencies.createObserver] Create a mutation observer.
 * @param {Function} [dependencies.schedule]       Queue a render task.
 *
 * @return {Object} The map runtime.
 */
const createMapRuntime = (dependencies = {}) => {
  const getRoot = dependencies.getRoot || (() => document.querySelector('.treasureMapRootView'));
  const createObserver = dependencies.createObserver || ((callback) => new MutationObserver(callback));
  const schedule = dependencies.schedule || queueMicrotask;
  const stages = new Map(MAP_RENDER_STAGES.map((stage) => [stage, []]));

  let currentMap = null;
  let generation = 0;
  let observer = null;
  let queued = false;
  let rendering = false;
  let rerenderRequested = false;
  let pendingReason = 'initial';
  let session = 0;
  let observerTimeout = null;

  const isReady = () => {
    const root = getRoot();
    const content = root?.querySelector('.treasureMapRootView-content');
    return root && content && ! content.classList.contains('loading') ? { root, content } : null;
  };

  const disconnectObserver = () => {
    if (observerTimeout) {
      clearTimeout(observerTimeout);
      observerTimeout = null;
    }

    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  const queueRender = ({ map = null, reason = 'update' } = {}) => {
    if (map) {
      if (! currentMap || `${currentMap.map_id}` !== `${map.map_id}`) {
        generation++;
      }

      currentMap = map;
    }

    pendingReason = reason;
    if (queued) {
      return;
    }

    queued = true;
    const queuedSession = session;
    schedule(() => {
      if (queuedSession === session) {
        return flush();
      }

      return null;
    });
  };

  const waitUntilReady = () => {
    if (observer || ! document.body) {
      return;
    }

    observer = createObserver(() => {
      if (isReady()) {
        disconnectObserver();
        queueRender({ reason: pendingReason });
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true,
    });

    // The map root only mounts while the dialog is opening. A render queued when it never
    // mounts (a background map refresh with the dialog closed) would otherwise leave this
    // whole-document observer attached for the rest of the page session.
    observerTimeout = setTimeout(disconnectObserver, 10_000);
  };

  async function flush() {
    queued = false;
    if (rendering) {
      rerenderRequested = true;
      return;
    }

    const ready = isReady();
    if (! ready) {
      waitUntilReady();
      return;
    }

    disconnectObserver();
    rendering = true;
    const renderGeneration = generation;
    const model = {
      ...ready,
      map: currentMap,
      mapId: currentMap?.map_id || null,
      reason: pendingReason,
      generation: renderGeneration,
      isCurrent: () => renderGeneration === generation,
    };

    try {
      for (const stage of MAP_RENDER_STAGES) {
        for (const { callback, id } of stages.get(stage)) {
          if (! model.isCurrent()) {
            return;
          }

          try {
            await callback(model);
          } catch (error) {
            console.error(`Error in map render stage "${stage}" (${id}):`, error); // eslint-disable-line no-console
          }
        }
      }
    } finally {
      rendering = false;
      if (rerenderRequested) {
        rerenderRequested = false;
        queueRender({ reason: pendingReason });
      }
    }
  }

  const register = (stage, id, callback) => {
    if (! stages.has(stage)) {
      throw new Error(`Unknown map render stage: ${stage}`);
    }

    stages.get(stage).push({ id, callback });
  };

  const reset = () => {
    disconnectObserver();
    queued = false;
    rerenderRequested = false;
    currentMap = null;
    generation++;
    session++;
  };

  return {
    queueRender,
    register,
    reset,
  };
};

export {
  MAP_RENDER_STAGES,
  createMapRuntime
};
