import { addStyles } from '@utils';

export default async () => {
  const themes = [
    {
      id: 'theme_admirals_ship',
      bottom: 'journal_admirals_ship_wide_bottom.png',
      content: 'journal_admirals_ship_wide_middle.png',
      top: 'journal_admirals_ship_wide_top.png',
      styles: [
        {
          selector: 'top',
          styles: 'height: 44px;'
        },
      ],
    },
    {
      id: 'theme_airship',
      bottom: 'journal_airship_wide_bottom.png',
      content: 'journal_airship_wide_middle.png',
      top: 'journal_airship_wide_top.png',
    },
    {
      id: 'theme_birthday_eight',
      bottom: 'journal_birthday_eight_wide_bottom.png',
      content: 'journal_birthday_eight_wide_middle.png',
      top: 'journal_birthday_eight_wide_top.png',
    },
    {
      id: 'theme_birthday_fifteen',
      bottom: 'journal_birthday_fifteen_bottom.png',
      content: 'journal_birthday_fifteen_wide_middle.png',
      top: 'journal_birthday_fifteen_wide_top.png',
    },
    {
      id: 'theme_birthday_fourteen',
      bottom: 'journal_birthday_fourteen_wide_bottom.png',
      content: 'journal_birthday_fourteen_wide_middle.png',
      top: 'journal_birthday_fourteen_wide_top.png',
    },
    {
      id: 'theme_birthday_nine',
      bottom: 'journal_birthday_nine_wide_bottom.png',
      content: 'journal_birthday_nine_wide_middle.png',
      top: 'journal_birthday_nine_wide_top.png',
    },
    {
      id: 'theme_birthday_seven',
      bottom: 'journal_birthday_seven_wide_bottom.png',
      content: 'journal_birthday_seven_wide_middle.png',
      top: 'journal_birthday_seven_wide_top.png',
    },
    {
      id: 'theme_birthday_six',
      bottom: 'journal_birthday_six_wide_bottom.png',
      content: 'journal_birthday_six_wide_middle.png',
      top: 'journal_birthday_six_wide_top.png',
    },
    {
      id: 'theme_birthday_ten',
      bottom: 'journal_birthday_ten_wide_bottom.png',
      content: 'journal_birthday_ten_wide_middle.png',
      top: 'journal_birthday_ten_wide_top.png',
    },
    {
      id: 'theme_birthday_thirteen',
      bottom: 'journal_birthday_thirteen_wide_bottom.png',
      content: 'journal_birthday_thirteen_wide_middle.png',
      top: 'journal_birthday_thirteen_wide_top.png',
    },
    {
      id: 'theme_bountiful_beanstalk',
      bottom: 'journal_bountiful_beanstalk_wide_bottom.png',
      content: 'journal_bountiful_beanstalk_wide_middle.png',
      top: 'journal_bountiful_beanstalk_wide_top.png',
    },
    {
      id: 'theme_bristle_woods_rift',
      bottom: 'journal_bristle_woods_rift_wide_bottom.png',
      content: 'journal_bristle_woods_rift_wide_middle.png',
      top: 'journal_bristle_woods_rift_wide_top.png',
    },
    {
      id: 'theme_burroughs_rift',
      bottom: 'journal_burroughs_rift_wide_bottom.png',
      content: 'journal_burroughs_rift_wide_middle.png',
      top: 'journal_burroughs_rift_wide_top.png',
    },
    {
      id: 'theme_chrome',
      bottom: 'journal_chrome_wide_bottom.png',
      content: 'journal_chrome_wide_middle.png',
      top: 'journal_chrome_wide_top.png',
    },
    {
      id: 'theme_football',
      bottom: 'journal_football_wide_bottom.png',
      content: 'journal_football_wide_middle.png',
      top: 'journal_football_wide_top.png',
    },
    {
      id: 'theme_fungal',
      bottom: 'journal_fungal_wide_bottom.png',
      content: 'journal_fungal_wide_middle.png',
      top: 'journal_fungal_wide_top.png',
    },
    {
      id: 'theme_ghostship',
      bottom: 'journal_ghostship_wide_bottom.png',
      content: 'journal_ghostship_wide_middle.png',
      top: 'journal_ghostship_wide_top.png',
    },
    {
      id: 'theme_gloomy_greenwood',
      bottom: 'journal_gloomy_greenwood_wide_bottom.png',
      content: 'journal_gloomy_greenwood_wide_middle.png',
      top: 'journal_gloomy_greenwood_wide_top.png',
    },
    {
      id: 'theme_gnawnian_games',
      bottom: 'journal_gnawnian_games_wide_bottom.png',
      content: 'journal_gnawnian_games_wide_middle.png',
      top: 'journal_gnawnian_games_wide_top.png',
    },
    {
      id: 'theme_halloween_2013',
      bottom: 'journal_halloween_2013_wide_bottom.png',
      content: 'journal_halloween_2013_wide_middle.png',
      top: 'journal_halloween_2013_wide_top.png',
    },
    {
      id: 'theme_halloween_2014',
      bottom: 'journal_halloween_2014_wide_bottom.png',
      content: 'journal_halloween_2014_wide_middle.png',
      top: 'journal_halloween_2014_wide_top.png',
    },
    {
      id: 'theme_halloween_2019',
      bottom: 'journal_halloween_2019_wide_bottom.png',
      content: 'journal_halloween_2019_wide_middle.png',
      top: 'journal_halloween_2019_wide_top.png',
    },
    {
      id: 'theme_labyrinth',
      bottom: 'journal_labyrinth_wide_bottom.png',
      content: 'journal_labyrinth_wide_middle.png',
      top: 'journal_labyrinth_wide_top.png',
    },
    {
      id: 'theme_lightning_slayer',
      bottom: 'journal_lightning_slayer_wide_bottom.png',
      content: 'journal_lightning_slayer_wide_middle.png',
      top: 'journal_lightning_slayer_wide_top.png',
    },
    {
      id: 'theme_living_garden',
      bottom: 'journal_living_garden_wide_bottom.png',
      content: 'journal_living_garden_wide_middle.png',
      top: 'journal_living_garden_wide_top.png',
      styles: [
        {
          selector: 'top',
          styles: 'height: 25px; background-size: contain;'
        },
      ],
    },
    {
      id: 'theme_lny_2019',
      bottom: 'journal_lny_2019_wide_bottom.png',
      content: 'journal_lny_2019_wide_middle.png',
      top: 'journal_lny_2019_wide_top.png',
    },
    {
      id: 'theme_lny_2020',
      bottom: 'journal_lny_2020_wide_bottom.png',
      content: 'journal_lny_2020_wide_middle.png',
      top: 'journal_lny_2020_wide_top.png',
    },
    {
      id: 'theme_lny_2021',
      bottom: 'journal_lny_2021_wide_bottom.png',
      content: 'journal_lny_2021_wide_middle.png',
      top: 'journal_lny_2021_wide_top.png',
    },
    {
      id: 'theme_lny_2022',
      bottom: 'journal_lny_2022_wide_bottom.png',
      content: 'journal_lny_2022_wide_middle.png',
      top: 'journal_lny_2022_wide_top.png',
    },
    {
      id: 'theme_lny_2023',
      bottom: 'journal_lny_2023_wide_bottom.png',
      content: 'journal_lny_2023_wide_middle.png',
      top: 'journal_lny_2023_wide_top.png',
    },
    {
      id: 'theme_lny_2024',
      bottom: 'journal_lny_2024_wide_bottom.png',
      content: 'journal_lny_2024_wide_middle.png',
      top: 'journal_lny_2024_wide_top.png',
    },
    {
      id: 'theme_mega_tournament',
      bottom: 'journal_mega_tournament_wide_bottom.png',
      content: 'journal_mega_tournament_wide_middle.png',
      top: 'journal_mega_tournament_wide_top.png',
    },
    {
      id: 'theme_moussu_picchu',
      bottom: 'journal_moussu_picchu_wide_bottom.png',
      content: 'journal_moussu_picchu_wide_middle.png',
      top: 'journal_moussu_picchu_wide_top.png',
    },
    {
      id: 'theme_party_charm',
      bottom: 'journal_party_charm_wide_bottom.png',
      content: 'journal_party_charm_wide_middle.png',
      top: 'journal_party_charm_wide_top.png',
    },
    {
      id: 'theme_pillowcase',
      bottom: 'journal_pillowcase_wide_bottom.png',
      content: 'journal_pillowcase_wide_middle.png',
      top: 'journal_pillowcase_wide_top.png',
    },
    {
      id: 'theme_polluted',
      bottom: 'journal_polluted_wide_bottom.png',
      content: 'journal_polluted_wide_middle.png',
      top: 'journal_polluted_wide_top.png',
    },
    {
      id: 'theme_pumpkin_patch',
      bottom: 'journal_pumpkin_patch_wide_bottom.png',
      content: 'journal_pumpkin_patch_wide_middle.png',
      top: 'journal_pumpkin_patch_wide_top.png',
    },
    {
      id: 'theme_queso_canyon',
      bottom: 'journal_queso_canyon_wide_bottom.png',
      content: 'journal_queso_canyon_wide_middle.png',
      top: 'journal_queso_canyon_wide_top.png',
    },
    {
      id: 'theme_regal',
      bottom: 'journal_regal_wide_bottom.png',
      content: 'journal_regal_wide_middle.png',
      top: 'journal_regal_wide_top.png',
    },
    {
      id: 'theme_relic_hunter',
      bottom: 'journal_relic_hunter_wide_bottom.png',
      content: 'journal_relic_hunter_wide_middle.png',
      top: 'journal_relic_hunter_wide_top.png',
    },
    {
      id: 'theme_rift_hallowen',
      bottom: 'journal_rift_halloween_wide_bottom.png',
      content: 'journal_rift_halloween_wide_middle.png',
      top: 'journal_rift_halloween_wide_top.png',
    },
    {
      id: 'theme_snow_golem',
      bottom: 'journal_snow_golem_wide_bottom.png',
      content: 'journal_snow_golem_wide_middle.png',
      top: 'journal_snow_golem_wide_top.png',
    },
    {
      id: 'theme_spring_hunt_2021',
      bottom: 'journal_spring_hunt_2021_wide_bottom.png',
      content: 'journal_spring_hunt_2021_wide_middle.png',
      top: 'journal_spring_hunt_2021_wide_top.png',
    },
    {
      id: 'theme_super_brie_factory',
      bottom: 'journal_super_brie_factory_wide_bottom.png',
      content: 'journal_super_brie_factory_wide_middle.png',
      top: 'journal_super_brie_factory_wide_top.png',
    },
    {
      id: 'theme_table_of_contents',
      bottom: 'journal_table_of_contents_wide_bottom.png',
      content: 'journal_table_of_contents_wide_middle.png',
      top: 'journal_table_of_contents_wide_top.png',
    },
    {
      id: 'theme_western',
      bottom: 'journal_western_wide_bottom.png',
      content: 'journal_western_wide_middle.png',
      top: 'journal_western_wide_top.png',
      styles: [
        {
          selector: 'top',
          styles: 'height: 25px;'
        },
      ],
    },
    {
      id: 'theme_winter_hunt_2012',
      bottom: 'journal_winter_hunt_2012_wide_bottom.png',
      content: 'journal_winter_hunt_2012_wide_middle.png',
      top: 'journal_winter_hunt_2012_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2013',
      bottom: 'journal_winter_hunt_2013_wide_bottom.png',
      content: 'journal_winter_hunt_2013_wide_middle.png',
      top: 'journal_winter_hunt_2013_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2014',
      bottom: 'journal_winter_hunt_2014_wide_bottom.png',
      content: 'journal_winter_hunt_2014_wide_middle.png',
      top: 'journal_winter_hunt_2014_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2015',
      bottom: 'journal_winter_hunt_2015_wide_bottom.png',
      content: 'journal_winter_hunt_2015_wide_middle.png',
      top: 'journal_winter_hunt_2015_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2016',
      bottom: 'journal_winter_hunt_2016_wide_bottom.png',
      content: 'journal_winter_hunt_2016_wide_middle.png',
      top: 'journal_winter_hunt_2016_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2018',
      bottom: 'journal_winter_hunt_2018_wide_bottom.png',
      content: 'journal_winter_hunt_2018_wide_middle.png',
      top: 'journal_winter_hunt_2018_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2019',
      bottom: 'journal_winter_hunt_2019_wide_bottom.png',
      content: 'journal_winter_hunt_2019_wide_middle.png',
      top: 'journal_winter_hunt_2019_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2020',
      bottom: 'journal_winter_hunt_2020_wide_bottom.png',
      content: 'journal_winter_hunt_2020_wide_middle.png',
      top: 'journal_winter_hunt_2020_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2021',
      bottom: 'journal_winter_hunt_2021_wide_bottom.png',
      content: 'journal_winter_hunt_2021_wide_middle.png',
      top: 'journal_winter_hunt_2021_wide_top.png',
    },
    {
      id: 'theme_winter_hunt_2022',
      bottom: 'journal_winter_hunt_2022_wide_bottom.png',
      content: 'journal_winter_hunt_2022_wide_middle.png',
      top: 'journal_winter_hunt_2022_wide_top.png',
    },
  ];

  let styles = '';
  themes.forEach((theme) => {
    styles += `.journal.${theme.id} .top { background: url(https://www.mousehuntgame.com/images/ui/journal/themes/${theme.top}) no-repeat bottom center / cover; }`;
    styles += `.journal.${theme.id} .content { background: url(https://www.mousehuntgame.com/images/ui/journal/themes/${theme.content}) repeat-y left top / contain; }`;
    styles += `.journal.${theme.id} .bottom { background: url(https://www.mousehuntgame.com/images/ui/journal/themes/${theme.bottom}) no-repeat bottom center / cover; }`;

    if (theme.styles) {
      theme.styles.forEach((style) => {
        styles += `.journal.${theme.id} .${style.selector} { ${style.styles} }`;
      });
    }
  });

  addStyles(styles, 'image-upscaling-journal-themes');
};
