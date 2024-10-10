import {
  addStyles,
  doRequest,
  getSetting,
  makeElement,
  onRequest
} from '@utils';

import styles from './styles.css';

/**
 * Update the sidebar list from the mice effectiveness page.
 *
 * @param {Object} data The data from the request.
 *
 * @return {Promise} Results of the update.
 */
const updateSidebarListFromMiceEff = async (data) => {
  return await updateSidebarList(data, true);
};

/**
 * Update the sidebar list.
 *
 * @param {Object}  data          The data from the request.
 * @param {boolean} isFromMiceEff Whether the request is from the mice effectiveness page.
 *
 * @return {Promise} Results of the update.
 */
const updateSidebarList = async (data = null, isFromMiceEff = false) => {
  const sidebar = document.querySelector('.pageSidebarView .pageSidebarView-block');
  if (! sidebar) {
    return;
  }

  if (! data || ! isFromMiceEff) {
    data = await doRequest('managers/ajax/users/getmiceeffectiveness.php');
  }

  const groups = data?.effectiveness || {};

  const mice = Object.values(groups).reduce((acc, group) => {
    return [...acc, ...group.mice];
  }, []);

  const existingList = document.querySelector('.mh-improved-mice-sidebar-list');

  if (! mice) {
    if (existingList) {
      existingList.remove();
    }

    return;
  }

  const miceSidebar = makeElement('div', 'mh-improved-mice-sidebar');
  makeElement('h3', 'mh-improved-mice-sidebar-title', 'Available Mice', miceSidebar);

  const miceContainer = makeElement('div', 'mh-improved-mice-sidebar-list');
  mice.forEach((mouse) => {
    const mouseEl = makeElement('div', 'mh-improved-mice-sidebar-mouse');
    mouseEl.addEventListener('click', () => {
      hg.views.MouseView.show(mouse?.type);
    });

    const mouseImage = makeElement('div', 'mh-improved-mice-sidebar-mouse-image');
    mouseImage.style.backgroundImage = `url(${mouse?.thumb})`;
    mouseEl.append(mouseImage);

    makeElement('div', 'mh-improved-mice-sidebar-mouse-name', mouse.name, mouseEl);

    miceContainer.append(mouseEl);
  });

  if (existingList) {
    existingList.replaceWith(miceContainer);
    return;
  }

  miceSidebar.append(miceContainer);

  const mapSidebar = document.querySelector('.pageSidebarView-block .mh-improved-map-sidebar');
  if (mapSidebar) {
    mapSidebar.before(miceSidebar);
    return;
  }

  const existing = document.querySelector('.mh-improved-mice-sidebar');
  if (existing) {
    existing.replaceWith(miceSidebar);
    return;
  }

  sidebar.append(miceSidebar);
};

/**
 * Initialize the module.
 */
export default async () => {
  if (getSetting('no-sidebar', true)) {
    return;
  }

  addStyles(styles, 'better-mice-sidebar');

  updateSidebarList();
  onRequest('users/getmiceeffectiveness.php', updateSidebarListFromMiceEff, true);
  onRequest('users/changetrap.php', updateSidebarList, true);
};
