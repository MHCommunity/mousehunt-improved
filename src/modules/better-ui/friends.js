
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const addPagerListeners = () => {
  const pagers = document.querySelectorAll('.pagerView-container.PageFriends_view_friends .pagerView-previousPageLink.pagerView-link');
  if (pagers && pagers.length) {
    pagers.forEach((pager) => {
      pager.addEventListener('click', () => {
        setTimeout(() => {
          scrollToTop();
        }, 250);
      });
    });
  }
};

const scrollToTopOnFriendsPageChange = () => {
  onAjaxRequest((req) => {
    if (req && req.friends && req.friends.length) {
      scrollToTop();
    }
  }, 'managers/ajax/pages/friends.php');

  onPageChange({ friends: { show: addPagerListeners } });
};

const goToFriendsPageOnSearchSelect = () => {
  const friends = $('.friendsPage-list-search');
  friends.on('change', (e) => {
    setTimeout(() => {
      hg.utils.PageUtil.showHunterProfile(e.val);
    }, 250);
  });
};

export default () => {
  scrollToTopOnFriendsPageChange();
  goToFriendsPageOnSearchSelect();
};
