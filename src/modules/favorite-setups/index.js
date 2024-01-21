import {
  addStyles,
  createPopup,
  debuglog,
  doRequest,
  getCurrentPage,
  getHeaders,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  saveSetting,
  sessionGet,
  sessionSet
} from '@utils';

import styles from './styles.css';

const getFavoriteSetups = () => {
  return getSetting('favorite-setups', []);
};

const saveFavoriteSetup = (setup) => {
  const setups = getFavoriteSetups();

  setups.push(normalizeSetup(setup));

  saveSetting('favorite-setups', setups);
};

const normalizeSetup = (setup) => {
  // normalize the setup by forcing everything to be a string.
  // normalize the setup by forcing everything to be a string.
  return Object.keys(setup).reduce((acc, key) => {
    acc[key] = setup[key] ? setup[key].toString() : '';
    return acc;
  }, {});
};

const getCurrentSetup = () => {
  return normalizeSetup({
    id: 'current',
    name: 'Current Setup',
    bait_id: user.bait_item_id,
    base_id: user.base_item_id,
    weapon_id: user.weapon_item_id,
    trinket_id: user.trinket_item_id,
  });
};

const makeImage = (type, id, thumbnail) => {
  const wrapper = makeElement('div', 'campPage-trap-itemBrowser-favorite-item');
  wrapper.setAttribute('data-item-id', id);
  wrapper.setAttribute('data-item-type', type);

  const item = makeElement('div', ['campPage-trap-itemBrowser-favorite-item-image']);
  item.style.backgroundImage = `url(${thumbnail})`;

  makeElement('div', 'campPage-trap-itemBrowser-favorite-item-frame', '', item);

  wrapper.append(item);

  return wrapper;
};

const makeButton = (button) => {
  const buttonElement = makeElement('a', ['mousehuntActionButton', 'action', ...button.className]);
  makeElement('span', '', button.text, buttonElement);

  buttonElement.addEventListener('click', button.callback);

  return buttonElement;
};

const getCheeseEffect = (textValue) => {
  const data = {
    'Uber Fresh': 13,
    'Ultimately Fresh': 12,
    'Insanely Fresh': 11,
    'Extremely Fresh': 10,
    'Very Fresh': 9,
    Fresh: 8,
    'No Effect': 7,
    Stale: 6,
    'Very Stale': 5,
    'Extremely Stale': 4,
    'Insanely Stale': 3,
    'Ultimately Stale': 2,
    'Uber Stale': 1
  };

  return data[textValue];
};

