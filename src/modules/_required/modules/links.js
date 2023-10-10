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
    }
  ];

  helpLinks.forEach((helpLink) => {
    const link = makeElement('a', [helpLink.id, helpLink.class]);
    makeElement('b', 'title', helpLink.title, link);
    makeElement('span', 'text', helpLink.text, link);

    link.setAttribute('href', helpLink.href);
    link.setAttribute('target', '_blank');

    supportDropdown.appendChild(link);
  });
};

export default () => {
  addHelpLinks();
  addMouseripLink();
};
