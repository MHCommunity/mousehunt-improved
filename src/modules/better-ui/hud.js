const showFullTitlePercent = () => {
  const title = document.querySelector('.mousehuntHud-userStat.title');
  if (! title) {
    return;
  }

  const percent = title.getAttribute('title');
  if (! percent) {
    return;
  }

  const target = title.querySelector('.hud_titlePercentage');
  if (! target) {
    return;
  }

  const originalText = target.innerText;

  title.addEventListener('mouseover', () => {
    target.innerText = percent.includes('%') ? percent.split('%')[0] : percent;
  });

  title.addEventListener('mouseout', () => {
    target.innerText = originalText;
  });
};

const replaceInboxClose = () => {
  const template = hg.utils.TemplateUtil.getTemplate('ViewMousehuntHeader_inbox')
    .replace('<a class="messengerUINotificationClose" href="#">X', '<a class="messengerUINotificationClose" href="#">✕');
  hg.utils.TemplateUtil.addTemplate('ViewMousehuntHeader_inbox', template);
};
/**
 * Initialize the module.
 */
export default () => {
  showFullTitlePercent();
  replaceInboxClose();
};
