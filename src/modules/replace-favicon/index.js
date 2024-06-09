import { onTurn, setMultipleTimeout } from '@utils';

/**
 * Replace the favicon.
 */
const replace = () => {
  const favicon = document.querySelector('#favicon');
  if (favicon) {
    favicon.href = 'https://i.mouse.rip/mh-icons/favicon.ico';
  }
};

/**
 * Add additional favicons.
 */
const add = () => {
  const icons = [
    { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://i.mouse.rip/mh-icons/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: 'https://i.mouse.rip/mh-icons/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: 'https://i.mouse.rip/mh-icons/favicon-16x16.png' },
    { rel: 'mask-icon', href: 'https://i.mouse.rip/mh-icons/safari-pinned-tab.svg', color: '#cfae00' },
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
  type: 'beta',
  default: false,
  description: 'Replace the favicon with a more fitting one',
  load: init,
};
