/**
 * Initialize the module.
 */
export default async () => {
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
