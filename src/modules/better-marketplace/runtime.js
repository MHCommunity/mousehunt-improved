const METHOD_VIEWS = {
  showHome: () => ({ type: 'home' }),
  showItem: (args) => ({ type: 'item', itemId: args[0], action: args[1] }),
  showBrowseCategory: (args) => ({ type: 'browse', category: args[0] }),
  showBrowser: (args) => ({ type: 'browse', category: args[0] }),
  showRecommendedItems: () => ({ type: 'browse', category: 'recommended' }),
  showFavouriteItems: () => ({ type: 'browse', category: 'favourites' }),
  showRecentlyTradedItems: () => ({ type: 'browse', category: 'recently-traded' }),
  showHighValueItems: () => ({ type: 'browse', category: 'high-value' }),
  showMostVolumeItems: () => ({ type: 'browse', category: 'most-volume' }),
  showMostDemandedItems: () => ({ type: 'browse', category: 'most-demanded' }),
  showEventItems: () => ({ type: 'browse', category: 'event' }),
  showMyListings: () => ({ type: 'listings' }),
  showMyHistory: () => ({ type: 'history' }),
  showMyHistoryByItem: (args) => ({ type: 'history', itemId: args[0] }),
};

/**
 * Create the Better Marketplace view lifecycle.
 *
 * @param {Object}   [dependencies]          Runtime adapters.
 * @param {Function} [dependencies.schedule] Queue lifecycle work.
 * @param {Function} [dependencies.settle]   Queue work after native rendering.
 *
 * @return {Object} The marketplace runtime.
 */
const createMarketplaceRuntime = (dependencies = {}) => {
  const schedule = dependencies.schedule || queueMicrotask;
  const settle = dependencies.settle || ((callback) => setTimeout(callback, 0));
  const decorators = new Map();
  const installedViews = new WeakSet();

  let currentSession = null;
  let generation = 0;
  let queued = false;
  let lifecycle = 0;
  let rendering = false;
  let rerenderRequested = false;
  let cancelRender = null;

  const flush = async () => {
    queued = false;
    if (rendering) {
      rerenderRequested = true;
      return;
    }

    const session = currentSession;
    if (! session) {
      return;
    }

    const callback = decorators.get(session.type);
    if (! callback) {
      return;
    }

    rendering = true;
    let cancel;
    const cancelled = new Promise((resolve) => {
      cancel = resolve;
    });
    cancelRender = cancel;

    try {
      const decoration = callback({
        ...session,
        generation,
        isCurrent: () => session === currentSession,
      });
      await Promise.race([decoration, cancelled]);
    } catch (error) {
      console.error(`Error decorating marketplace ${session.type} view:`, error); // eslint-disable-line no-console
    } finally {
      if (cancelRender === cancel) {
        cancelRender = null;
      }

      rendering = false;
      if (rerenderRequested) {
        rerenderRequested = false;
        queue();
      }
    }
  };

  const queue = () => {
    if (queued || ! currentSession) {
      return;
    }

    queued = true;
    const queuedLifecycle = lifecycle;
    schedule(() => {
      if (queuedLifecycle === lifecycle) {
        return flush();
      }

      return null;
    });
  };

  const open = (session) => {
    cancelRender?.();
    generation++;
    currentSession = session;
    queue();

    const sessionGeneration = generation;
    settle(() => {
      if (sessionGeneration === generation) {
        queue();
      }
    });
  };

  const install = (marketplaceView) => {
    if (! marketplaceView || installedViews.has(marketplaceView)) {
      return;
    }

    installedViews.add(marketplaceView);
    Object.entries(METHOD_VIEWS).forEach(([method, makeSession]) => {
      const original = marketplaceView[method];
      if ('function' !== typeof original) {
        return;
      }

      marketplaceView[method] = function () {
        const args = [...arguments];
        const result = Reflect.apply(original, this, args);
        open({ ...makeSession(args), args });
        return result;
      };
    });
  };

  return {
    install,
    open,
    refresh: queue,
    register: (type, callback) => decorators.set(type, callback),
    reset: () => {
      cancelRender?.();
      generation++;
      currentSession = null;
      queued = false;
      rerenderRequested = false;
      lifecycle++;
    },
  };
};

export {
  createMarketplaceRuntime
};
