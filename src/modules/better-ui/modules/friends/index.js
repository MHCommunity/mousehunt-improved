import {
  getCurrentPage,
  getSetting,
  onNavigation,
  onRender,
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

const modifyRenders = () => {
  onRender({
    group: 'PageFriends_view_friend_row',
    after: true,
    callback: (data, results) => {
      if (
        data?.map_name_list &&
        data?.map_name_list.length &&
        results.includes(', and ')
      ) {
        results = results.replaceAll(', and ', ' and ');
      }

      if (
        data?.user_interactions?.actions?.send_daily_gift?.is_recipient_banned ||
        data?.user_interactions?.actions?.send_map_invite?.maps[0]?.is_recipient_banned
      ) {
        results = results.replace(
          '<div class="friendsPage-friendRow-imageContainer',
          '<div class="friendsPage-friendRow-imageContainer friendsPage-friendRow--banned'
        );
      }
    }
  });

  onRender({
    group: 'PageFriends',
    after: true,
    callback: (data, results) => {
      if (! results || typeof results !== 'string') {
        return results;
      }

      // Process banned users and map name fixes
      if (! data || ! data.tabs || ! data.tabs[0] || ! data.tabs[0].subtabs || ! data.tabs[0].subtabs[0] || ! data.tabs[0].subtabs[0].friends) {
        return results;
      }

      data?.tabs[0].subtabs[0].friends.forEach((friend) => {
        if (
          friend?.user_interactions?.actions?.send_daily_gift?.is_recipient_banned ||
          friend?.user_interactions?.actions?.send_map_invite?.maps?.[0]?.is_recipient_banned
        ) {
          // Add banned class to friend's image container.
          const snuid = friend.sn_user_id;
          const escapedSnuid = snuid.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');
          if (! imageContainerRegex.test(results)) {
            const profileUrlRegex = new RegExp(`(<div class="friendsPage-friendRow-imageContainer)([^>]*href="[^"]*snuid=${escapedSnuid}"[^>]*>)`, 'g');
            results = results.replace(profileUrlRegex, '$1 friendsPage-friendRow--banned$2');
          }
        }
      });

      results = results.replaceAll(
        /<div class="friendsPage-friendRow-stat-value"><span>([^<]*), and ([^<]*)<\/span><\/div>/g,
        '<div class="friendsPage-friendRow-stat-value"><span>$1 and $2</span></div>'
      );

      return results;
    }
  });
};

/**
 * Initialize the module.
 */
export default async () => {
  // When the page is loaded, if we are on the friends page, then call hg.utils.PageUtil.refresh()
  if ('friends' === getCurrentPage()) {
    hg.utils.PageUtil.refresh();
  }

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

  modifyRenders();
};
