export default () => {
  const addStyles = document.createElement('style');
  addStyles.innerHTML = `.actionportfolio,
  .canShare .larryTip,
  .canShare,
  .journalactions a[data-share-type="journal"],
  .journalactions a[data-type="journal"],
  .pageSidebarView .fb-page,
  .socialLink,
  *[src="https://www.mousehuntgame.com//images/ui/buttons/share_green.gif"],
  #jsDialog-publishToOwnWall,
  .publishToWall,
  .socialBallots {
    display: none;
  }

  #OnboardArrow.onboardPopup.canShare .closeButton {
    left: 0;
  }`;
  document.head.appendChild(addStyles);
};
