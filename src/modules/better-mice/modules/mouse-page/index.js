import {
  doRequest,
  getCurrentPage,
  getCurrentSubtab,
  getCurrentTab,
  makeElement,
  onNavigation,
  sessionGet,
  sessionSet,
  waitForElement
} from '@utils';

/**
 * Make the King's Crowns tab.
 *
 * @return {Element} The King's Crowns tab.
 */
const makeKingsCrownsTab = () => {
  const tabContainer = document.querySelector('.mousehuntHud-page-tabHeader-container');
  if (! tabContainer) {
    return false;
  }

  const existingTab = document.querySelector('.mousehuntHud-page-tabHeader.kings-crowns-tab');
  if (existingTab) {
    return existingTab;
  }

  const kingsCrownsTab = makeElement('a', ['mousehuntHud-page-tabHeader', 'groups', 'kings-crowns-tab']);
  makeElement('span', '', 'King\'s Crowns', kingsCrownsTab);

  kingsCrownsTab.setAttribute('data-tab', 'kings_crowns');
  kingsCrownsTab.setAttribute('data-legacy-mode', '');
  kingsCrownsTab.setAttribute('onclick', 'hg.utils.PageUtil.onclickPageTabHandler(this); return false;');

  tabContainer.append(kingsCrownsTab);

  return kingsCrownsTab;
};

/**
 * Make the King's Crowns tab content.
 */
const makeKingsCrownsTabContentContent = () => {
  const existingTabContent = document.querySelector('.mousehuntHud-page-tabContent.kings_crowns');
  if (existingTabContent) {
    return;
  }

  const tabContentContainer = document.querySelector('.mousehuntHud-page-tabContentContainer');
  if (! tabContentContainer) {
    return;
  }

  const tabContent = makeElement('div', ['mousehuntHud-page-tabContent', 'kings_crowns']);
  tabContent.setAttribute('data-tab', 'kings_crowns');
  tabContent.setAttribute('data-template-file', 'AdversariesPage');

  makeElement('div', 'mousehuntHud-page-tabContent-loading', '', tabContent);
  const subTabContent = makeElement('div', ['mousehuntHud-page-subTabContent', 'all', 'active']);
  subTabContent.setAttribute('data-tab', 'all');
  subTabContent.setAttribute('data-template-file', 'AdversariesPage');
  subTabContent.setAttribute('data-template', 'subtab');
  subTabContent.setAttribute('data-initialized', '');
  subTabContent.setAttribute('data-user-id', '');

  makeElement('div', 'mouseCrownsView', '', subTabContent);

  tabContent.append(subTabContent);

  tabContentContainer.append(tabContent);
};

/**
 * Create a mouse crown section.
 *
 * @param {string} type      The type of the section.
 * @param {Array}  mice      The mice to display.
 * @param {string} header    The header for the section.
 * @param {string} subheader The subheader for the section.
 *
 * @return {Element} The mouse crown section.
 */
const makeMouseCrownSection = (type, mice, header = false, subheader = false) => {
  const wrapper = makeElement('div', ['kings-crown-section', 'mouseCrownsView-group', type]);

  if (header) {
    const headerDiv = makeElement('div', 'mouseCrownsView-group-header');
    makeElement('div', ['mouseCrownsView-crown', type], '', headerDiv);

    const name = makeElement('div', 'mouseCrownsView-group-header-name');
    makeElement('b', false, header, headerDiv);

    if (subheader) {
      makeElement('div', 'mouseCrownsView-group-header-subtitle', subheader, name);
    }

    headerDiv.append(name);

    wrapper.append(headerDiv);
  }

  const list = makeElement('div', 'mouseCrownsView-group-mice');
  mice.forEach((mouse) => {
    if (! mouse.id) {
      return;
    }

    const mouseWrapper = makeElement('div', 'mouseCrownsView-group-mouse');
    mouseWrapper.setAttribute('data-mouse-id', mouse.id);
    mouseWrapper.setAttribute('data-mouse-type', mouse.type);
    mouseWrapper.setAttribute('data-mouse-large', mouse.large);
    mouseWrapper.setAttribute('onclick', 'hg.views.MouseCrownsView.showMouseImage(this); return false;');

    if (mouse.landscape) {
      mouseWrapper.classList.add('landscape');
    }

    const innerWrapper = makeElement('div', 'mouseCrownsView-group-mouse-padding');
    const image = makeElement('div', ['mouseCrownsView-group-mouse-image', mouse.type]);
    image.setAttribute('data-image', mouse.large || mouse.image);
    image.setAttribute('data-loader', 'mouse');
    image.setAttribute('style', `background-image: url("${mouse.image}");`);

    innerWrapper.append(image);

    makeElement('div', 'mouseCrownsView-group-mouse-catches', mouse.num_catches, innerWrapper);

    const label = makeElement('div', 'mouseCrownsView-group-mouse-label');
    const nameWrapper = makeElement('span', false, '');
    makeElement('div', 'mouseCrownsView-group-mouse-name', mouse.name, nameWrapper);
    label.append(nameWrapper);

    innerWrapper.append(label);

    const favoriteButton = makeElement('div', 'mouseCrownsView-group-mouse-favouriteButton');
    if (mouse.is_favourite) {
      favoriteButton.classList.add('active');
    }
    favoriteButton.setAttribute('data-mouse-id', mouse.id);
    favoriteButton.setAttribute('onclick', 'hg.views.MouseCrownsView.toggleFavouriteHandler(event); return false;');

    innerWrapper.append(favoriteButton);

    mouseWrapper.append(innerWrapper);

    list.append(mouseWrapper);
  });

  wrapper.append(list);

  return wrapper;
};

