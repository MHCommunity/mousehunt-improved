import {
  getCurrentPage,
  getSetting,
  onNavigation,
  onRequest,
  saveSetting,
  waitForElement
} from '@utils';

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
    input.setAttribute('data-1p-ignore', '');
  }

  reordered.setAttribute('data-reordered', 'true');
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

const addCampFriendsListener = () => {
  const button = document.querySelector('.campPage-trap-friendContainer-toggleFriendsButton');
  if (! button) {
    return;
  }

  button.removeEventListener('click', updateCampFriends);
  button.addEventListener('click', updateCampFriends);
};

const updateCampFriendsSetting = (environmentName, hidden) => {
  const hiddenEnvironments = getSetting('better-ui.camp-hidden-friends', {});
  if (hidden) {
    hiddenEnvironments[environmentName] = true;
  } else {
    delete hiddenEnvironments[environmentName];
  }

  saveSetting('better-ui.camp-hidden-friends', hiddenEnvironments);
};

const toggleEnvironment = (event) => {
  const title = event.target;
  const friends = title.parentNode.querySelectorAll('a');

  title.classList.toggle('friends-hidden');
  friends.forEach((friend) => {
    friend.classList.toggle('friends-hidden');
  });

  const name = title.getAttribute('data-environment-name');
  const hidden = title.classList.contains('friends-hidden');

  updateCampFriendsSetting(name, hidden);
};

const updateCampFriends = async () => {
  await waitForElement('.campPage-trap-friendContainer-environment');
  const environments = document.querySelectorAll('.campPage-trap-friendContainer-environment');
  if (! environments) {
    return;
  }

  const defaultHidden = getSetting('better-ui.camp-hidden-friends', {});

  environments.forEach((environment) => {
    const title = environment.querySelector('.campPage-trap-friendContainer-environment-title');
    const friends = environment.querySelectorAll('a');
    if (! title || ! friends) {
      return;
    }

    const environmentName = title.textContent.trim().toLowerCase().replaceAll(' ', '-');
    title.setAttribute('data-environment-name', environmentName);
    title.setAttribute('data-number-of-friends', friends.length);
    if (defaultHidden[environmentName]) {
      title.classList.add('friends-hidden');
      friends.forEach((friend) => {
        friend.classList.add('friends-hidden');
      });
    }

    title.removeEventListener('click', toggleEnvironment);
    title.addEventListener('click', toggleEnvironment);
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  onNavigation(reorderBlocks, {
    page: 'friends',
  });

  onNavigation(autofocusIdSearch, {
    page: 'friends',
    tab: 'requests',
    subtab: 'community',
  });

  onRequest('users/getfriendsonline.php', updateCampFriends);
  onNavigation(addCampFriendsListener, {
    page: 'camp',
  });
};
