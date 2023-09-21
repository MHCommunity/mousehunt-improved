import { addUIStyles } from '../utils';
import globalStyles from './global-styles.css';
import fixesStyles from './fixes.css';

const updateItemClassificationLinks = () => {
  const itemClassificationLink = document.querySelectorAll('.itemView-header-classification-link a');
  if (! itemClassificationLink) {
    return;
  }

  itemClassificationLink.forEach((link) => {
    // get the onclick attribute, remove 'hg.views.ItemView.hide()', then set the onclick attribute
    const onclick = link.getAttribute('onclick');
    if (! onclick) {
      return;
    }

    // get the page title and tab via regex
    const page = onclick.match(/setPage\('(.+?)'.+tab:'(.+)'/);
    if (! page) {
      return;
    }

    const pageTitle = page[1];
    let tab = page[2];
    let subtab = null;

    if ('skin' === tab || 'trinket' === tab) {
      subtab = tab;
      tab = 'traps';
    }

    // build the url
    let url = `https://www.mousehuntgame.com/${pageTitle.toLowerCase()}.php?tab=${tab}`;
    if (subtab) {
      url += `&sub_tab=${subtab}`;
    }

    // remove the onclick attribute and add the href attribute
    link.removeAttribute('onclick');
    link.setAttribute('href', url);
  });
};

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
      text: 'MH guides, tools, and more',
    },
    {
      id: 'mhui',
      class: 'fanPage',
      title: 'MH Improved',
      href: 'https://github.com/MHCommunity/mousehunt-improved',
      text: 'Bug reports and feature requests',
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

const main = () => {
  if ('item' === getCurrentPage()) {
    updateItemClassificationLinks();
  }

  addHelpLinks();
};

export default function fixes() {
  addUIStyles(globalStyles);
  addUIStyles(fixesStyles);

  main();
}
