
const makeKingsCrownsTab = () => {
  // Add king's crowns tab;
  const tabContainer = document.querySelector('.mousehuntHud-page-tabHeader-container');
  if (!tabContainer) {
    return;
  }

  const existingTab = document.querySelector('.mousehuntHud-page-tabHeader.kings-crowns-tab');
  if (existingTab) {
    return;
  }

  const kingsCrownsTab = makeElement('a', ['mousehuntHud-page-tabHeader', 'groups', 'kings-crowns-tab']);
  makeElement('span', '', 'King\'s Crowns', kingsCrownsTab);

  kingsCrownsTab.setAttribute('data-tab', 'kings_crowns');
  kingsCrownsTab.setAttribute('data-legacy-mode', '');
  kingsCrownsTab.setAttribute('onclick', 'hg.utils.PageUtil.onclickPageTabHandler(this); return false;');

  tabContainer.appendChild(kingsCrownsTab);

  return kingsCrownsTab;
};

const makeKingsCrownsTabContentContent = () => {
  const tabContentContainer = document.querySelector('.mousehuntHud-page-tabContentContainer');
  if (!tabContentContainer) {
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

  tabContent.appendChild(subTabContent);

  tabContentContainer.appendChild(tabContent);
};

const makeMouseCrownSection = (type, mice, header = false, subheader = false) => {
  const wrapper = makeElement('div', ['mouseCrownsView-group', type]);

  if (header) {
    const headerDiv = makeElement('div', 'mouseCrownsView-group-header');
    makeElement('div', ['mouseCrownsView-crown', type], '', headerDiv);

    const name = makeElement('div', 'mouseCrownsView-group-header-name');
    makeElement('b', false, header, headerDiv);

    if (subheader) {
      makeElement('div', 'mouseCrownsView-group-header-subtitle', subheader, name);
    }

    headerDiv.appendChild(name);

    wrapper.appendChild(headerDiv);
  }

  const list = makeElement('div', 'mouseCrownsView-group-mice');
  mice.forEach((mouse) => {
    if (!mouse.id) {
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
    image.setAttribute('data-image', mouse.image);
    image.setAttribute('data-loader', 'mouse');
    image.setAttribute('style', `background-image: url("${mouse.image}");`);

    innerWrapper.appendChild(image);

    makeElement('div', 'mouseCrownsView-group-mouse-catches', mouse.num_catches, innerWrapper);

    const label = makeElement('div', 'mouseCrownsView-group-mouse-label');
    const nameWrapper = makeElement('span', false, '');
    makeElement('div', 'mouseCrownsView-group-mouse-name', mouse.name, nameWrapper);
    label.appendChild(nameWrapper);

    innerWrapper.appendChild(label);

    const favoriteButton = makeElement('div', 'mouseCrownsView-group-mouse-favouriteButton');
    if (mouse.is_favourite) {
      favoriteButton.classList.add('active');
    }
    favoriteButton.setAttribute('data-mouse-id', mouse.id);
    favoriteButton.setAttribute('onclick', 'hg.views.MouseCrownsView.toggleFavouriteHandler(event); return false;');

    innerWrapper.appendChild(favoriteButton);

    mouseWrapper.appendChild(innerWrapper);

    list.appendChild(mouseWrapper);
  });

  wrapper.appendChild(list);

  return wrapper;
};

const makeKingsCrownsTabContent = async () => {
  makeKingsCrownsTabContentContent();

  let crowns = [];
  const cachedCrowns = localStorage.getItem('kingsCrowns');
  const cachedCrownsTime = localStorage.getItem('kingsCrownsTime');
  if (
    cachedCrowns &&
    cachedCrownsTime &&
    (Date.now() - cachedCrownsTime) < 300000
  ) {
    crowns = JSON.parse(cachedCrowns);
  } else {
    const crownsReq = await doRequest(
      'managers/ajax/pages/page.php',
      {
        page_class: 'HunterProfile',
        'page_arguments[tab]': 'kings_crowns',
        'page_arguments[sub_tab]': false
      }
    );

    crowns = crownsReq.page.tabs.kings_crowns.subtabs[0].mouse_crowns;
    localStorage.setItem('kingsCrowns', JSON.stringify(crowns));
    localStorage.setItem('kingsCrownsTime', Date.now());
  }

  const tabInnerContent = document.querySelector('.mousehuntHud-page-tabContent.kings_crowns');
  if (!tabInnerContent) {
    return;
  }

  const favorites = makeMouseCrownSection('favorites', crowns.favourite_mice);
  tabInnerContent.appendChild(favorites);

  crowns.badge_groups.forEach((group) => {
    const section = makeMouseCrownSection(group.type, group.mice, `${group.name} Crowns (${group.count})`, `Earned at ${group.catches} catches`);
    tabInnerContent.appendChild(section);
  });
};

const addKingsCrownsToMicePage = async () => {
  makeKingsCrownsTab();
  makeKingsCrownsTabContent();
};

export default () => {
  if (getCurrentTab() === 'kings_crowns') {
    addKingsCrownsToMicePage();

    const tab = document.querySelector('.mousehuntHud-page-tabHeader.kings-crowns-tab');
    hg.utils.PageUtil.onclickPageTabHandler(tab);
  }

  onNavigation(addKingsCrownsToMicePage, {
    page: 'adversaries',
  });
};
