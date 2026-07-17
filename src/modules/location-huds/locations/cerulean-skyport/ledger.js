import {
  addStyles,
  dbGet,
  dbSet,
  formatNumber,
  makeElement,
  onJournalEntry,
  onRequest
} from '@utils';

import styles from './ledger.css';

const shipmentFinishedClass = 'ceruleanSkyport-shipmentFinished';
const pendingShipments = new Map();

/**
 * Get the key a shipment's ledger is saved under.
 *
 * @param {string|number} entryId The ID of the journal entry announcing the shipment.
 *
 * @return {string} The key.
 */
const getShipmentKey = (entryId) => {
  return `cerulean-skyport-ledger-${entryId}`;
};

/**
 * Get the shipment saved against a journal entry.
 *
 * @param {string} entryId The journal entry ID.
 *
 * @return {Promise<Object|null>} The saved shipment, or null if there isn't one.
 */
const getSavedShipment = async (entryId) => {
  const pendingShipment = pendingShipments.get(entryId);
  if (pendingShipment) {
    return pendingShipment;
  }

  const saved = await dbGet('data', getShipmentKey(entryId));

  return saved?.data?.ledger ? saved.data : null;
};

/**
 * Save a finished shipment's ledger against the journal entry announcing it.
 *
 * The quest only ever holds the most recently finished shipment's ledger, so it
 * has to be captured from the turn that finished the shipment or the next one
 * overwrites it.
 *
 * @param {Object} response The turn response.
 */
const saveShipment = async (response) => {
  const finished = (response?.journal_markup || []).find((markup) => {
    return markup?.render_data?.css_class?.includes(shipmentFinishedClass);
  });

  const entryId = finished?.render_data?.entry_id;
  if (! entryId) {
    return;
  }

  // Read the quest out of the response rather than the global `user`: the game
  // only swaps that in once its own success handler runs, which is after this,
  // so it still holds the previous shipment's ledger at this point.
  // The Skyport HUD renders from enviroment_atts. Some shipment types only
  // include their finished ledger there, so prefer it and keep the quest data
  // as a fallback for older response shapes.
  const skyport = response?.user?.enviroment_atts?.ledger
    ? response.user.enviroment_atts
    : response?.user?.quests?.QuestCeruleanSkyport;
  if (! skyport?.ledger) {
    return;
  }

  const shipment = {
    id: getShipmentKey(entryId),
    ledger: skyport.ledger,
    airship: skyport.airship,
  };

  // The journal entry can be rendered before IndexedDB has committed. Keep the
  // shipment available in memory until the persistent copy is ready so its
  // button is not missed on the first processing pass.
  pendingShipments.set(entryId, shipment);
  await dbSet('data', shipment);
  pendingShipments.delete(entryId);
};

/**
 * Build a shipment's ledger inside the dialog the game shows it in.
 *
 * Rendering the game's own dialog rather than reproducing its frame means the
 * bezel, close button and sizing all come from the game's stylesheet, and keep
 * matching it for free.
 *
 * @param {Object} shipment         The saved shipment.
 * @param {Object} shipment.ledger  The ledger to render.
 * @param {Object} shipment.airship The airship the shipment was flown with.
 *
 * @return {HTMLElement} The dialog's overlay.
 */
