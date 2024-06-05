import { addStyles } from '@utils';

/**
 * Social noop module.
 */
export default () => {
  window.twttr = {
    widgets: {
      load: () => {},
      createShareButton: () => {},
    },
  };

  /**
   * Social link class.
   */
  class SocialLink {
    /**
     * Noop constructor.
     *
     * @param {string} url The URL.
     */
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

  addStyles('a[onclick="SocialFramework.shareToFeedButton(this); return false;"] { filter: grayscale(1) opacity(0.5); cursor: not-allowed;}', 'social-noop');
};
