import { getFlag, onTurn } from '@utils';

const showFullTitlePercent = async () => {
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

const replaceInboxClose = async () => {
  const template = hg.utils.TemplateUtil.getTemplate('ViewMousehuntHeader_inbox')
    .replace('<a class="messengerUINotificationClose" href="#">X', '<a class="messengerUINotificationClose" href="#">✕');
  hg.utils.TemplateUtil.addTemplate('ViewMousehuntHeader_inbox', template);
};

const replaceKingdomLink = async () => {
  const kingdomLink = document.querySelector('.mousehuntHud-menu .kingdom a[href="https://www.mousehuntgame.com/forum.php"]');
  if (! kingdomLink) {
    return;
  }

  kingdomLink.href = 'https://www.mousehuntgame.com/news.php';
  kingdomLink.setAttribute('data-page', 'News');
};

/**
 * Initialize the module.
 */
export default async () => {
  showFullTitlePercent();
  replaceInboxClose();

  if (! getFlag('no-kingdom-link-replacement')) {
    replaceKingdomLink();
  }

  onTurn(showFullTitlePercent, 1000);
};
