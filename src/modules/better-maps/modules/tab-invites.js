import { makeElement, waitForElement } from '@utils';

const addSubTabListeners = () => {
  const inviteTabs = document.querySelectorAll('.treasureMapRootView-tabRow .treasureMapRootView-tab');
  if (inviteTabs.length === 0) {
    return;
  }

  inviteTabs.forEach((tab) => {
    tab.removeEventListener('click', maybeShowInvitesTab);
    tab.addEventListener('click', maybeShowInvitesTab);
  });
};

let isRunning = false;
const maybeShowInvitesTab = async () => {
  if (isRunning) {
    return;
  }

  isRunning = true;

  await waitForElement('.treasureMapInvitesView .treasureMapView-title');
  addSubTabListeners();
  isRunning = false;

  onInvitesTab();
};

const onInvitesTab = () => {
  const title = document.querySelector('.treasureMapInvitesView .treasureMapView-title');
  if (! title) {
    return;
  }

  const existingRefreshButton = title.querySelector('.mh-ui-invite-refresh-button');
  if (existingRefreshButton) {
    return;
  }

  const refreshButton = makeElement('a', 'mh-ui-invite-refresh-button');
  refreshButton.title = 'Refresh';
  refreshButton.href = '#';
  refreshButton.addEventListener('click', (e) => {
    refreshButton.classList.add('loading');

    e.preventDefault();
    hg.utils.TreasureMapUtil.getInvites(() => {
      const inviteTab = document.querySelector('.treasureMapRootView-tabRow .treasureMapRootView-tab[data-type="show_invites"]');
      if (inviteTab) {
        inviteTab.click();
      }
      https:// www.mousehuntgame.com/camp.php#
      refreshButton.classList.remove('loading');
      maybeShowInvitesTab();
    }, () => {
      refreshButton.classList.remove('loading');
      maybeShowInvitesTab();
    });
  });
  title.append(refreshButton);
};

export {
  maybeShowInvitesTab
};