/**
 * Make the King's Crowns tab content.
 */
const makeKingsCrownsTabContent = async () => {
  makeKingsCrownsTabContentContent();

  let crowns = [];
  const cachedCrowns = sessionGet('kings-crowns');
  const cachedCrownsTime = sessionGet('kings-crowns-time');
  if (
    cachedCrowns &&
    cachedCrownsTime &&
    (Date.now() - cachedCrownsTime) < 300000
  ) {
    crowns = JSON.parse(cachedCrowns);
  } else {
    const crownsReq = await doRequest('managers/ajax/pages/page.php', {
      page_class: 'HunterProfile',
      'page_arguments[tab]': 'kings_crowns',
      'page_arguments[sub_tab]': false,
    });

    crowns = crownsReq?.page?.tabs?.kings_crowns?.subtabs[0]?.mouse_crowns || [];
    if (crowns.length <= 0) {
      return;
    }
    sessionSet('kings-crowns', crowns);
    sessionSet('kings-crownsTime', Date.now());
  }

  const tabInnerContent = document.querySelector('.mousehuntHud-page-tabContent.kings_crowns');
  if (! tabInnerContent) {
    return;
  }

  if (crowns.favourite_mice_count > 0) {
    const favorites = makeMouseCrownSection('favorites', crowns.favourite_mice);
    const existingFavorites = tabInnerContent.querySelector('.mouseCrownsView-group.favorites');
    if (existingFavorites) {
      existingFavorites.replaceWith(favorites);
    } else {
      tabInnerContent.append(favorites);
    }
  }

  crowns.badge_groups.forEach((group) => {
    if (group.mice.length === 0) {
      return;
    }

    group.name = group?.name?.length > 0 ? group.name : 'No';
    group.catches = group?.catches?.length > 0 ? group.catches : '0';

    const section = makeMouseCrownSection(group.type, group.mice, `${group.name} Crown (${group.count})`, `Earned at ${group.catches} catches`);

    const existingSection = tabInnerContent.querySelector(`.mouseCrownsView-group.${group.type}`);
    if (existingSection) {
      existingSection.replaceWith(section);
    } else {
      tabInnerContent.append(section);
    }
  });
};

/**
 * Add the King's Crowns to the mice page.
 */
const addKingsCrownsToMicePage = async () => {
  makeKingsCrownsTab();
  makeKingsCrownsTabContent();
};

/**
 * Parse the imperial weight.
 *
 * @param {Element} weightText The weight text element.
 *
 * @return {number} The weight in ounces.
 */
const parseImperialWeight = (weightText) => {
  // Imperial.
  const lbsSplit = weightText.innerText.split('lb.');
  const lbs = lbsSplit.length > 1 ? lbsSplit[0] : 0;

  const ozSplit = weightText.innerText.split('oz.');
  const oz = ozSplit.length > 1 ? ozSplit[0] : 0;

  return (Number.parseInt(lbs) * 16) + Number.parseInt(oz);
};

/**
 * Get the value of a row.
 *
 * @param {Element} row  The row to get the value for.
 * @param {string}  type The type of value to get.
 *
 * @return {number} The value of the row.
 */
