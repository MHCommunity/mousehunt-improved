import { onTurn, setMultipleTimeout } from '@utils';

import appleTouchIcon from '@images/icons/apple-touch-icon.png';
import favicon16 from '@images/icons/favicon-16x16.png';
import favicon32 from '@images/icons/favicon-32x32.png';
import safariPinnedTabIcon from '@images/icons/safari-pinned-tab.svg';

/**
 * Replace the favicon.
 */
const replace = () => {
  const favicon = document.querySelector('#favicon');
  if (favicon) {
    favicon.href = favicon32;
  }
};

/**
 * Add additional favicons.
 */
const add = () => {
  const icons = [
    { rel: 'apple-touch-icon', sizes: '180x180', href: appleTouchIcon },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: favicon32 },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: favicon16 },
    { rel: 'mask-icon', href: safariPinnedTabIcon, color: '#cfae00' },
  ];

  icons.forEach((icon) => {
    const link = document.createElement('link');
    for (const key in icon) {
      link.setAttribute(key, icon[key]);
    }
    document.head.append(link);
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  add();
  replace();
  onTurn(() => {
    setMultipleTimeout(replace, [1000, 2000, 3000, 4000, 5000]);
  });
};

export default {
  id: 'replace-favicon',
  name: 'Replace Favicon',
  type: 'feature',
  default: false,
  description: 'Replace the favicon with a more fitting one.',
  load: init,
};