const makeImagePicker = async (setupId, type, currentId, callback) => {
  const response = await doRequest('managers/ajax/users/gettrapcomponents.php', {
    classification: type,
  });

  const items = response?.components || [];

  // re-sort the items by item name.
  items.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });

  let content = '<div class="mh-improved-favorite-setups-component-picker-popup">';
  content += '<div class="mh-improved-favorite-setups-component-picker-popup-body">';
  content += '<div class="mh-improved-favorite-setups-component-picker-popup-search">';
  content += '<input type="text" placeholder="Search" id="mh-improved-favorite-setups-component-picker-popup-search-input" />';
  content += '</div>';
  content += '<div class="mh-improved-favorite-setups-component-picker-popup-body-items">';
  for (const item of items) {
    const getStatRow = (stat, title, formatted, compare) => {
      let compareStat = item[stat];
      if ('cheese_effect' === stat) {
        compareStat = getCheeseEffect(item);
        compare = getCheeseEffect(compare);
      }

      const compareClass = compare === compareStat ? '' : (compare > compareStat ? 'better' : 'worse');

      return `<div class="campPage-trap-itemBrowser-item-stat ${stat} ${compareClass}" title="${title}">
        <div class="value"><span>${formatted}</span></div>
      </div>`;
    };

    content += `<div class="campPage-trap-itemBrowser-item loaded ${type}" data-item-id="${item.item_id}">`;
    content += ' <div class="campPage-trap-itemBrowser-item-leftBar">';
    content += `  <a href="#"><div class="campPage-trap-itemBrowser-item-image" style="background-image:url(${item.thumbnail});"></div></a>`;
    content += `  <a href="#" class="campPage-trap-itemBrowser-item-armButton save-button" data-item-id="${item.item_id}" data-item-classification="${type}" data-item-image="${item.thumbnail}">Select</a>`;
    content += ' </div>';
    content += ' <div class="campPage-trap-itemBrowser-item-content">';
    content += ` <div class="campPage-trap-itemBrowser-item-name">${item.name}</div>`;
    if ('bait' === type || 'trinket' === type) {
      const quantityFormatted = item.quantity.toLocaleString();
      content += `<div class="campPage-trap-itemBrowser-item-quantity"><span class="quantity">${quantityFormatted}</span><span class="label">Quantity</span></div>`;
    }

    if (item.has_stats) {
      content += '<div class="campPage-trap-itemBrowser-item-statContainer">';
      content += item.has_power ? getStatRow('power', 'Power', item.power_formatted, user.trap_power) : '';
      content += item.has_power_bonus ? getStatRow('power_bonus', 'Power Bonus', item.power_bonus_formatted, user.trap_power_bonus) : '';
      content += item.has_attraction_bonus ? getStatRow('attraction_bonus', 'Attraction Bonus', item.attraction_bonus_formatted, user.trap_attraction_bonus) : '';
      content += item.has_luck ? getStatRow('luck', 'Luck', item.luck_formatted, user.trap_luck) : '';
      content += getStatRow('cheese_effect', 'Cheese Effect', item.cheese_effect, user.trap_cheese_effect);
      content += '</div>';
    }

    content += '<div class="campPage-trap-itemBrowser-item-description shortDescription">';
    content += item.consume_method ? `<div class="campPage-trap-itemBrowser-item-description-consumeMethod"><b>Consumed on:</b> ${item.consume_method}</div>` : '';
    if ('bait' === type) {
      let description = item.description.replaceAll(/<\/?[^>]+(>|$)/g, ''); // Remove HTML tags
      description = description.slice(0, 200); // Get the first 200 characters
      if (item.description.length > 150) {
        description += '…';
      }

      content += `<div class="campPage-trap-itemBrowser-item-description-text">${description}</div>`;
    }

    content += '</div>';
    content += '</div>';
    content += '</div>';
  }
  content += '</div>';
  content += '</div>';
  content += '</div>';

  const popup = createPopup({
    id: 'mh-improved-favorite-setups-component-picker',
    title: '',
    content,
    className: 'mh-improved-favorite-setups-component-picker',
  });

  popup.setIsModal(true);
  popup.show();

  const saveButtons = document.querySelectorAll('.campPage-trap-itemBrowser-item-armButton.save-button');
  saveButtons.forEach((saveButton) => {
    saveButton.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      callback(
        saveButton.getAttribute('data-item-id'),
        saveButton.getAttribute('data-item-classification'),
        saveButton.getAttribute('data-item-image')
      );
      popup.hide();
    });
  });

  const searchInput = document.querySelector('#mh-improved-favorite-setups-component-picker-popup-search-input');

  if (! searchInput) {
    return;
  }

  searchInput.focus();

  searchInput.addEventListener('keyup', () => {
    const filter = searchInput.value.toLowerCase();
    const searchItems = document.querySelectorAll('.campPage-trap-itemBrowser-item');
    searchItems.forEach((item) => {
      const name = item.querySelector('.campPage-trap-itemBrowser-item-name');
      if (name.textContent.toLowerCase().includes(filter)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
};

const armItem = async (itemId, itemType) => {
  // hg.utils.TrapControl.armItem(id, type, success, failure);
  return new Promise((resolve, reject) => {
    hg.utils.TrapControl.armItem(itemId, itemType).go(resolve, reject);
  });
};

const makeBlueprintRow = async (setup, isCurrent = false) => {
  const setupContainer = makeElement('div', ['row']);

  const controls = makeElement('div', ['controls']);
  makeElement('div', ['label'], setup.name, controls);

  const buttonWrapper = makeElement('div', ['button-wrapper']);
  if (isCurrent) {
    buttonWrapper.append(makeButton({
      text: 'Save',
      className: ['save', 'lightBlue'],
      callback: async () => {
        // Save the current setup, using the current location as the name.
        const currentSetup = getCurrentSetup();
        currentSetup.name = user.environment_name;
        currentSetup.id = `${user.environment_type}-${setup.bait_id}-${setup.base_id}-${setup.weapon_id}-${setup.trinket_id}`;

        // if the setup already exists, then just alert the user.
        const setups = getFavoriteSetups();
        const existingSetup = setups.find((s) => s.id === currentSetup.id);
        if (existingSetup) {
          // flash the row.
          const row = document.querySelector(`.mh-improved-favorite-setups-blueprint-container .row[data-setup-id="${currentSetup.id}"]`);
          row.classList.add('flash');
          setTimeout(() => {
            row.classList.remove('flash');
          }, 1000);
          return;
        }

        saveFavoriteSetup(currentSetup);

        // append the new setup to the list.
        const setupRow = await makeBlueprintRow(currentSetup);
        setupRow.setAttribute('data-setup-id', currentSetup.id);

        const body = document.querySelector('.mh-improved-favorite-setups-blueprint-container .content');
        body.append(setupRow);

        updateFavoriteSetupName();
      }
    }));
  } else {
    buttonWrapper.append(makeButton({
      text: 'Arm',
      className: ['arm'],
      callback: async () => {
        // Arm the setup.
        const setupId = setupContainer.getAttribute('data-setup-id');
        debuglog('favorite-setups', `Arming setup ${setupId}`);

        // get the setup.
        const setups = getFavoriteSetups();
        const index = setups.findIndex((s) => s.id === setupId);

        const thisSetup = setups[index];

        // eslint-disable-next-line eqeqeq
        if (thisSetup.bait_id && thisSetup.bait_id != user.bait_id) {
          await armItem(thisSetup.bait_id, 'bait');
        }

        // eslint-disable-next-line eqeqeq
        if (thisSetup.base_id && thisSetup.base_id != user.base_id) {
          await armItem(thisSetup.base_id, 'base');
        }

        // eslint-disable-next-line eqeqeq
        if (thisSetup.weapon_id && thisSetup.weapon_id != user.weapon_id) {
          await armItem(thisSetup.weapon_id, 'weapon');
        }

        // eslint-disable-next-line eqeqeq
        if (thisSetup.trinket_id && thisSetup.trinket_id != user.trinket_id) {
          await armItem(thisSetup.trinket_id, 'trinket');
        }

        updateFavoriteSetupName();
      }
    }));

    buttonWrapper.append(makeButton({
      text: 'Edit',
      className: ['edit-setup'],
      callback: () => {
        const setupId = setupContainer.getAttribute('data-setup-id');
        debuglog('favorite-setups', `Editing setup ${setupId}`);

        setupContainer.classList.add('editing');

        // Update the setup title to be an input.
        const title = setupContainer.querySelector('.label');
        const titleInput = document.createElement('input');
        titleInput.value = title.textContent;
        title.textContent = '';
        title.append(titleInput);

        // Update the setup images to be clickable.
        const images = setupContainer.querySelectorAll('.campPage-trap-itemBrowser-favorite-item');
        images.forEach((image) => {
          image.classList.add('clickable');
          image.addEventListener('click', async () => {
            // Handle image click
            const itemType = image.getAttribute('data-item-type');
            const itemId = image.getAttribute('data-item-id');
            const imageDisplay = image.querySelector('.campPage-trap-itemBrowser-favorite-item-image');
            await makeImagePicker(setupId, itemType, itemId, (newItemId, newItemType, newItemImageUrl) => {
              if (itemType !== newItemType) {
                return;
              }

              // no change.
              if (itemId === newItemId) {
                return;
              }

              image.setAttribute('data-new-item-id', newItemId);
              image.setAttribute('data-new-item-image', newItemImageUrl);
              image.setAttribute('data-old-image-url', imageDisplay.style.backgroundImage);

              imageDisplay.style.backgroundImage = `url(${newItemImageUrl})`;
            });
          });
        });
      }
    }));

    buttonWrapper.append(makeButton({
      text: 'Save',
      className: ['save-setup'],
      callback: () => {
        const setupId = setupContainer.getAttribute('data-setup-id');
        debuglog('favorite-setups', `Saving setup ${setupId}`);

        setupContainer.classList.remove('editing');
        // When save is clicked, save the changes.

        const title = setupContainer.querySelector('.label');
        const titleInput = title.querySelector('input');

        // Update the setup title to be a div.
        const newSetup = {
          ...setup,
          name: titleInput.value,
        };

        // if there are any items with a new-item-id, then update the setup.
        const images = setupContainer.querySelectorAll('.campPage-trap-itemBrowser-favorite-item');
        images.forEach((image) => {
          const newItemId = image.getAttribute('data-new-item-id');
          if (! newItemId) {
            return;
          }

          const itemType = image.getAttribute('data-item-type');

          // update the setup.
          newSetup[`${itemType}_id`] = newItemId;

          // remove the new-item-id attribute.
          image.removeAttribute('data-new-item-id');
          image.removeAttribute('data-new-item-image');
          image.removeAttribute('data-old-image-url');
        });

        const setups = getFavoriteSetups();
        const index = setups.findIndex((s) => s.id === setupId);

        // generate a random ID so it's unique.
        newSetup.id = Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);

        // replace the setup in the list.
        setups[index] = newSetup;
        saveSetting('favorite-setups', setups);

        // Update the setup title to be a div.
        title.textContent = newSetup.name;
        titleInput.remove();

        updateFavoriteSetupName();
      }
    }));

    buttonWrapper.append(makeButton({
      text: 'Cancel',
      className: ['cancel-setup'],
      callback: () => {
        setupContainer.classList.remove('editing');
        // When cancel is clicked, revert the changes.

        // title.
        const titleInput = setupContainer.querySelector('.label input');
        const title = setupContainer.querySelector('.label');
        title.textContent = setup.name;
        titleInput.remove();

        // check for any new-item-id attributes.
        const images = setupContainer.querySelectorAll('.campPage-trap-itemBrowser-favorite-item');
        images.forEach((image) => {
          const newItemId = image.getAttribute('data-new-item-id');
          if (! newItemId) {
            return;
          }

          // reset the image background.
          const imageDisplay = image.querySelector('.campPage-trap-itemBrowser-favorite-item-image');
          imageDisplay.style.backgroundImage = image.getAttribute('data-old-image-url');

          // remove the new-item-id attribute.
          image.removeAttribute('data-new-item-id');
          image.removeAttribute('data-new-item-image');
          image.removeAttribute('data-old-image-url');
        });
      }
    }));

    buttonWrapper.append(makeButton({
      text: 'Delete',
      className: ['delete', 'danger'],
      callback: () => {
        const setupId = setupContainer.getAttribute('data-setup-id');
        debuglog('favorite-setups', `Deleting setup ${setupId}`);

        // show a confirmation dialog.
        const confirmed = confirm('Are you sure you want to delete this setup?'); // eslint-disable-line no-alert
        if (! confirmed) {
          return;
        }

        // remove the setup from the list.
        const setups = getFavoriteSetups();
        const index = setups.findIndex((s) => s.id === setupId);
        setups.splice(index, 1);
        saveSetting('favorite-setups', setups);

        // remove the setup from the list.
        setupContainer.remove();
      }
    }));
  }

  controls.append(buttonWrapper);
  setupContainer.append(controls);

  let cachedThumbnails = JSON.parse(sessionGet('favorite-setups-thumbnails'));
  if (! cachedThumbnails) {
    cachedThumbnails = {};
  }

  const needThumbnails = [];

  const items = [
    setup.bait_id,
    setup.base_id,
    setup.weapon_id,
    setup.trinket_id,
  ];

  for (const item of items) {
    if (! cachedThumbnails[item]) {
      needThumbnails.push(item);
    }
  }

  if (needThumbnails.length) {
    const grabbedThumbnailsReq = await fetch('https://images.mouse.rip', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(needThumbnails),
    });

    const grabbedThumbnails = await grabbedThumbnailsReq.json();

    const thumbnails = {
      ...cachedThumbnails,
      ...grabbedThumbnails,
    };

    sessionSet('favorite-setups-thumbnails', JSON.stringify(thumbnails));

    cachedThumbnails = thumbnails;
  }

  setupContainer.append(makeImage('bait', setup.bait_id, cachedThumbnails[setup.bait_id]));
  setupContainer.append(makeImage('base', setup.base_id, cachedThumbnails[setup.base_id]));
  setupContainer.append(makeImage('weapon', setup.weapon_id, cachedThumbnails[setup.weapon_id]));
  setupContainer.append(makeImage('trinket', setup.trinket_id, cachedThumbnails[setup.trinket_id]));

  return setupContainer;
};

const makeBlueprintContainer = async () => {
  const existing = document.querySelector('.mh-improved-favorite-setups-blueprint-container');
  if (existing) {
    existing.remove();
  }

  const container = makeElement('div', 'mh-improved-favorite-setups-blueprint-container');

  const header = makeElement('div', ['header']);
  makeElement('b', ['title'], 'Favorite Setups', header);

  const editLink = makeElement('a', ['mousehuntActionButton', 'tiny', 'edit']);
  const editLinkText = makeElement('span', '', 'Edit');
  editLink.append(editLinkText);

  let isEditing = false;
  editLink.addEventListener('click', () => {
    isEditing = ! isEditing;

    if (isEditing) {
      editLinkText.innerHTML = 'Done';
      container.classList.add('editing');
    } else {
      editLinkText.innerHTML = 'Edit';
      container.classList.remove('editing');
    }
  });

  header.append(editLink);

  container.append(header);

  const body = makeElement('div', ['content']);

  const setups = getFavoriteSetups();

  const currentSetupRow = await makeBlueprintRow(getCurrentSetup(), true);
  currentSetupRow.classList.add('current-setup');
  body.append(currentSetupRow);

  for (const setup of setups) {
    const setupContainer = await makeBlueprintRow(setup);
    setupContainer.setAttribute('data-setup-id', setup.id);

    body.append(setupContainer);
  }

  container.append(body);

  const appendTo = document.querySelector('.campPage-trap-blueprintContainer');
  if (! appendTo) {
    return false;
  }

  appendTo.append(container);

  return container;
};

const getNameOfCurrentSetup = () => {
  const setups = getFavoriteSetups();

  // if we have a setup with the same IDs, then return the name of that setup.
  const currentSetup = getCurrentSetup();
  const setup = setups.find((s) => {
    return s.bait_id === currentSetup.bait_id &&
      s.base_id === currentSetup.base_id &&
      s.weapon_id === currentSetup.weapon_id &&
      s.trinket_id === currentSetup.trinket_id;
  });

  if (setup) {
    return setup.name;
  }

  return '';
};

const updateFavoriteSetupName = () => {
  const label = document.querySelector('.mh-improved-favorite-setups-button-label');
  if (! label) {
    return;
  }

  label.innerHTML = getNameOfCurrentSetup();
};

const addFavoriteSetupsButton = () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const existingButton = document.querySelector('.mh-improved-favorite-setups-button');
  if (existingButton) {
    return;
  }

  const appendTo = document.querySelector('.campPage-trap-itemStats');
  if (! appendTo) {
    return;
  }

  const button = makeElement('a', ['mh-improved-favorite-setups-button', 'campPage-trap-trapEffectiveness']);
  makeElement('div', ['mh-improved-favorite-setups-button-text'], 'Favorite Setups', button);
  const label = makeElement('div', ['mh-improved-favorite-setups-button-label']);

  label.innerHTML = getNameOfCurrentSetup();
  button.append(label);

  button.addEventListener('click', async () => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    } else {
      await makeBlueprintContainer();
      showFavoriteSetups();
    }
  });

  // Append as a sibling to the existing button.
  appendTo.parentNode.insertBefore(button, appendTo.nextSibling);
};

