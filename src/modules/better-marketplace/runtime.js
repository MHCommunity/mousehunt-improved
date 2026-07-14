const METHOD_VIEWS = {
  showItem: (args) => ({ type: 'item', itemId: args[0], action: args[1] }),
  showBrowseCategory: (args) => ({ type: 'browse', category: args[0] }),
  showBrowser: (args) => ({ type: 'browse', category: args[0] }),
  showMyListings: () => ({ type: 'listings' }),
};

/**
 * Create the Better Marketplace view lifecycle.
 *
 * @param {Object}   [dependencies]          Runtime adapters.
 * @param {Function} [dependencies.schedule] Queue lifecycle work.
 *
 * @return {Object} The marketplace runtime.
 */
const createMarketplaceRuntime = (dependencies = {}) => {
  const schedule = dependencies.schedule || queueMicrotask;
  const decorators = new Map();
  const installedViews = new WeakSet();

  let currentSession = null;
  let generation = 0;
  let queued = false;
  let lifecycle = 0;
  let rendering = false;
  let rerenderRequested = false;

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
    try {
      await callback({
        ...session,
        generation,
        isCurrent: () => session === currentSession,
      });
    } catch (error) {
      console.error(`Error decorating marketplace ${session.type} view:`, error); // eslint-disable-line no-console
    } finally {
      rendering = false;
      if (rerenderRequested) {
        rerenderRequested = false;
        queue(); // eslint-disable-line no-use-before-define
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
    generation++;
    currentSession = session;
    queue();
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
