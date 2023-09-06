import { addUIStyles } from './utils';

const hulls = [
  'airship_hull_astral_stat_item',
  'airship_hull_factory_stat_item',
  'airship_hull_birthday_stat_item',
  'airship_hull_new_years_stat_item',
  'airship_hull_winter_stat_item',
  'airship_hull_pirate_stat_item',
  'airship_hull_chrome_stat_item',
  'airship_hull_plant_stat_item',
  'airship_hull_cloud_stat_item',
  'airship_hull_deluxe_stat_item',
  'airship_hull_lny_ox_stat_item',
  'airship_hull_ghost_ship_stat_item',
  'airship_hull_empyrean_stat_item',
  'airship_hull_porcelain_stat_item',
  'airship_hull_mineral_stat_item',
  'airship_hull_lny_stat_item',
  'airship_hull_bookmobile_stat_item',
  'airship_hull_spring_stat_item',
  'airship_hull_holiday_express_stat_item',
  'airship_hull_vrift_stat_item',
  'airship_hull_marzipan_stat_item',
  'airship_hull_gilded_stat_item',
  'airship_hull_tiger_stat_item',
  'airship_hull_gloomy_galleon_stat_item',
];

const sails = [
  'airship_sail_astral_stat_item',
  'airship_sail_factory_stat_item',
  'airship_sail_lny_stat_item',
  'airship_sail_cloud_stat_item',
  'airship_sail_gloomy_galleon_stat_item',
  'airship_sail_holiday_express_stat_item',
  'airship_sail_new_years_stat_item',
  'airship_sail_tiger_stat_item',
  'airship_sail_bookmobile_stat_item',
  'airship_sail_vrift_stat_item',
  'airship_sail_mineral_stat_item',
  'airship_sail_empyrean_stat_item',
  'airship_sail_lny_ox_stat_item',
  'airship_sail_deluxe_stat_item',
  'airship_sail_pirate_stat_item',
  'airship_sail_winter_stat_item',
  'airship_sail_birthday_stat_item',
  'airship_sail_chrome_stat_item',
  'airship_sail_porcelain_stat_item',
  'airship_sail_plant_stat_item',
  'airship_sail_gilded_stat_item',
  'airship_sail_marzipan_stat_item',
  'airship_sail_spring_stat_item',
  'airship_sail_ghost_ship_stat_item',
];

const balloons = [
  'airship_balloon_astral_stat_item',
  'airship_balloon_marzipan_stat_item',
  'airship_balloon_birthday_stat_item',
  'airship_balloon_holiday_express_stat_item',
  'airship_balloon_gloomy_galleon_stat_item',
  'airship_balloon_pirate_stat_item',
  'airship_balloon_chrome_stat_item',
  'airship_balloon_bookmobile_stat_item',
  'airship_balloon_new_years_stat_item',
  'airship_balloon_mineral_stat_item',
  'airship_balloon_empyrean_stat_item',
  'airship_balloon_winter_stat_item',
  'airship_balloon_lny_ox_stat_item',
  'airship_balloon_tiger_stat_item',
  'airship_balloon_deluxe_stat_item',
  'airship_balloon_lny_stat_item',
  'airship_balloon_vrift_stat_item',
  'airship_balloon_porcelain_stat_item',
  'airship_balloon_factory_stat_item',
  'airship_balloon_spring_stat_item',
  'airship_balloon_gilded_stat_item',
  'airship_balloon_cloud_stat_item',
  'airship_balloon_plant_stat_item',
  'airship_balloon_ghost_ship_stat_item',
];

const createAirship = (options) => {
  const airship = (type, name = null) => {
    const style = name ? `style="background-image: url(https://www.mousehuntgame.com/images/ui/hud/floating_islands/airship/${type}/${name}.png);"` : '';
    return `<div class="floatingIslandsAirship-part ${type} silhouette" ${style}></div>`;
  };

  const popup = new jsDialog(); // eslint-disable-line no-undef
  popup.setTemplate('default');
  popup.setAttributes({ className: 'mh-airship-popup' });
  popup.addToken('{*title*}', '');

  const hull = airship('hull', options.hull || null);
  const sail = airship('sail', options.sail || null);
  const balloon = airship('balloon', options.balloon || null);

  popup.addToken('{*content*}', `<div class="floatingIslandsAirship animate " data-user-id="">${hull}${sail}${balloon}</div>`);
  popup.show();
};

