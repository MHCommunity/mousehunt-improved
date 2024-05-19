import {
  addIconToMenu,
  addStyles,
  createPopup,
  debuglog,
  doRequest,
  getCurrentLocation,
  getCurrentPage,
  getData,
  getHeaders,
  getSetting,
  makeElement,
  onEvent,
  onNavigation,
  saveSetting,
  sessionGet,
  sessionSet,
  toggleBlueprint
} from '@utils';

import styles from './styles.css';

/**
 * Get the favorite setups.
 *
 * @return {Array} The favorite setups.
 */
const getFavoriteSetups = () => {
  const faves = getSetting('favorite-setups.setups', []);

  if (! faves || ! Array.isArray(faves) || ! faves.length) {
    return [];
  }

  // remove any that are just null.
  return faves.filter(Boolean);
};

/**
 * Generate a name for the setup.
 *
 * @param {Object} setup The setup to generate a name for.
 *
 * @return {Promise<string>} The generated name.
 */
const getGeneratedName = async (setup) => {
  const response = await fetch('https://setup-namer.mouse.rip', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify([
      setup.bait_id,
      setup.base_id,
      setup.weapon_id,
      setup.trinket_id,
    ]),
  });

  return await response.json();
};

/**
 * Save a favorite setup.
 *
 * @param {Object}  setup            The setup to save.
 * @param {boolean} useGeneratedName Whether to use a generated name for the setup.
 *
 * @return {Object} The saved setup.
 */
const saveFavoriteSetup = async (setup, useGeneratedName = true) => {
  let setups = getFavoriteSetups();

  if (! setups.length) {
    setups = [];
  }

  const normalizedSetup = normalizeSetup(setup);

  if (useGeneratedName) {
    const setupNameData = await getGeneratedName(normalizeSetup);

    if (setupNameData.name) {
      normalizedSetup.name = setupNameData.name;
    }
  } else {
    normalizedSetup.name = user.environment_name;
  }

  if (setup.id) {
    normalizedSetup.id = setup.id;
    // replace the setup in the list.
    const index = setups.findIndex((s) => s?.id && (s.id === setup.id));
    if (-1 === index) {
      setups.push(normalizedSetup);
    } else {
      setups[index] = normalizedSetup;
    }
  } else {
    try {
      setups.push(normalizedSetup);
    } catch {
      setups = [normalizedSetup];
    }
  }

  saveSetting('favorite-setups.setups', setups);

  return normalizedSetup;
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
    power_type: user?.trap_power_type_name.toLowerCase(),
    location: getCurrentLocation(),
  });
};

let itemThumbs;
const addImage = async (type, id, appendTo) => {
  const wrapper = makeElement('div', 'campPage-trap-itemBrowser-favorite-item');
  wrapper.setAttribute('data-item-id', id);
  wrapper.setAttribute('data-item-type', type);

  wrapper.setAttribute('title', `Click to change ${type}`);

  const item = makeElement('div', ['campPage-trap-itemBrowser-favorite-item-image']);

  if (! itemThumbs) {
    itemThumbs = await getData('item-thumbnails');
  }

  item.style.backgroundImage = `url(${itemThumbs.find((thumb) => thumb.id == id)?.thumb || ''})`; // eslint-disable-line eqeqeq

  makeElement('div', 'campPage-trap-itemBrowser-favorite-item-frame', '', item);

  wrapper.append(item);
  appendTo.append(wrapper);
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
    'Uber Stale': 1,
  };

  return data[textValue];
};

const getPowerTypeId = (powerType) => {
  const data = {
    arcane: 'arcn',
    draconic: 'drcnc',
    forgotten: 'frgttn',
    hydro: 'hdr',
    law: 'law',
    parental: 'prntl',
    physical: 'phscl',
    rift: 'rift',
    shadow: 'shdw',
    tactical: 'tctcl',
  };

  return data[powerType] || powerType;
};