const makeLedger = ({ ledger, airship }) => {
  const wrapper = makeElement('div');

  wrapper.innerHTML = hg.utils.TemplateUtil.renderFromFile('HeadsUpDisplayCeruleanSkyportView', 'dialog_container', { title: '' });

  const overlay = wrapper.firstElementChild;
  overlay.classList.add('mh-improved-skyport-ledger-overlay', 'active');

  const dialog = overlay.querySelector('.headsUpDisplayCeruleanSkyportView__dialogContainer');
  dialog.classList.add('active');

  // The game styles each of its dialogs by type. 'ledger' also drops the title,
  // which the ledger doesn't set.
  dialog.dataset.type = 'ledger';

  const content = overlay.querySelector('.headsUpDisplayCeruleanSkyportView__dialogContent');
  content.innerHTML = hg.utils.TemplateUtil.renderFromFile('HeadsUpDisplayCeruleanSkyportView', 'log', {
    ledger: {
      ...ledger,
      // Both of these tokens are misspelled in the game's template.
      gold_formattted: formatNumber(ledger.gold),
      points_formattted: formatNumber(ledger.points),
    },
  });

  // A raid ledger shows the airship the raid was flown with in its header. The
  // game renders it separately rather than from the log template.
  if (ledger.is_raid && airship) {
    const dirigible = content.querySelector('.headsUpDisplayCeruleanSkyportView__logDialogHeaderRaidContainer .headsUpDisplayCeruleanSkyportView__logDialogHeaderDirigible');
    if (dirigible) {
      dirigible.innerHTML = hg.utils.TemplateUtil.renderFromFile('HeadsUpDisplayCeruleanSkyportView', 'ledger_airship', airship);
    }
  }

  return overlay;
};

/**
 * Show a saved shipment's ledger.
 *
 * @param {Object} shipment The saved shipment.
 */
const showLedger = (shipment) => {
  const overlay = makeLedger(shipment);
  const controller = new AbortController();
  const { signal } = controller;

  /**
   * Close the ledger, dropping the listeners that were holding it open.
   */
  const close = () => {
    overlay.remove();
    controller.abort();
  };

  overlay.querySelector('.headsUpDisplayCeruleanSkyportView__dialogCloseButton').addEventListener('click', close, { signal });

  // The overlay is only the target of a click that missed the dialog sitting on it.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      close();
    }
  }, { signal });

  document.addEventListener('keydown', (event) => {
    if ('Escape' === event.key) {
      close();
    }
  }, { signal });

  document.body.append(overlay);
};

/**
 * Add a button to a finished-shipment journal entry that opens its ledger.
 *
 * @param {Object} model The journal entry model.
 */
const addLedgerButton = async (model) => {
  if (! model.id || ! model.classes.has(shipmentFinishedClass)) {
    return;
  }

  const shipment = await getSavedShipment(model.id);
  if (! shipment || ! model.textEl) {
    return;
  }

  const button = makeElement('a', ['mh-improved-skyport-ledger-button', 'mousehuntActionButton', 'tiny']);
  button.href = '#';
  makeElement('span', '', 'View Ledger', button);

  button.addEventListener('click', (event) => {
    event.preventDefault();
    showLedger(shipment);
  });

  model.textEl.append(button);
};

/**
 * Open the ledger when the shipment's airship is clicked, matching the log
 * button on the HUD frame.
 */
const addHullClick = () => {
  const hud = document.querySelector('#hudLocationContent');
  if (! hud || hud.getAttribute('data-mh-improved-skyport-ledger')) {
    return;
  }

  hud.setAttribute('data-mh-improved-skyport-ledger', 'true');

  // Delegated from the HUD, which outlives the shipping view the game swaps out
  // whenever the shipment changes.
  hud.addEventListener('click', (event) => {
    if (! event.target.closest('.ceruleanSkyportShippingView__currentShipmentDirigibleHull')) {
      return;
    }

    const logButton = hud.querySelector('.headsUpDisplayCeruleanSkyportView__logButton:not(.disabled)');
    if (logButton) {
      logButton.click();
    }
  });
};

let hasAddedLedgerButtons = false;

/**
 * Make the ledger reachable from the shipment's airship and from every finished
 * shipment in the journal.
 */
const initLedger = () => {
  onRequest('turns/activeturn.php', saveShipment, true);

  // This is registered outside the Skyport HUD lifecycle: finished shipments
  // remain in the journal and must keep their button after travelling away.
  if (hasAddedLedgerButtons) {
    return;
  }

  hasAddedLedgerButtons = true;

  addStyles(styles, 'cerulean-skyport-ledger');

  onJournalEntry(addLedgerButton, {
    id: 'cerulean-skyport-ledger',
    stage: 'interactions',
  });
};

export {
  addHullClick,
  initLedger
};
