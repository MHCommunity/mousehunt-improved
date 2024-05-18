import { addSubmenuItem, makeElement } from '@utils';

const addHelpLinks = () => {
  const supportDropdown = document.querySelector('.menuItem.dropdown.support .dropdownContent');
  if (! supportDropdown) {
    return;
  }

  const helpLinks = [
    {
      id: 'mouserip',
      class: 'rules',
      title: 'MOUSE.RIP', // caps to look better
      href: 'https://mouse.rip',
      text: 'MH guides, tools, and more.',
    },
    {
      id: 'mhui',
      class: 'fanPage',
      title: 'MH Improved',
      href: 'https://github.com/MHCommunity/mousehunt-improved',
      text: 'Bug reports and feature requests.',
    },
  ];

  helpLinks.forEach((helpLink) => {
    const link = makeElement('a', [helpLink.id, helpLink.class]);
    makeElement('b', 'title', helpLink.title, link);
    makeElement('span', 'text', helpLink.text, link);

    link.setAttribute('href', helpLink.href);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    supportDropdown.append(link);
  });
};

/**
 * Initialize the module.
 */
const init = async () => {
  addHelpLinks();

  addSubmenuItem({
    menu: 'kingdom',
    label: 'mouse.rip',
    icon: 'https://www.mousehuntgame.com/images/ui/hud/menu/prize_shoppe.png',
    href: 'https://mouse.rip',
    external: true,
  });
};

/**
 * Initialize the module.
 */
export default {
  id: 'links',
  type: 'required',
  alwaysLoad: true,
  load: init,
};
