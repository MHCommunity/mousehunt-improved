import { onEvent, onNavigation, onRequest } from '@utils';

const TRAP_SELECTOR_STAGES = ['structure', 'images', 'controls', 'preview'];
const decorators = new Map(TRAP_SELECTOR_STAGES.map((stage) => [stage, []]));
let queuedContext = null;
let queued = false;
let started = false;
let rendering = false;
let rerenderRequested = false;

const flush = async () => {
  queued = false;
  if (rendering) {
    rerenderRequested = true;
    return;
  }

  const context = queuedContext;
  queuedContext = null;
  rendering = true;

  try {
    for (const stage of TRAP_SELECTOR_STAGES) {
      for (const { callback, id } of decorators.get(stage)) {
        try {
          await callback(context);
        } catch (error) {
          console.error(`Error in trap selector stage "${stage}" (${id}):`, error); // eslint-disable-line no-console
        }
      }
    }
  } finally {
    rendering = false;
    if (rerenderRequested) {
      rerenderRequested = false;
      scheduleTrapSelector(queuedContext || context); // eslint-disable-line no-use-before-define
    }
  }
};

const scheduleTrapSelector = (context) => {
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
    scheduleTrapSelector({ type: 'navigation' });
  }, { page: 'camp' });
};

export {
  TRAP_SELECTOR_STAGES,
  registerTrapSelectorDecorator,
  startTrapSelectorRuntime
};
