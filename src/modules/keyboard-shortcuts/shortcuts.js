import { hasMiniCRE } from '@utils';

import {
  clickMinLuck,
  disarmCharm,
  disarmCheese,
  gotoPage,
  openBlueprint,
  openGifts,
  openInbox,
  openMap,
  openMapInvites,
  openMarketplace,
  showTem
} from './actions';

const getBaseShortcuts = () => {
  const shortcuts = [
    {
      id: 'help',
      key: '?',
      shiftKey: true,
      description: 'Help',
      action: showHelpPopup,
      type: 'hidden',
    },
    {
      id: 'travel',
      key: 't',
      description: 'Go to the Travel page',
      action: () => gotoPage('Travel'),
    },
    {
      id: 'camp',
      key: 'j',
      description: 'Go to the Camp page',
      action: () => gotoPage('Camp'),
    },
    {
      id: 'friends',
      key: 'f',
      description: 'Go to the Friends page',
      action: () => gotoPage('Friends'),
    },
    {
      id: 'shops',
      key: 's',
      description: 'Go to the Shops page',
      action: () => gotoPage('Shops'),
    },
    {
      id: 'profile',
      key: 'p',
      description: 'Go to your Profile',
      action: () => gotoPage('HunterProfile'),
    },
    {
      id: 'marketplace',
      description: 'Open the Marketplace',
      action: openMarketplace,
    },
    {
      id: 'map',
      key: 'm',
      description: 'Open your Map',
      action: openMap,
    },
    {
      id: 'map-invites',
      key: 'i',
      description: 'Open your Map Invites',
      action: openMapInvites,
    },
    {
      id: 'change-weapon',
      key: 'w',
      description: 'Change your Weapon',
      action: () => openBlueprint('weapon'),
    },
    {
      id: 'change-base',
      key: 'b',
      description: 'Change your Base',
      action: () => openBlueprint('base'),
    },
    {
      id: 'change-charm',
      key: 'r',
      description: 'Change your Charm',
      action: () => openBlueprint('trinket'),
    },
    {
      id: 'change-cheese',
      key: 'c',
      description: 'Change your Cheese',
      action: () => openBlueprint('bait'),
    },
    {
      id: 'change-skin',
      description: 'Change your Trap Skin',
      action: () => openBlueprint('skin'),
    },
    {
      id: 'show-tem',
      key: 'e',
      description: 'Show the Trap Effectiveness Meter',
      action: showTem,
    },
    {
      id: 'disarm-cheese',
      description: 'Disarm your Cheese',
      action: disarmCheese,
    },
    {
      id: 'disarm-charm',
      description: 'Disarm your Charm',
      action: disarmCharm,
    },
    {
      id: 'open-inbox',
      description: 'Open the Inbox',
      action: openInbox,
    },
    {
      id: 'open-gifts',
      description: 'Open the Gifts popup',
      action: openGifts,
    },
  ];

  if (hasMiniCRE()) {
    shortcuts.push({
      id: 'show-mini-cre',
      key: 'l',
      description: 'Show the Mini CRE popup',
      action: clickMinLuck,
    });
  }

  return shortcuts;
};

export default getBaseShortcuts;