const getSetRowValue = (row, type) => {
  let value = 0;
  value = row.getAttribute(`data-sort-value-${type}`);
  if (value) {
    return Number.parseInt(value);
  }

  const valueText = row.querySelector(`${getSelectorPrefix()} .mouseListView-categoryContent-subgroup-mouse-stats.${type}`);

  // for weight, we need to parse the text to get the number
  if (type === 'average_weight' || type === 'heaviest_catch') {
    // Check if it contains 'lb' or 'oz', then we can parse it as imperial. if it contains 'kg', then we can parse it as metric.
    if (valueText?.innerText && (valueText.innerText.includes('lb') || valueText.innerText.includes('oz'))) {
      value = parseImperialWeight(valueText);
    } else if (valueText?.innerText && valueText.innerText.includes('kg')) {
      // If we have kilograms, then we can just remove the kg and parse it as a number.
      value = valueText?.innerText.replace('kg.', '');
    } else {
      value = 0;
    }
  } else {
    value = valueText.innerText ? valueText?.innerText.replaceAll(',', '') || 0 : 0;
  }

  row.setAttribute(`data-sort-value-${type}`, value);

  return Number.parseInt(value);
};

/**
 * Sort the stats.
 *
 * @param {string}  type    The type of stat to sort by.
 * @param {boolean} reverse If the sort should be reversed.
 */
const sortStats = (type, reverse = false) => {
  reverse = ! reverse;

  let rows = document.querySelectorAll(`${getSelectorPrefix()} .active  .mouseListView-categoryContent-subgroup-mouse:not(:first-child)`);
  if (! rows.length) {
    return;
  }

  const headerRow = document.querySelector(`${getSelectorPrefix()} .active  .mouseListView-categoryContent-subgroup-mouse:first-child`);
  if (! headerRow) {
    return;
  }

  // loop through the rows and add the data-attribute values to each row if they don't already exist
  rows.forEach((row) => {
    getSetRowValue(row, type);
  });

  // sort the rows
  rows = [...rows].sort((a, b) => {
    const aVal = getSetRowValue(a, type);
    const bVal = getSetRowValue(b, type);

    // sort by value. If the values are the same, then sort by name
    if (aVal === bVal || type === 'name') {
      const aNameEl = a.querySelector('.mouseListView-categoryContent-subgroup-mouse-stats.name');
      if (! aNameEl) {
        return 0;
      }

      const bNameEl = b.querySelector('.mouseListView-categoryContent-subgroup-mouse-stats.name');
      if (! bNameEl) {
        return 0;
      }

      const aName = aNameEl.innerText;
      const bName = bNameEl.innerText;
      if (aName === bName) {
        return 0;
      }

      return aName > bName ? 1 : -1;
    }

    return aVal > bVal ? 1 : -1;
  });

  // if we are sorting in reverse, then we need to reverse the array
  if (reverse) {
    rows = rows.reverse();
  }

  // reorder the rows
  rows.forEach((row) => {
    row.parentNode.append(row);
  });
};

/**
 * Add a sort button to the elements.
 *
 * @param {NodeList} elements The elements to add the sort button to.
 * @param {string}   type     The type of sort button to add.
 */
const addSortButton = (elements, type) => {
  elements.forEach((el) => {
    const sortButton = makeElement('div', ['sort-button', 'unsorted'], '');
    el.addEventListener('click', () => {
      const otherSortButtons = el.parentNode.querySelectorAll('.sort-button');
      otherSortButtons.forEach((button) => {
        if (button !== sortButton) {
          button.classList.remove('reverse');
          button.classList.add('unsorted');
        }
      });

      // if the is-reverse data attribute is set, then we sort low to high otherwise we sort high to low. We don't want to add the reverse class if the unsorted class is already set, we just want to remove the unsorted class
      if (sortButton.classList.contains('unsorted')) {
        sortButton.classList.remove('unsorted');
        sortStats(type);
        return;
      }

      if (sortButton.classList.contains('reverse')) {
        sortButton.classList.remove('reverse');
        sortStats(type);
        return;
      }

      sortButton.classList.add('reverse');
      sortStats(type, true);
    });

    el.append(sortButton);
  });
};

/**
 * Get the selector prefix based on the current tab and subtab.
 *
 * @return {string} The selector prefix.
 */
const getSelectorPrefix = () => {
  const currentTab = getCurrentTab();
  let currentSubtab = getCurrentSubtab();
  if (currentTab === currentSubtab) {
    currentSubtab = false;
  }

  return `.mousehuntHud-page-subTabContent.active${currentSubtab ? `.${currentSubtab}` : ''}`;
};

