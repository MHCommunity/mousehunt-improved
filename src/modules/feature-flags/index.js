import { addUIStyles, getFlag } from '@/utils';

import rankupForecaster from './modules/rank-up-forecaster';
import trollMode from './modules/troll-mode';

import delayTooltipStyles from './modules/delayed-tooltips.css';

const fillTwttrObject = () => {
  window.twttr = {
    widgets: {
      load: () => {},
      createShareButton: () => {},
    },
  };

  class SocialLink {
    constructor(url) {
      this.url = url;
    }
    appendTo() {}
    setFacebookLikeUrl() {}
    setFacebookShareUrl() {}
    setImage() {}
    setTitle() {}
    setTwitterUrl() {}
  }

  hg.classes.SocialLink = SocialLink;
};

/**
 * Initialize the module.
 */
export default () => {
  if (getFlag('lol-gottem')) {
    trollMode();
  }

  if (getFlag('twitter')) {
    fillTwttrObject();
  }

  if (! getFlag('rankup-forecaster')) {
    rankupForecaster();
  }

  if (getFlag('delayed-tooltips')) {
    addUIStyles(delayTooltipStyles);
  }
};
