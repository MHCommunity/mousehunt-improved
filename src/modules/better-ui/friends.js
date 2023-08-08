
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const friendsPageChange = (event) => {
  // if there is a 'pagerView-firstPageLink' in the calss, then go to the first page
  if (event.target.classList.contains('pagerView-firstPageLink')) {
    app.pages.FriendsPage.tab_view_friends.pager.showFirstPage(event);
  } else if (event.target.classList.contains('pagerView-previousPageLink')) {
    app.pages.FriendsPage.tab_view_friends.pager.showPreviousPage(event);
  } else if (event.target.classList.contains('pagerView-nextPageLink')) {
    app.pages.FriendsPage.tab_view_friends.pager.showNextPage(event);
  } else if (event.target.classList.contains('pagerView-lastPageLink')) {
    app.pages.FriendsPage.tab_view_friends.pager.showLastPage(event);
  } else {
    return;
  }
  scrollToTop();
};


const scrollToTopOnFriendsPageChange = () => {
  onNavigation(scrollToTop, {
    page: 'friends',
  });

  const pagerLinks = document.querySelectorAll('.pagerView-container.PageFriends_view_friends .pagerView-section a');

  // remove all the onclick attributes
  pagerLinks.forEach((link) => {
    link.removeAttribute('onclick');
    link.addEventListener('click', (e) => {
      friendsPageChange(e);
    });
  });
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