const isFavoriteSetupsShowing = () => {
  const pageContainer = document.querySelector('#mousehuntContainer');
  if (! pageContainer) {
    return false;
  }

  return pageContainer.classList.contains('showFavoriteSetups');
};

const hideFavoriteSetups = () => {
  const pageContainer = document.querySelector('#mousehuntContainer');
  if (! pageContainer) {
    return;
  }

  pageContainer.classList.remove('showBlueprint', 'showFavoriteSetups');

  const container = document.querySelector('.mh-improved-favorite-setups-blueprint-container');
  if (container) {
    container.classList.add('hidden');
  }
};

const showFavoriteSetups = () => {
  const pageContainer = document.querySelector('#mousehuntContainer');
  if (! pageContainer) {
    return;
  }

  pageContainer.classList.remove('editTrap', 'showTrapEffectiveness');
  pageContainer.classList.add('showBlueprint', 'showFavoriteSetups');

  const container = document.querySelector('.mh-improved-favorite-setups-blueprint-container');
  if (container) {
    container.classList.remove('hidden');
  }
};

const replaceCloseBlueprintDrawer = () => {
  const _closeBlueprintDrawer = app.pages.CampPage.closeBlueprintDrawer;
  app.pages.CampPage.closeBlueprintDrawer = (...args) => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    }

    _closeBlueprintDrawer(...args);
  };

  const _toggleItemBrowser = app.pages.CampPage.toggleItemBrowser;
  app.pages.CampPage.toggleItemBrowser = (...args) => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    }

    _toggleItemBrowser(...args);
  };

  const _toggleTrapEffectiveness = app.pages.CampPage.toggleTrapEffectiveness;
  app.pages.CampPage.toggleTrapEffectiveness = (...args) => {
    if (isFavoriteSetupsShowing()) {
      hideFavoriteSetups();
    }

    _toggleTrapEffectiveness(...args);
  };
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles);

  onNavigation(addFavoriteSetupsButton, {
    page: 'camp',
  });

  let timeoutId;
  onEvent('camp_page_arm_item', () => {
    // Clear the previous timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout to call the function after 500ms
    timeoutId = setTimeout(updateFavoriteSetupName, 500);
  });

  replaceCloseBlueprintDrawer();
};

export default {
  id: 'favorite-setups',
  name: 'Favorite Setups',
  type: 'feature',
  default: false,
  description: 'Save your favorite setups and arm them with a single click.',
  load: init
};
