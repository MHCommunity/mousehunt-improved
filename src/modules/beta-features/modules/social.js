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