/**
 * Add sorting to the category.
 *
 * @param {string} cat     The category to add sorting to.
 * @param {number} retries The number of retries.
 */
const addSortingToCat = async (cat, retries = 0) => {
  const cats = [
    'name',
    'catches',
    'misses',
    'average_weight',
    'heaviest_catch',
  ];

  const selector = `${getSelectorPrefix()} .mouseListView-categoryContent-category[data-category="${cat}"]`;

  await waitForElement(selector);

  const category = document.querySelector(selector);
  // if the category has the loading class, then we wait for the content to load
  if (! category || (category && category.classList.contains('loading'))) {
    if (retries > 10) {
      return;
    }

    setTimeout(() => addSortingToCat(cat, retries + 1), 300);
    return;
  }

  if (category.getAttribute('data-added-sorting')) {
    return;
  }

  cats.forEach((mCat) => {
    const els = category.querySelectorAll(`${getSelectorPrefix()} .mouseListView-categoryContent-category.all.active .mouseListView-categoryContent-subgroup-mouse.header .mouseListView-categoryContent-subgroup-mouse-stats.${mCat}`);
    if (els.length) {
      addSortButton(els, mCat);
    }
  });

  category.setAttribute('data-added-sorting', true);

  // Get all the rows and add the crown classes to them.
  const rows = category.querySelectorAll(`${getSelectorPrefix()} .mouseListView-categoryContent-subgroup-mouse:not(:first-child)`);
  if (! rows.length) {
    return;
  }

  rows.forEach((row) => {
    const catches = row.querySelector(`${getSelectorPrefix()} .mouseListView-categoryContent-subgroup-mouse-stats.catches`);
    if (! catches) {
      return;
    }

    const value = catches.innerText ? catches.innerText.replaceAll(',', '') || 0 : 0;

    // set a crown class on the row.
    if (value >= 2500) {
      row.classList.add('crown', 'diamond');
    } else if (value >= 1000) {
      row.classList.add('crown', 'platinum');
    } else if (value >= 500) {
      row.classList.add('crown', 'gold');
    } else if (value >= 100) {
      row.classList.add('crown', 'silver');
    } else if (value >= 10) {
      row.classList.add('crown', 'bronze');
    }
  });
};

let _categoryClickHandler = null;

/**
 * Add click listeners to the sorting tabs.
 */
const addSortingTabClickListeners = () => {
  if (_categoryClickHandler) {
    return;
  }

  _categoryClickHandler = hg.views.MouseListView.categoryClickHandler;

  /**
   * The category click handler.
   *
   * @param {Element} el The element clicked.
   */
  hg.views.MouseListView.categoryClickHandler = (el) => {
    _categoryClickHandler(el);
    addSortingToCat(el.getAttribute('data-category'));
  };
};

/**
 * Click the current tab.
 */
const clickCurrentTab = async () => {
  const currentCategoryTab = await waitForElement('.mousehuntHud-page-tabContent.active .mousehuntHud-page-subTabContent.active .mouseListView-categoryContainer.active a');
  if (! currentCategoryTab) {
    return;
  }

  const category = currentCategoryTab.getAttribute('data-category');

  addSortingToCat(category);

  if ('your_stats' === getCurrentSubtab()) {
    const activeTab = await waitForElement('.mousehuntHud-page-subTabHeader.active[data-tab="your_stats"]');
    if (activeTab) {
      activeTab.click();
    }
  }
};

/**
 * Add sorting to the stats page.
 */
const addSortingToStatsPage = () => {
  addSortingTabClickListeners();
  setTimeout(clickCurrentTab, 250);
};

/**
 * Initialize the module.
 */
export default async () => {
  if ('adversaries' === getCurrentPage() && getCurrentTab() === 'kings_crowns') {
    addKingsCrownsToMicePage();

    const tab = document.querySelector('.mousehuntHud-page-tabHeader.kings-crowns-tab');
    if (tab && hg?.utils?.PageUtil?.onclickPageTabHandler) {
      hg.utils.PageUtil.onclickPageTabHandler(tab);
    }
  }

  onNavigation(addKingsCrownsToMicePage, {
    page: 'adversaries',
  });

  onNavigation(addSortingToStatsPage, {
    page: 'adversaries',
    tab: 'your_stats',
  });

  onNavigation(addSortingToStatsPage, {
    page: 'adversaries',
    tab: 'your_stats',
    anySubtab: true,
  });

  onNavigation(addSortingToStatsPage, {
    page: 'hunterprofile',
    tab: 'mice',
    anySubtab: true,
  });
};