const makeImagePicker = async (setupId, type, currentId, callback) => {
  let components;
  const cached = sessionGet('mh-improved-favorite-setups-components');
  if (cached) {
    components = cached;
  } else {
    const response = await doRequest('managers/ajax/users/gettrapcomponents.php');

    components = response?.components || [];

    // re-sort the items by item name.
    components.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }

      if (a.name > b.name) {
        return 1;
      }

      return 0;
    });

    sessionSet('mh-improved-favorite-setups-components', components);
  }

  const items = components.filter((item) => item.classification === type);

  let content = '<div class="mh-improved-favorite-setups-component-picker-popup">';
  content += '<div class="mh-improved-favorite-setups-component-picker-popup-body">';
  content += '<div class="mh-improved-favorite-setups-component-picker-popup-search">';
  content += '<input type="text" placeholder="Search" id="mh-improved-favorite-setups-component-picker-popup-search-input" />';
  content += '<div class="mh-improved-favorites-setups-component-picker-popup-use-current mousehuntActionButton" title="Use current item"><span>Use currently armed item</span></div>';
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
    content += `  <a href="#" class="campPage-trap-itemBrowser-item-armButton save-button" data-item-id="${item.item_id}" data-item-classification="${type}" data-item-image="${item.thumbnail}" data-the-power-type="${item.power_type_image_name}">Use</a>`;
    content += ' </div>';
    content += ' <div class="campPage-trap-itemBrowser-item-content">';
    content += ` <div class="campPage-trap-itemBrowser-item-name">${item.name}</div>`;
    if ('bait' === type || 'trinket' === type) {
      content += `<div class="campPage-trap-itemBrowser-item-quantity"><span class="quantity">${Number.parseInt(item.quantity).toLocaleString()}</span><span class="label">Quantity</span></div>`;
    }

    if (item.power_type) {
      content += `<div class="campPage-trap-itemBrowser-item-powerType ${item.power_type}"></div>`;
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

  // popup.setIsModal(true);
  popup.show();

  const saveButtons = document.querySelectorAll('.campPage-trap-itemBrowser-item-armButton.save-button');
  saveButtons.forEach((saveButton) => {
    saveButton.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      callback(
        saveButton.getAttribute('data-item-id'),
        saveButton.getAttribute('data-item-classification'),
        saveButton.getAttribute('data-item-image'),
        saveButton.getAttribute('data-the-power-type')
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

  const useCurrentItemButton = document.querySelector('.mh-improved-favorites-setups-component-picker-popup-use-current');
  useCurrentItemButton.addEventListener('click', () => {
    const item = document.querySelector(`.campPage-trap-itemBrowser-item[data-item-id="${user[`${type}_item_id`]}"]`);
    if (! item) {
      return;
    }

    const saveButton = item.querySelector('.campPage-trap-itemBrowser-item-armButton.save-button');
    if (! saveButton) {
      return;
    }

    callback(
      saveButton.getAttribute('data-item-id'),
      saveButton.getAttribute('data-item-classification'),
      saveButton.getAttribute('data-item-image'),
      saveButton.getAttribute('data-the-power-type')
    );
    popup.hide();
  });
};

const armItem = async (items) => {
  return new Promise((resolve, reject) => {
    items.forEach(({ id, type }) => {
      hg.utils.TrapControl.armItem(id, type);
    });

    hg.utils.TrapControl.go(resolve, reject);
  });
};

const makeBlueprintRow = async (setup, isCurrent = false) => {
  if (! setup) {
    return;
  }

  const setupContainer = makeElement('div', ['row']);

  const controls = makeElement('div', ['controls']);
  makeElement('div', ['label'], setup?.name || '', controls);

  let hasHighlighted = false;
  const buttonWrapper = makeElement('div', ['button-wrapper']);
  if (isCurrent) {
    buttonWrapper.append(makeButton({
      text: 'Save',
      className: ['save', 'lightBlue'],
      callback: async () => {
        // Save the current setup, using the current location as the name.
        let currentSetup = getCurrentSetup();

        // if the setup already exists, then just alert the user.
        const setups = getFavoriteSetups();

        if (setups.length) {
          // check if the setup has a matching bait, base, weapon, and trinket.
          const existingSetup = setups.find((s) => {
            return s?.bait_id === currentSetup.bait_id &&
              s?.base_id === currentSetup.base_id &&
              s?.weapon_id === currentSetup.weapon_id &&
              s?.trinket_id === currentSetup.trinket_id;
          });

          if (existingSetup && ! hasHighlighted) {
            // flash the row.
            const rows = document.querySelectorAll(`.mh-improved-favorite-setups-blueprint-container .row[data-setup-id="${existingSetup.id}"]`);
            rows.forEach((row) => {
              row.classList.add('flash');
              setTimeout(() => {
                row.classList.remove('flash');
              }, 1000);
            });

            hasHighlighted = true;
            // allow clicking save a second time to bypass the highlight for 2 seconds.
            setTimeout(() => {
              hasHighlighted = false;
            }, 2000);

            return;
          }
        }

        // Generate a random name for the setup.
        currentSetup.id = Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);

        currentSetup = await saveFavoriteSetup(currentSetup, false);

        // append the new setup to the list.
        const setupRow = await makeBlueprintRow(currentSetup);
        setupRow.setAttribute('data-setup-id', currentSetup.id);

        const body = document.querySelector('.mh-improved-favorite-setups-blueprint-container .content');
        body.append(setupRow);

        updateFavoriteSetupName();
      }
    }));
  } else {
    const armButton = makeButton({
      text: 'Arm',
      className: ['arm'],
      callback: async () => {
        armButton.classList.add('loading');

        // Arm the setup.
        const setupId = setupContainer.getAttribute('data-setup-id');
        debuglog('favorite-setups', `Arming setup ${setupId}`);

        // get the setup.
        const setups = getFavoriteSetups();
        if (! setups.length) {
          return;
        }

        if (! setupId) {
          return;
        }

        const index = setups.findIndex((s) => s?.id && (s.id === setupId));

        const thisSetup = setups[index];
        if (! thisSetup) {
          return;
        }

        const toArm = [];

        // eslint-disable-next-line eqeqeq
        if (thisSetup.base_id && thisSetup.base_id != user.base_item_id) {
          toArm.push({ id: thisSetup.base_id, type: 'base' });
        }

        // eslint-disable-next-line eqeqeq
        if (thisSetup.weapon_id && thisSetup.weapon_id != user.weapon_item_id) {
          toArm.push({ id: thisSetup.weapon_id, type: 'weapon' });
        }

        // eslint-disable-next-line eqeqeq
        if (thisSetup.trinket_id && thisSetup.trinket_id != user.trinket_item_id) {
          toArm.push({ id: thisSetup.trinket_id, type: 'trinket' });
        }

        // eslint-disable-next-line eqeqeq
        if (thisSetup.bait_id && thisSetup.bait_id != user.bait_item_id) {
          toArm.push({ id: thisSetup.bait_id, type: 'bait' });
        }

        if (toArm.length) {
          await armItem(toArm);
        }

        armButton.classList.remove('loading');

        updateFavoriteSetupName();
      }
    });

    buttonWrapper.append(armButton);

    let editClickables = [];
    buttonWrapper.append(makeButton({
      text: 'Edit',
      className: ['edit-setup'],
      callback: () => {
        const setupId = setupContainer.getAttribute('data-setup-id');
        debuglog('favorite-setups', `Editing setup ${setupId}`);

        setupContainer.classList.add('editing');

        // Update the setup title to be an input.
        const title = setupContainer.querySelector('.label');

        const randomTitleButton = makeElement('a', 'random-title');
        randomTitleButton.setAttribute('title', 'Generate a random name for this setup');

        randomTitleButton.addEventListener('click', async (e) => {
          e.preventDefault();

          e.target.classList.add('loading');

          const setupNameData = await getGeneratedName(setup);

          if (setupNameData.name) {
            title.querySelector('input').value = setupNameData.name;
          }

          e.target.classList.remove('loading');
        });

        const titleInput = document.createElement('input');
        titleInput.value = title.textContent;
        title.textContent = '';
        title.append(titleInput);

        title.prepend(randomTitleButton);

        const powerTypeInput = makeElement('input', ['hidden', 'power-type-input']);
        powerTypeInput.setAttribute('data-the-power-type', setup.power_type);
        title.append(powerTypeInput);

        // Update the setup images to be clickable.
        const images = setupContainer.querySelectorAll('.campPage-trap-itemBrowser-favorite-item');
        images.forEach((image) => {
          image.classList.add('clickable');
          const eventListenerClickable = image.addEventListener('click', async () => {
            image.classList.add('loading');

            // Handle image click
            const itemType = image.getAttribute('data-item-type');
            const itemId = image.getAttribute('data-item-id');
            const imageDisplay = image.querySelector('.campPage-trap-itemBrowser-favorite-item-image');
            await makeImagePicker(setupId, itemType, itemId, (newItemId, newItemType, newItemImageUrl, newItemPowerType) => {
              if (itemType !== newItemType) {
                return;
              }

              if (itemId == newItemId) { // eslint-disable-line eqeqeq
                return;
              }

              image.setAttribute('data-new-item-id', newItemId);
              image.setAttribute('data-new-item-image', newItemImageUrl);
              image.setAttribute('data-old-image-url', imageDisplay.style.backgroundImage);

              if (newItemPowerType && 'undefined' !== newItemPowerType) {
                const ptInput = setupContainer.querySelector('.power-type-input');
                ptInput.setAttribute('data-power-type', newItemPowerType);
              }

              imageDisplay.style.backgroundImage = `url(${newItemImageUrl})`;
            });

            image.classList.remove('loading');
          });

          editClickables.push({ image, event: eventListenerClickable });
        });

        const existing = setupContainer.querySelector('.move-buttons');
        if (existing) {
          existing.remove();
        }

        // Also add move up and move down buttons.
        const moveUpButton = makeElement('a', ['move-up']);
        moveUpButton.addEventListener('click', (event) => {
          const previous = event.target.closest('.row').previousElementSibling;
          if (previous) {
            const setups = getFavoriteSetups();
            if (! setups.length) {
              return;
            }

            // Swap the setups.
            const index = setups.findIndex((s) => s?.id && (s.id === setupId));
            const previousIndex = setups.findIndex((s) => s?.id === previous.getAttribute('data-setup-id'));

            const temp = setups[index];
            setups[index] = setups[previousIndex];
            setups[previousIndex] = temp;

            saveSetting('favorite-setups.setups', setups);

            // move the row up.
            previous.before(setupContainer);
          }
        });

        const moveDownButton = makeElement('a', ['move-down']);
        moveDownButton.addEventListener('click', (event) => {
          // Get the element after this one.
          const next = event.target.closest('.row').nextElementSibling;
          if (next) {
            // move the setup down and resave the setups.
            const setups = getFavoriteSetups();
            if (! setups.length) {
              return;
            }

            // Swap the setups.
            const index = setups.findIndex((s) => s?.id && (s.id === setupId));
            const nextIndex = setups.findIndex((s) => s?.id && (s.id === next.getAttribute('data-setup-id')));

            const temp = setups[index];
            setups[index] = setups[nextIndex];
            setups[nextIndex] = temp;

            saveSetting('favorite-setups.setups', setups);

            next.after(setupContainer);
          }
        });

        const moveButtons = makeElement('div', ['move-buttons']);
        moveButtons.append(moveUpButton);
        moveButtons.append(moveDownButton);

        controls.append(moveButtons);
      }
    }));

    const stopEditing = () => {
      // Remove the event listeners from the images.
      editClickables.forEach(({ image, event }) => {
        image.removeEventListener('click', event);
        image.classList.remove('clickable');
      });

      editClickables = [];
    };

    buttonWrapper.append(makeButton({
      text: 'Save',
      className: ['save-setup'],
      callback: () => {
        const setupId = setupContainer.getAttribute('data-setup-id');
        debuglog('favorite-setups', `Saving setup ${setupId}`);

        setupContainer.classList.remove('editing');
        // When save is clicked, save the changes.

        const newSetup = setup;

        const title = setupContainer.querySelector('.label');
        const titleInput = title.querySelector('input');
        setup.name = titleInput.value;

        const powerTypeInput = setupContainer.querySelector('.power-type-input');
        if (powerTypeInput) {
          const lastPowerType = setup.power_type;
          const newPowerType = powerTypeInput.getAttribute('data-the-power-type');

          if (newPowerType && lastPowerType !== newPowerType) {
            setup.power_type = newPowerType;

            const powerTypeImage = setupContainer.querySelector('.campPage-trap-itemBrowser-item-powerType');
            if (powerTypeImage) {
              const lastPowerTypeClass = lastPowerType ? getPowerTypeId(lastPowerType) : 'hidden';
              const newPowerTypeClass = newPowerType ? getPowerTypeId(newPowerType) : 'hidden';

              powerTypeImage.classList.remove(lastPowerTypeClass);
              powerTypeImage.classList.add(newPowerTypeClass);
              powerTypeImage.classList.remove('hidden');
            }
          }
        }

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

        let setups = getFavoriteSetups();
        if (! setups.length) {
          setups = [];
        }

        const index = setups.findIndex((s) => s?.id && (s.id === setupId));

        // replace the setup in the list.
        setups[index] = newSetup;
        saveSetting('favorite-setups.setups', setups);

        // Update the setup title to be a div.
        title.textContent = newSetup.name;
        titleInput.remove();

        updateFavoriteSetupName();

        stopEditing();
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

        stopEditing();
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
        let setups = getFavoriteSetups();
        if (! setups.length) {
          setups = [];
        }

        const index = setups.findIndex((s) => s?.id && (s.id === setupId));
        setups.splice(index, 1);
        saveSetting('favorite-setups.setups', setups);

        // remove the setup from the list.
        setupContainer.remove();
      }
    }));
  }

  controls.append(buttonWrapper);
  setupContainer.append(controls);

  const powerTypeId = getPowerTypeId(setup?.power_type);
  const powertype = makeElement('div', ['campPage-trap-itemBrowser-item-powerType', powerTypeId]);
  if (! powerTypeId) {
    powertype.classList.add('hidden');
  }

  setupContainer.append(powertype);

  await addImage('bait', setup.bait_id, setupContainer);
  await addImage('base', setup.base_id, setupContainer);
  await addImage('weapon', setup.weapon_id, setupContainer);
  await addImage('trinket', setup.trinket_id, setupContainer);

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

  container.append(header);

  const body = makeElement('div', ['content']);

  const currentSetupRow = await makeBlueprintRow(getCurrentSetup(), true);
  currentSetupRow.classList.add('current-setup');
  body.append(currentSetupRow);

  const setups = getFavoriteSetups();
  if (setups.length) {
    const locationFavorites = [];

    for (const setup of setups) {
      if (! setup || ! setup.id) {
        continue;
      }

      if (setup.location && setup.location === getCurrentLocation()) {
        locationFavorites.push(setup);
      }
    }

    if (locationFavorites.length) {
      const locationWrapper = makeElement('div', ['location-favorites']);

      for (const setup of locationFavorites) {
        if (! setup || ! setup.id) {
          continue;
        }

        const setupContainer = await makeBlueprintRow(setup);
        setupContainer.setAttribute('data-setup-id', setup.id);
        setupContainer.classList.add('location-favorite');

        locationWrapper.append(setupContainer);
      }

      body.append(locationWrapper);
    }

    for (const setup of setups) {
      if (! setup || ! setup.id) {
        continue;
      }

      const setupContainer = await makeBlueprintRow(setup);
      setupContainer.setAttribute('data-setup-id', setup.id);

      body.append(setupContainer);
    }
  }

  container.append(body);

  return container;
};

const getNameOfCurrentSetup = () => {
  const setups = getFavoriteSetups();

  if (! setups.length) {
    return '';
  }

  // if we have a setup with the same IDs, then return the name of that setup.
  const currentSetup = getCurrentSetup();

  const setup = setups.find((s) => {
    return s?.bait_id === currentSetup?.bait_id &&
      s?.base_id === currentSetup?.base_id &&
      s?.weapon_id === currentSetup?.weapon_id &&
      s?.trinket_id === currentSetup?.trinket_id;
  });

  if (setup && setup.name) {
    return setup.name;
  }

  return '';
};

const updateFavoriteSetupName = () => {
  const label = document.querySelector('.mh-improved-favorite-setups-button-label');
  if (! label) {
    return;
  }

  label.innerHTML = getNameOfCurrentSetup() || '';
};

const addFavoriteSetupsButton = () => {
  if ('camp' !== getCurrentPage()) {
    return;
  }

  const existingButton = document.querySelector('.mh-improved-favorite-setups-button');
  if (existingButton) {
    return;
  }

  const appendTo = document.querySelector('.trapSelectorView__trapStatSummaryContainer');
  if (! appendTo) {
    return;
  }

  const button = makeElement('a', ['mh-improved-favorite-setups-button']);
  makeElement('div', ['mh-improved-favorite-setups-button-text'], 'Favorite Setups', button);
  const label = makeElement('div', ['mh-improved-favorite-setups-button-label']);

  label.innerHTML = getNameOfCurrentSetup();
  button.append(label);

  button.addEventListener('click', toggleFavoriteSetups);

  // Append as a sibling to the existing button.
  appendTo.append(button);
};

const toggleFavoriteSetups = async () => {
  const content = await makeBlueprintContainer();
  toggleBlueprint('favorite-setups', content);
};

const addIcon = () => {
  addIconToMenu({
    id: 'favorite-setups',
    classname: 'mousehunt-improved-favorite-setups-icon',
    title: 'Favorite Setups',
    action: toggleFavoriteSetups,
    position: 'prepend',
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles(styles, 'favorite-setups');

  addFavoriteSetupsButton();

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

  if (getSetting('experiments.favorite-setups-toggle', false)) {
    addIcon();
  }

  onEvent('mh-improved-toggle-favorite-setups', toggleFavoriteSetups);
};

/**
 * Initialize the module.
 */
export default {
  id: 'favorite-setups',
  name: 'Favorite Setups',
  type: 'feature',
  default: false,
  description: 'Save your favorite setups and arm them with a single click.',
  load: init,
};
