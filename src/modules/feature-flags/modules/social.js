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
};
