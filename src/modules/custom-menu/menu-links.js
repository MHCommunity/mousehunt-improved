/**
 * Get the HUD menu, the Camp / Travel / Inventory / ... bar under the header.
 *
 * @return {HTMLElement|null} The menu.
 */
const getHudMenu = () => document.querySelector('.mousehuntHud-menu');

/**
 * Get the image url from a computed background image.
 *
 * @param {HTMLElement} el The element.
 *
 * @return {string|null} The url, or null if there isn't one.
 */
const getBackgroundUrl = (el) => {
  const match = el ? getComputedStyle(el).backgroundImage.match(/^url\("?(.+?)"?\)$/) : null;

  return match ? match[1] : null;
};

/**
 * Check whether a HUD submenu item should be offered for the top menu.
 *
 * Leaves out dividers, the travel shortcuts that change with the current location, the memory games,
 * the guide, and the shops other than the Marketplace, which are all a click away in the HUD menu anyway.
 *
 * @param {HTMLElement} item    The submenu item.
 * @param {string}      menuKey The menu it's in.
 * @param {string}      key     The item's key.
 *
 * @return {boolean} Whether to offer it.
 */
const isOfferedLink = (item, menuKey, key) => {
  if (item.classList.contains('mh-improved-submenu-divider') || item.classList.contains('mh-improved-better-travel-menu-item')) {
    return false;
  }

  if (key.includes('memory')) {
    return false;
  }

  if ('shops' === menuKey) {
    return 'marketplace' === key;
  }

  return !('kingdom' === menuKey && 'guide' === key);
};

/**
 * Get the HUD menu links that can be added to the top menu, grouped by the menu they're in.
 *
 * @return {Array} The groups, each with an `id`, `name`, and `links`.
 */
const getAvailableLinks = () => {
  const menu = getHudMenu();
  if (!menu) {
    return [];
  }

  return [...menu.querySelectorAll(':scope > ul > li')]
    .map((top) => {
      const menuKey = top.classList[0];
      const name = top.querySelector(':scope > a')?.textContent.trim();
      if (!menuKey || !name) {
        return null;
      }

      const links = [];
      top.querySelectorAll(':scope > ul > li').forEach((item) => {
        const custom = item.classList.contains('custom-submenu-item');
        const key = custom ? item.id.replace('custom-submenu-item-', '') : item.classList[0];
        const link = item.querySelector(':scope > a');
        if (!key || !link || !isOfferedLink(item, menuKey, key)) {
          return;
        }

        links.push({
          id: `hud-${menuKey}-${custom ? 'custom-' : ''}${key}`,
          menu: menuKey,
          key,
          custom,
          label: (link.querySelector('.name') || link).textContent.trim().replaceAll(/\s+/g, ' '),
          icon: getBackgroundUrl(link.querySelector('.icon')),
        });
      });

      return links.length ? { id: menuKey, name, links } : null;
    })
    .filter(Boolean);
};

/**
 * Find the HUD menu link a top menu link stands in for.
 *
 * @param {Object} link The link.
 *
 * @return {HTMLElement|null} The HUD menu link.
 */
const findHudLink = (link) => {
  if (link.custom) {
    return document.querySelector(`#custom-submenu-item-${CSS.escape(link.key)} > a`);
  }

  const top = getHudMenu()?.querySelector(`:scope > ul > li.${CSS.escape(link.menu)}`);
  if (!link.key) {
    return top?.querySelector(':scope > a') || null;
  }

  return top?.querySelector(`:scope > ul > li.${CSS.escape(link.key)} > a`) || null;
};

/**
 * Make the top menu tab for a link.
 *
 * Clicking it clicks the HUD menu link, so it goes wherever that does, the same way.
 *
 * @param {Object} link The link.
 *
 * @return {HTMLElement} The tab.
 */
const makeLinkElement = (link) => {
  const el = document.createElement('a');
  el.className = 'menuItem mhui-custom-menu-link';
  el.href = '#';
  el.dataset.mhMenuId = link.id;
  el.dataset.mhMenuName = link.label;
  el.title = link.label;

  const icon = document.createElement('span');
  icon.className = 'mhui-menu-icon';
  if (link.icon) {
    icon.style.backgroundImage = `url(${link.icon})`;
  }

  const label = document.createElement('span');
  label.className = 'mhui-menu-label';
  label.textContent = link.label;

  el.append(icon, label);

  el.addEventListener('click', (event) => {
    event.preventDefault();
    findHudLink(link)?.click();
  });

  return el;
};

export { getAvailableLinks, makeLinkElement };
