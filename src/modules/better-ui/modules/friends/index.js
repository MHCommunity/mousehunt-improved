import { getCurrentPage, onNavigation } from '@utils';

/**
 * Reorder the blocks on the friends page.
 */
const reorderBlocks = () => {
  if ('friends' !== getCurrentPage()) {
    return;
  }

  const reordered = document.querySelector('.mousehuntHud-page-subTabContent.community');
  if (! reordered || reordered.getAttribute('data-reordered')) {
    return;
  }

  const blocks = document.querySelectorAll('.friendsPage-community-channel');
  if (! blocks || blocks.length < 3) {
    return;
  }

  // Move the third block to the top and make the input bigger.
  const block = blocks[2];
  const parent = block.parentNode;
  block.remove();
  parent.insertBefore(block, parent.firstChild);
  block.classList.add('friends-page-id-search');

  const input = block.querySelector('input');
  if (input) {
    // disable the 1password icon
    input.setAttribute('data-1p-ignore', 'true');
  }

  reordered.setAttribute('data-reordered', 'true');
};

const addSelect2Toggles = () => {
  const environmentToggle = document.querySelector('.friendsPage-list-filter[data-filter="environment_id"] .friendsPage-list-filter-label');
  if (environmentToggle) {
    environmentToggle.addEventListener('click', () => toggleSelect2('.friendsPage-environment-filter'));
  }

  const friendToggle = document.querySelector('.friendsPage-list-filter[data-filter="snuid"] .friendsPage-list-filter-label');
  if (friendToggle) {
    friendToggle.addEventListener('click', () => toggleSelect2('.active .friendsPage-list-search'));
  }
};

const toggleSelect2 = (className) => {
  const select2 = document.querySelector(`${className}.select2-container`);
  if (! select2) {
    return;
  }

  let original = document.querySelector(`${className}.select2-offscreen`);
  if (! original) {
    original = document.querySelector(`${className}.select2-onscreen-now`);
    if (! original) {
      return;
    }
  }

  const select2Hidden = select2.style.display === 'none';
  select2.style.display = select2Hidden ? '' : 'none';
  if (select2Hidden) {
    original.classList.add('select2-offscreen');
    original.classList.remove('select2-onscreen-now');
  } else {
    original.classList.remove('select2-offscreen');
    original.classList.add('select2-onscreen-now');
  }
};

/**
 * Autofocus the ID search input.
 */
const autofocusIdSearch = () => {
  const input = document.querySelector('.friendsPage-community-hunterIdForm-input');
  if (! input) {
    return;
  }

  input.focus();
};

/**
 * Initialize the module.
 */
export default async () => {
  onNavigation(reorderBlocks, {
    page: 'friends',
  });

  onNavigation(addSelect2Toggles, {
    page: 'friends',
    anyTab: true,
    anySubtab: true,
  });

  onNavigation(autofocusIdSearch, {
    page: 'friends',
    tab: 'requests',
    subtab: 'community',
  });
};
