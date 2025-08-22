import { addStyles, onTurn } from '@utils';

import styles from './styles.css';

/**
 * Troll mode.
 */
const trollEm = () => {
  const domQuery = '#journallatestentry';
  const lastCatch = document.querySelector(domQuery);
  const status = ['attractionfailure', 'catchfailure', 'catchfailuredamage'];
  const isFtcOrFta = lastCatch && status.some((s) => lastCatch.classList.contains(s));

  if (isFtcOrFta) {
    hg.views.MessengerView.addMessage({
      content: {
        body: app.views.OnboardingTutorialView.tutorial.wrapInfoArrow(`wow you really are an amazing mousehunter ${user.username}`, 'lol'),
      },
      highlight_dom: domQuery,
      highlight_padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 1,
      },
      css_class: 'larryCircle',
      on_show_callback: () => app.views.OnboardingTutorialView.tutorial.showBouncyArrow(domQuery, 'top'),
      on_close_callback: () => app.views.OnboardingTutorialView.tutorial.hideBouncyArrow(),
      show_overlay: true,
    });
    hg.views.MessengerView.go();
  }
};

/**
 * Troll mode 2.
 */
const trollem2 = () => {
  const banner = document.querySelector('.campPage-banner');
  if (! banner) {
    return;
  }

  const bannerLink = document.createElement('a');
  const newbieImg = document.createElement('img');
  newbieImg.src = 'https://www.mousehuntgame.com/images/promo/campbanners/groups/newbie.png';

  bannerLink.append(newbieImg);

  bannerLink.addEventListener('click', () => {
    addStyles(styles, 'troll-mode');
    banner.classList.add('lolspin');
    setTimeout(() => banner.classList.remove('lolspin'), 1000);

    const elements = document.querySelectorAll('body * *');
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    randomElement.classList.add('lolspin');

    setInterval(() => {
      const randomElement2 = elements[Math.floor(Math.random() * elements.length)];
      randomElement2.classList.add('lolspin');
    }, 500);
  });

  banner.append(bannerLink);
  banner.classList.remove('hidden');
};

/**
 * Initialize the module.
 */
const init = async () => {
  trollEm();
  onTurn(trollEm, 1000);
  trollem2();
};

export default {
  id: 'experiments.lol-gottem',
  name: 'Troll mode',
  load: init,
};
