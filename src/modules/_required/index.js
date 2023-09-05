import { addUIStyles } from '../utils';
import globalStyles from './global-styles.css';
import fixesStyles from './fixes.css';
// import adblock from './adblock.css';

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

const main = () => {
  if ('item' === getCurrentPage()) {
    updateItemClassificationLinks();
  }

  // if twttr is undefined, then set a dummy function to prevent errors
  if (typeof twttr === 'undefined') {
    window.twttr = {
      widgets: {
        load: () => {},
        createShareButton: () => {},
      },
    };
  }
};

export default function fixes() {
  addUIStyles(globalStyles);
  addUIStyles(fixesStyles);
  // addUIStyles(adblock);

  main();
}
