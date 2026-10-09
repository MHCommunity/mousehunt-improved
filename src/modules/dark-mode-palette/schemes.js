/**
 * Full color schemes: a palette with a matching page background, camp background, shield, horn, and HUD.
 *
 * `palette` is a palette from this module. Each entry under `settings` is a module ID and the value to save for its first dropdown, so the values here
 * have to match the options in those modules' settings.
 */
export default {
  birthday: {
    name: 'Birthday',
    palette: 'birthday-frosting',
    settings: {
      'custom-background': 'birthday',
      'custom-camp-background': 'background-blue',
      'custom-shield': 'birthday',
      'custom-horn': 'huntersHornView--seasonalEvent-birthday',
      'custom-hud': 'hud-pink',
    },
  },
  'great-winter-hunt': {
    name: 'Great Winter Hunt',
    palette: 'winter-hunt-snow',
    settings: {
      'custom-background': 'great_winter_hunt',
      'custom-camp-background': 'background-cyan',
      'custom-shield': 'winter_hunt',
      'custom-horn': 'huntersHornView--seasonalEvent-greatWinterHunt',
      'custom-hud': 'hud-cyan',
    },
  },
  halloween: {
    name: 'Halloween',
    palette: 'halloween-pumpkin',
    settings: {
      'custom-background': 'halloween',
      'custom-camp-background': 'night-in-salem',
      'custom-shield': 'halloween',
      'custom-horn': 'huntersHornView--seasonalEvent-halloween',
      'custom-hud': 'night-in-salem',
    },
  },
  'haunted-night': {
    name: 'Haunted night (dark)',
    palette: 'haunted-harvest',
    settings: {
      'custom-background': 'night-in-salem',
      'custom-camp-background': 'background-black',
      'custom-shield': 'halloween-text',
      'custom-horn': 'huntersHornView--seasonalEvent-halloween',
      'custom-hud': 'hud-purple',
    },
  },
  'kings-giveaway': {
    name: "King's Giveaway",
    palette: 'kings-giveaway-velvet',
    settings: {
      'custom-background': 'kings_giveaway',
      'custom-camp-background': 'background-purple',
      'custom-shield': 'color-purple',
      'custom-horn': 'horn-color-purple',
      'custom-hud': 'hud-purple',
    },
  },
  'lunar-new-year': {
    name: 'Lunar New Year',
    palette: 'lunar-lantern',
    settings: {
      'custom-background': 'lunar_new_year',
      'custom-camp-background': 'background-red',
      'custom-shield': 'color-red',
      'custom-horn': 'huntersHornView--seasonalEvent-lunarNewYear',
      'custom-hud': 'hud-red',
    },
  },
  'spring-egg-hunt': {
    name: 'Spring Egg Hunt',
    palette: 'spring-meadow',
    settings: {
      'custom-background': 'spring_hunt',
      'custom-camp-background': 'background-green',
      'custom-shield': 'spring-egg-hunt',
      'custom-horn': 'huntersHornView--seasonalEvent-springEggHunt',
      'custom-hud': 'hud-green',
    },
  },
  valentines: {
    name: "Valentine's",
    palette: 'valentines-blush',
    settings: {
      'custom-background': 'valentines',
      'custom-camp-background': 'background-pink',
      'custom-shield': 'valentines',
      'custom-horn': 'horn-color-pink',
      'custom-hud': 'hud-pink',
    },
  },
  'mint-surf': {
    name: 'Mint surf',
    palette: 'mint-surf',
    settings: {
      'custom-background': 'mint-surf',
      'custom-camp-background': 'mint-surf',
      'custom-shield': 'color-cyan',
      'custom-horn': 'horn-color-cyan',
      'custom-hud': 'hud-teal',
    },
  },
  'flamingo-fling': {
    name: 'Flamingo fling',
    palette: 'flamingo-fling',
    settings: {
      'custom-background': 'flamingo-fling',
      'custom-camp-background': 'background-pink',
      'custom-shield': 'color-cotton-candy',
      'custom-horn': 'horn-color-pink',
      'custom-hud': 'flamingo-fling',
    },
  },
  midnight: {
    name: 'Midnight (dark)',
    palette: 'oled-ink',
    settings: {
      'custom-background': 'midnight',
      'custom-camp-background': 'background-black',
      'custom-shield': 'starry',
      'custom-horn': 'huntersHornView__horn--tournament',
      'custom-hud': 'dark',
    },
  },
};
