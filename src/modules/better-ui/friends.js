const goToFriendsPageOnSearchSelect = () => {
  onRequest((req) => {
    // if we don't have the friends key and its not an array with one value, bail.
    if (! req.friends || ! Array.isArray(req.friends) || 1 !== req.friends.length) {
      return;
    }

    hg.utils.PageUtil.showHunterProfile(req.friends[0].sn_user_id);
  }, 'managers/ajax/pages/friends.php');
};

const goToFriendPageOnSearchID = (req) => {
  // Make sure we're on the search page.
  if ('community' !== getCurrentSubtab()) {
    return;
  }

  if (! req.friend.sn_user_id) {
    return;
  }

  hg.utils.PageUtil.showHunterProfile(req.friend.sn_user_id);
};

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
  parent.removeChild(block);
  parent.insertBefore(block, parent.firstChild);
  block.classList.add('friends-page-id-search');

  const input = block.querySelector('input');
  if (input) {
    // disable the 1password icon
    input.setAttribute('data-1p-ignore', 'true');
  }

  reordered.setAttribute('data-reordered', 'true');
};

const autofocusIdSearch = () => {
  const input = document.querySelector('.friendsPage-community-hunterIdForm-input');
  if (! input) {
    return;
  }

  input.focus();
};

const listenForIDPaste = () => {
  // listen for the user hitting the paste shortcut
  window.addEventListener('keydown', (e) => {
    // listen for command + v as well as ctrl + v
    if ((e.metaKey || e.ctrlKey) && 86 === e.keyCode) {
      // if we're currently focused in an input, then don't do anything
      if (document.activeElement instanceof HTMLInputElement) { // eslint-disable-line @wordpress/no-global-active-element
        return;
      }

      navigator.clipboard.readText().then((text) => {
        // if it is a number, then go to the hunter profile page
        if (! /^\d+$/.test(text)) {
          return;
        }

        hg.utils.PageUtil.setPage('HunterProfile', {
          id: text,
        });
      });
    }
  });
};

export default () => {
  onRequest(goToFriendPageOnSearchID, 'managers/ajax/pages/friends.php');

  onNavigation(() => {
    goToFriendsPageOnSearchSelect();
    reorderBlocks();
  }, {
    page: 'friends'
  });

  onNavigation(reorderBlocks, {
    page: 'friends'
  });

  onNavigation(autofocusIdSearch, {
    page: 'friends',
    tab: 'requests',
    subtab: 'community',
  });

  listenForIDPaste();
};
