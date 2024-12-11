import { getFlag, onNavigation, onTurn } from '@utils';

let shortPercent = 0;
let fullPercent = 0;

/**
 * Show the full title percent on hover.
 */
const showFullTitlePercent = async () => {
  const title = document.querySelector('.mousehuntHud-userStat.title');
  if (! title) {
    return;
  }

  let percent = title.getAttribute('title');
  if (! percent) {
    percent = `${user?.title_percent_accurate}% ${user?.title_name}`;
  }

  const target = title.querySelector('.hud_titlePercentage');
  if (! target) {
    return;
  }

  title.addEventListener('mouseover', () => {
    fullPercent = percent.includes('%') ? percent.split('%')[0] : percent;
    shortPercent = fullPercent.includes('.') ? fullPercent.split('.')[0] : fullPercent;
    target.innerText = fullPercent;
  });

  title.addEventListener('mouseout', () => {
    target.innerText = shortPercent;
  });
};

/**
 * Replace the close button in the inbox.
 */
const replaceInboxClose = async () => {
  const template = hg.utils.TemplateUtil.getTemplate('ViewMousehuntHeader_inbox')
    .replace('<a class="messengerUINotificationClose" href="#">X', '<a class="messengerUINotificationClose" href="#">✕');
  hg.utils.TemplateUtil.addTemplate('ViewMousehuntHeader_inbox', template);
};

/**
 * Replace the kingdom link in the HUD.
 */
const replaceKingdomLink = async () => {
  const kingdomLink = document.querySelector('.mousehuntHud-menu .kingdom a[href="https://www.mousehuntgame.com/forum.php"]');
  if (! kingdomLink) {
    return;
  }

  kingdomLink.href = 'https://www.mousehuntgame.com/news.php';
  kingdomLink.setAttribute('data-page', 'News');
};

/**
 * Allow clicking on trap stats to toggle the math display.
 */
const allowTrapMathToggle = async () => {
  setTimeout(() => {
    const trapStats = document.querySelectorAll('.trapSelectorView__trapStatSummary .campPage-trap-trapStat');
    trapStats.forEach((stat) => {
      stat.addEventListener('click', () => {
        stat.classList.toggle('show-math');
        trapStats.forEach((otherStat) => {
          if (otherStat !== stat) {
            otherStat.classList.remove('show-math');
          }
        });
      });
    });
  }, 500);
};

/**
 * Initialize the module.
 */
export default async () => {
  showFullTitlePercent();
  replaceInboxClose();

  onNavigation(allowTrapMathToggle, {
    page: 'camp',
  });

  if (! getFlag('no-kingdom-link-replacement')) {
    replaceKingdomLink();
  }

  onTurn(showFullTitlePercent, 1000);
};
