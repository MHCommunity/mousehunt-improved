import { onEvent, onNavigation, onRequest } from '@utils';

const TRAP_SELECTOR_STAGES = ['structure', 'images', 'controls', 'preview'];
const decorators = new Map(TRAP_SELECTOR_STAGES.map((stage) => [stage, []]));
let queuedContext = null;
let queued = false;
let started = false;
let rendering = false;
let rerenderRequested = false;
let generation = 0;

const flush = async () => {
  queued = false;
  if (rendering) {
    rerenderRequested = true;
    return;
  }

  const context = queuedContext;
  queuedContext = null;
  const renderGeneration = generation;
  rendering = true;

  try {
    for (const stage of TRAP_SELECTOR_STAGES) {
      for (const { callback, id } of decorators.get(stage)) {
        if (renderGeneration !== generation) {
          return;
        }

        try {
          await callback({
            ...context,
            generation: renderGeneration,
            isCurrent: () => renderGeneration === generation,
          });
        } catch (error) {
          console.error(`Error in trap selector stage "${stage}" (${id}):`, error); // eslint-disable-line no-console
        }
      }
    }
  } finally {
    rendering = false;
    if (rerenderRequested) {
      rerenderRequested = false;
      scheduleTrapSelector(queuedContext || context);
    }
  }
};

const scheduleTrapSelector = (context) => {
  generation++;
  queuedContext = context;
  if (queued) {
    return;
  }

  queued = true;
  queueMicrotask(flush);
};

const registerTrapSelectorDecorator = (stage, id, callback) => {
  if (! decorators.has(stage)) {
    throw new Error(`Unknown trap selector stage: ${stage}`);
  }

  decorators.get(stage).push({ id, callback });
};

const startTrapSelectorRuntime = () => {
  if (started) {
    return;
  }

  started = true;
  onEvent('camp_page_toggle_blueprint', (panel) => {
    scheduleTrapSelector({ type: 'blueprint', panel });
  });
  onRequest('users/gettrapcomponents.php', (data) => {
    scheduleTrapSelector({ type: 'components', data });
  });
  onRequest('users/changetrap.php', (data) => {
    scheduleTrapSelector({ type: 'trap-change', data });
  });
  onNavigation(() => {
    // Landing on camp can re-render an already-open trap selector without firing
    // camp_page_toggle_blueprint. Schedule a real blueprint pass so the decorators
    // actually run: they only handle 'blueprint', 'components' and 'trap-change', so a
    // 'navigation' context would bump the generation — aborting any in-flight render —
    // and then decorate nothing. If the item browser isn't open there's nothing to do,
    // and scheduling anyway would abort a render for no reason.
    if (! document.querySelector('.campPage-trap-itemBrowser')) {
      return;
    }

    scheduleTrapSelector({ type: 'blueprint', panel: 'item_browser' });
  }, { page: 'camp' });
};

export {
  TRAP_SELECTOR_STAGES,
  registerTrapSelectorDecorator,
  startTrapSelectorRuntime
};
