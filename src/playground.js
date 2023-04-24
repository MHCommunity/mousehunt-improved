// makeHornMessage({
//   title: 'This is a title',
//   text: 'This is a message',
//   button: 'OK',
//   action: () => {
//     console.log('This is an action');
//   },
// });

// .mh-airship-popup .content .floatingIslandsAirship {
//   margin: 0 auto;
// }

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

createAirship({
  hull: hulls[Math.floor(Math.random() * hulls.length)],
  sail: sails[Math.floor(Math.random() * sails.length)],
  balloon: balloons[Math.floor(Math.random() * balloons.length)],
});
