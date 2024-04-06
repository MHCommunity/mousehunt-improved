import { doEvent, hasMiniCRE, setPage } from '@utils';

export default () => {
  const shortcuts = [
    {
      id: 'goto-travel',
      key: 't',
      description: 'Travel',
      action: () => setPage('Travel'),
      category: 'navigation',
    },
    {
      id: 'goto-camp',
      key: 'j',
      description: 'Camp',
      action: () => setPage('Camp'),
      category: 'navigation',
    },
    {
      id: 'goto-friends',
      key: 'f',
      description: 'Friends',
      action: () => setPage('Friends'),
      category: 'navigation',
    },
    {
      id: 'goto-shops',
      key: 's',
      description: 'Shops',
      action: () => setPage('Shops'),
      category: 'navigation',
    },
    {
      id: 'goto-profile',
      key: 'p',
      description: 'Your Hunter Profile',
      action: () => setPage('HunterProfile'),
      category: 'navigation',
    },
    {
      id: 'goto-send-supplies',
      description: 'Send Supplies',
      action: () => setPage('SupplyTransfer'),
      category: 'navigation',
    },
    {
      id: 'goto-scoreboards',
      description: 'Scoreboards',
      action: () => setPage('Scoreboards'),
      category: 'navigation',
    },
    {
      id: 'goto-team',
      description: 'Team',
      action: () => setPage('Team'),
      category: 'navigation',
    },
    {
      id: 'goto-tournaments',
      description: 'Tournaments',
      action: () => setPage('Tournament'),
      category: 'navigation',
    },
    {
      id: 'goto-wiki',
      description: 'Wiki',
      action: () => setPage('Wiki'),
      category: 'navigation',
    },
    {
      id: 'goto-marketplace',
      description: 'Open the Marketplace',
      action: () => hg?.views?.MarketplaceView?.show && hg.views.MarketplaceView.show(),
      category: 'open-dialog',
    },
    {
      id: 'open-inbox',
      description: 'Open the Inbox',
      action: () => messenger?.UI?.notification?.togglePopup && messenger.UI.notification.togglePopup(),
      category: 'open-dialog',
    },
    {
      id: 'open-gifts',
      description: 'Open the Gifts popup',
      action: () => hg?.views?.GiftSelectorView?.show && hg.views.GiftSelectorView.show(),
      category: 'open-dialog',
    },
    {
      id: 'open-map',
      key: 'm',
      description: 'Open your Map',
      action: () => hg?.controllers?.TreasureMapController?.show && hg.controllers.TreasureMapController.show(),
      category: 'open-dialog',
    },
    {
      id: 'open-map-invites',
      key: 'i',
      description: 'Open your Map Invites',
      action: () => hg?.controllers?.TreasureMapController?.showCommunity && hg.controllers.TreasureMapController.showCommunity(),
      category: 'open-dialog',
    },
    {
      id: 'open-travel-window',
      description: 'Open the Travel Window',
      action: () => doEvent('mh-improved-open-travel-window'),
      category: 'open-dialog',
    },
    {
      id: 'change-weapon',
      key: 'w',
      description: 'Change Weapon',
      action: () => hg.views.TrapSelectorView().show('weapon'),
      category: 'trap-setup',
    },
    {
      id: 'change-base',
      key: 'b',
      description: 'Change Base',
      action: () => hg.views.TrapSelectorView().show('base'),
      category: 'trap-setup',
    },
    {
      id: 'change-charm',
      key: 'r',
      description: 'Change Charm',
      action: () => hg.views.TrapSelectorView().show('trinket'),
      category: 'trap-setup',
    },
    {
      id: 'change-cheese',
      key: 'c',
      description: 'Change Cheese',
      action: () => hg.views.TrapSelectorView().show('bait'),
      category: 'trap-setup',
    },
    {
      id: 'change-skin',
      description: 'Change Trap Skin',
      action: () => hg.views.TrapSelectorView().show('skin'),
      category: 'trap-setup',
    },
    {
      id: 'show-tem',
      key: 'e',
      description: 'Show the <abbr title="Trap Effectiveness Meter">TEM</abbr>',
      action: () => {
        const tem = document.querySelector('button.campPage-trap-trapEffectiveness.campPage-trap-statsContainer');
        if (tem) {
          tem.click();
        }
      },
      category: 'trap-setup',
    },
    {
      id: 'disarm-cheese',
      description: 'Disarm your Cheese',
      action: () => hg?.utils?.TrapControl?.disarmBait && hg?.utils?.TrapControl?.go && hg.utils.TrapControl.disarmBait() && hg.utils.TrapControl.go(),
      category: 'trap-setup',
    },
    {
      id: 'disarm-charm',
      description: 'Disarm your Charm',
      action: () => hg?.utils?.TrapControl?.disarmBait && hg?.utils?.TrapControl?.go && hg.utils.TrapControl.disarmBait() && hg.utils.TrapControl.go(),
      category: 'trap-setup',
    },
    {
      id: 'travel-to-previous-location',
      description: 'Travel to previous location',
      action: () => doEvent('mh-improved-goto-previous-location'),
      category: 'misc',
    },
    {
      id: 'toggle-inventory-lock',
      description: 'Toggle Inventory Lock & Hide',
      action: () => doEvent('mh-improved-toggle-inventory-lock'),
      category: 'misc',
    },
    {
      id: 'favorite-setups',
      description: 'Open Favorite Setups',
      action: () => doEvent('mh-improved-toggle-favorite-setups'),
      category: 'trap-setup',
    }
  ];

  if (hasMiniCRE()) {
    shortcuts.push({
      id: 'show-mini-cre',
      key: 'l',
      description: 'Open Mini CRE',
      action: () => {
        const minluckButton = document.querySelector('.min-luck-button');
        if (minluckButton) {
          minluckButton.click();
        }
      },
      category: 'misc',
    });
  }

  return shortcuts;
};
