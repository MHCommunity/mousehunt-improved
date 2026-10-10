import { addIconToMenu } from '@utils';

import { openEggHelper } from '@/location-huds/locations/event-locations/spring-egg-hunt/egg-helper';

/**
 * Add an Egg Hunt Helper item to the top menu. It's hidden until it's shown with Custom Menu, and works
 * all year, unlike the Camp menu link that's only there during the Spring Egg Hunt.
 */
export default () => {
  addIconToMenu({
    id: 'mousehunt-improved-egg-hunt-helper',
    title: 'Egg Hunt Helper',
    text: 'Egg Hunt Helper',
    icon: 'https://www.mousehuntgame.com/images/items/convertibles/transparent_thumb/887162c61d0e01985ffc12e41c03d952.png',
    position: 'prepend',
    action: (e) => {
      e.preventDefault();
      openEggHelper();
    },
  });
};