const trackEvents = () => {
  const events = [
    'ajax_response ',
    'camp_quest_hud_view_initialize',
    'user_interaction_update',
    'js_dialog_hide',
    'js_dialog_show',
    'set_page',
    'set_tab',
    'set_inset_tab',
    'treasure_map_update',
    'user_inventory_update',
    'user_recipe_update',
    'user_inventory_use_convertible',
  ];

  events.forEach((event) => {
    eventRegistry.addEventListener(event, (e) => {
      if (window.showEvents) {
        console.log(`${event} was fired`, e); // eslint-disable-line no-console
      }
    });
  });
};

const makeRandomAirships = () => {
  const trigger = document.querySelector('.mousehuntHud-gameInfo');
  trigger.addEventListener('click', () => {
    createAirship({
      hull: hulls[Math.floor(Math.random() * hulls.length)],
      sail: sails[Math.floor(Math.random() * sails.length)],
      balloon: balloons[Math.floor(Math.random() * balloons.length)],
    });
  });
};

const trollEm = () => {
  const hasBeenTrolled = localStorage.getItem('lol-got-trolled-by-larry');
  if (hasBeenTrolled && Math.random() < 0.75) {
    return;
  }

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
      on_show_callback: () => {
        app.views.OnboardingTutorialView.tutorial.showBouncyArrow(domQuery, 'top');
      },
      on_close_callback: () => {
        app.views.OnboardingTutorialView.tutorial.hideBouncyArrow();
        localStorage.setItem('lol-got-trolled-by-larry', true);
      },
      show_overlay: true,
    });
    hg.views.MessengerView.go();
  }
};

const trollem2 = () => {
  const banner = document.querySelector('.campPage-banner');
  if (! banner) {
    return;
  }

  const bannerLink = document.createElement('a');
  const newbieImg = document.createElement('img');
  newbieImg.src = 'https://www.mousehuntgame.com/images/promo/campbanners/groups/newbie.png';

  bannerLink.appendChild(newbieImg);

  const styleslol = () => {
    addUIStyles(`* + * {
      transition: .3s;
    }

    * + * + * {
      filter: hue-rotate(90deg);
      transform: rotate(0.5deg);
    }

    * + * + * + * {
      transform: rotate(-0.6deg);
    }

    * + * > * {
      transform: rotate(-0.1deg);
    }

    * + * + * > * {
      transform: rotate(0.2deg);
    }

    div + div + div {
      filter: hue-rotate(90deg);
    }

    * > * > * > * > * > * > * > * > * > * > * {
      transition: .9s;
    }

    * > * > * > * > * > * > * > * > * > *:hover  * > {
      transform:rotateX(20deg);
    }

    * > * > * > * > * > * > * > * > * > * > *:hover {
      transform:rotateX(-20deg);
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .lolspin {
      animation: spin 1s linear infinite;
    }
    `);
  };

  const secondClick = () => {
    banner.classList.add('lolspin');
    setTimeout(() => {
      banner.classList.remove('lolspin');
    }, 1000);

    const elements = document.querySelectorAll('*');
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    randomElement.classList.add('lolspin');

    setInterval(() => {
      const randomElement2 = elements[Math.floor(Math.random() * elements.length)];
      randomElement2.classList.add('lolspin');
    }, 500);
  };

  const firstClick = () => {
    styleslol();
    bannerLink.removeEventListener('click', firstClick);
    bannerLink.addEventListener('click', secondClick);
  };

  bannerLink.addEventListener('click', firstClick);

  banner.appendChild(bannerLink);
  banner.classList.remove('hidden');
};

const main = () => {
  makeRandomAirships();
  trackEvents();

  trollEm();

  // randomly decide to troll
  if (Math.random() < 0.1) {
    trollem2();
  }
};

export default main;
