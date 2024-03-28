/**
 * Dashboard output.
 *
 * @param {Object} quests The quests data.
 *
 * @return {string} The dashboard output.
 */
export default (quests) => {
  if (! quests.QuestBountifulBeanstalk) {
    return '';
  }

  if (quests?.QuestBountifulBeanstalk?.in_castle) {
    // Castle text
    const room = quests?.QuestBountifulBeanstalk?.castle?.current_room?.name || '';
    const floor = quests?.QuestBountifulBeanstalk?.castle?.current_floor?.name || false;
    const huntsRemaining = quests?.QuestBountifulBeanstalk?.castle?.hunts_remaining_text || '';
    const isBoss = quests?.QuestBountifulBeanstalk?.castle?.is_boss_encounter || false;
    const isChase = quests?.QuestBountifulBeanstalk?.castle?.is_boss_chase || false;
    const noise = quests?.QuestBountifulBeanstalk?.castle?.noise_level || 0;
    const noiseFormatted = noise.toLocaleString();
    const maxNoise = quests?.QuestBountifulBeanstalk?.castle?.max_noise_level || 0;
    const maxNoiseFormatted = maxNoise.toLocaleString();
    const embellishments = quests?.QuestBountifulBeanstalk?.embellishments.map((item) => {
      return item.is_active ? item.name : null;
    }).filter((item) => item !== null);

    const noiseString = isBoss ? 'Boss' : (isChase ? 'Chase' : `Noise: ${noiseFormatted}/${maxNoiseFormatted}`);
    const floorText = floor ? `(${floor.replace(/ Floor$/, '')})` : '';

    return `${room} ${floorText}<div class="stats">${noiseString} · ${huntsRemaining}</div><div class="embelishments">${embellishments.join(', ')}</div>`;
  }

  const room = quests?.QuestBountifulBeanstalk?.beanstalk?.current_zone?.name || '';
  const huntsRemaining = quests?.QuestBountifulBeanstalk?.beanstalk?.hunts_remaining_text || '';
  const isBoss = quests?.QuestBountifulBeanstalk?.beanstalk?.is_boss_encounter || false;

  return `${room} (Beanstalk) <div class="stats">${isBoss ? 'At Boss' : ''} · ${huntsRemaining}</div>`;
};

// {
//   "is_fuel_enabled": false,
//   "can_enable_fuel": true,
//   "items": {
//       "condensed_creativity_stat_item": {
//           "quantity": "1,201",
//           "quantity_unformatted": 1201,
//           "status": "",
//           "is_highlighted": false
//       },
//       "magic_essence_craft_item": {
//           "quantity": "15,000",
//           "quantity_unformatted": 15000,
//           "status": "",
//           "is_highlighted": false
//       },
//       "magic_bean_stat_item": {
//           "quantity": "7,911",
//           "quantity_unformatted": 7911,
//           "status": "",
//           "is_highlighted": false
//       },
//       "lavish_lapis_bean_stat_item": {
//           "quantity": "15,512",
//           "quantity_unformatted": 15512,
//           "status": "",
//           "is_highlighted": false
//       },
//       "royal_ruby_bean_stat_item": {
//           "quantity": "35,214",
//           "quantity_unformatted": 35214,
//           "status": "",
//           "is_highlighted": true
//       },
//       "fabled_fertilizer_stat_item": {
//           "quantity": "1,437",
//           "quantity_unformatted": 1437,
//           "status": "",
//           "is_highlighted": false
//       },
//       "golden_goose_feather_stat_item": {
//           "quantity": 4,
//           "quantity_unformatted": 4,
//           "status": "",
//           "is_highlighted": false
//       },
//       "giant_golden_key_stat_item": {
//           "quantity": 16,
//           "quantity_unformatted": 16,
//           "status": "",
//           "is_highlighted": false
//       },
//       "golden_goose_egg_stat_item": {
//           "quantity": "98,986",
//           "quantity_unformatted": 98986,
//           "status": "",
//           "is_highlighted": false
//       },
//       "golden_harp_string_stat_item": {
//           "quantity": "47,634",
//           "quantity_unformatted": 47634,
//           "status": "",
//           "is_highlighted": false
//       },
//       "golden_goose_stat_item": {
//           "quantity": 0,
//           "quantity_unformatted": 0,
//           "status": "disabled",
//           "is_highlighted": false
//       },
//       "gold_stat_item": {
//           "quantity": "98,811,628",
//           "quantity_unformatted": 98811628,
//           "status": "",
//           "is_highlighted": false
//       },
//       "toxic_brie_cheese": {
//           "quantity": 607,
//           "quantity_unformatted": 607,
//           "status": "",
//           "is_highlighted": false
//       },
//       "brie_cheese": {
//           "quantity": "4,375",
//           "quantity_unformatted": 4375,
//           "status": "",
//           "is_highlighted": false
//       },
//       "gouda_cheese": {
//           "quantity": "3,225",
//           "quantity_unformatted": 3225,
//           "status": "",
//           "is_highlighted": false
//       },
//       "super_brie_cheese": {
//           "quantity": "9,653",
//           "quantity_unformatted": 9653,
//           "status": "",
//           "is_highlighted": false
//       },
//       "toxic_super_brie_cheese": {
//           "quantity": "3,510",
//           "quantity_unformatted": 3510,
//           "status": "",
//           "is_highlighted": false
//       },
//       "beanster_cheese": {
//           "quantity": 163,
//           "quantity_unformatted": 163,
//           "status": "active",
//           "is_highlighted": false,
//           "can_purchase": true,
//           "is_discouraged": false
//       },
//       "lavish_beanster_cheese": {
//           "quantity": 915,
//           "quantity_unformatted": 915,
//           "status": "",
//           "is_highlighted": false,
//           "can_purchase": true,
//           "is_discouraged": false
//       },
//       "leaping_lavish_beanster_cheese": {
//           "quantity": 244,
//           "quantity_unformatted": 244,
//           "status": "",
//           "is_highlighted": false,
//           "can_purchase": true,
//           "is_discouraged": false
//       },
//       "royal_beanster_cheese": {
//           "quantity": 30,
//           "quantity_unformatted": 30,
//           "status": "",
//           "is_highlighted": false,
//           "can_purchase": true,
//           "is_discouraged": false
//       }
//   },
//   "loot_multipliers": {
//       "total": 4,
//       "math": [
//           {
//               "type": "cheese",
//               "name": "Cheese",
//               "value": 2,
//               "is_active": true
//           },
//           {
//               "type": "room",
//               "name": "Room",
//               "value": 2,
//               "is_active": true
//           },
//           {
//               "type": "condensed_creativity",
//               "name": "Condensed Creativity",
//               "value": 1,
//               "is_active": null
//           },
//           {
//               "type": "boss",
//               "name": "Giant Chase",
//               "value": 1,
//               "is_active": null
//           },
//           {
//               "type": "feather",
//               "name": "Golden Goose Feather",
//               "value": 1,
//               "is_active": null
//           }
//       ],
//       "has_multiplier": true
//   },
//   "in_castle": true,
//   "beanstalk": {
//       "current_zone": {
//           "name": "Super Zone",
//           "level": "super",
//           "loot_multiplier": 2
//       },
//       "next_zone": {
//           "name": "Extreme Zone",
//           "level": "extreme",
//           "loot_multiplier": 4
//       },
//       "zone_position": 2,
//       "zone_length": 20,
//       "path": [
//           {
//               "id": 0,
//               "state": "past",
//               "marker_state": null,
//               "top": 0
//           },
//           {
//               "id": 1,
//               "state": "past",
//               "marker_state": null,
//               "top": -10
//           },
//           {
//               "id": 2,
//               "state": "current",
//               "marker_state": "player_marker",
//               "top": -20
//           },
//           {
//               "id": 3,
//               "state": "future",
//               "marker_state": null,
//               "top": -30
//           },
//           {
//               "id": 4,
//               "state": "future",
//               "marker_state": null,
//               "top": -40
//           },
//           {
//               "id": 5,
//               "state": "future",
//               "marker_state": null,
//               "top": -50
//           },
//           {
//               "id": 6,
//               "state": "future",
//               "marker_state": null,
//               "top": -60
//           },
//           {
//               "id": 7,
//               "state": "future",
//               "marker_state": null,
//               "top": -70
//           },
//           {
//               "id": 8,
//               "state": "future",
//               "marker_state": null,
//               "top": -80
//           },
//           {
//               "id": 9,
//               "state": "future",
//               "marker_state": null,
//               "top": -90
//           },
//           {
//               "id": 10,
//               "state": "future",
//               "marker_state": null,
//               "top": -100
//           },
//           {
//               "id": 11,
//               "state": "future",
//               "marker_state": null,
//               "top": -110
//           },
//           {
//               "id": 12,
//               "state": "future",
//               "marker_state": null,
//               "top": -120
//           },
//           {
//               "id": 13,
//               "state": "future",
//               "marker_state": null,
//               "top": -130
//           },
//           {
//               "id": 14,
//               "state": "future",
//               "marker_state": null,
//               "top": -140
//           },
//           {
//               "id": 15,
//               "state": "future",
//               "marker_state": null,
//               "top": -150
//           },
//           {
//               "id": 16,
//               "state": "future",
//               "marker_state": null,
//               "top": -160
//           },
//           {
//               "id": 17,
//               "state": "future",
//               "marker_state": null,
//               "top": -170
//           },
//           {
//               "id": 18,
//               "state": "future",
//               "marker_state": null,
//               "top": -180
//           },
//           {
//               "id": 19,
//               "state": "future",
//               "marker_state": null,
//               "top": -190
//           }
//       ],
//       "is_boss_encounter": false,
//       "can_plant_vine": null,
//       "hunts_remaining": 19,
//       "hunts_remaining_text": "19 hunts"
//   },
//   "castle": {
//       "is_boss_chase": false,
//       "is_boss_encounter": false,
//       "noise_level": 4,
//       "max_noise_level": 400,
//       "noise_level_percent": 1,
//       "current_floor": {
//           "type": "ballroom_floor",
//           "name": "Ballroom Floor",
//           "boss_type": "malevolent_maestro",
//           "boss_name": "Malevolent Maestro"
//       },
//       "current_room": {
//           "type": "ruby_bean_super_room",
//           "name": "Super Royal Ruby Bean Room",
//           "level": "super",
//           "loot_multiplier": 2,
//           "loot": {
//               "items": [
//                   {
//                       "type": "royal_ruby_bean_stat_item",
//                       "name": "Royal Ruby Bean",
//                       "thumb_transparent": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/c5b85aa5e8c9d67070f96a82a9b0038d.png?cv=3"
//                   }
//               ],
//               "is_single_item": true
//           }
//       },
//       "next_room": {
//           "type": "string_extreme_room",
//           "name": "Extreme Golden Harp String Room",
//           "level": "extreme",
//           "loot_multiplier": 4,
//           "loot": {
//               "items": [
//                   {
//                       "type": "golden_harp_string_stat_item",
//                       "name": "Golden Harp String",
//                       "thumb_transparent": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/efda67fa3181ef6ea95bf41cb7082d6a.png?cv=3"
//                   }
//               ],
//               "is_single_item": true
//           }
//       },
//       "room_position": 1,
//       "room_length": 20,
//       "path": [
//           {
//               "id": 0,
//               "state": "past",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 1,
//               "state": "current",
//               "marker_state": "player_marker",
//               "boss_state": null
//           },
//           {
//               "id": 2,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 3,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 4,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 5,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 6,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 7,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 8,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 9,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 10,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 11,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 12,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 13,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 14,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 15,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 16,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 17,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 18,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           },
//           {
//               "id": 19,
//               "state": "future",
//               "marker_state": null,
//               "boss_state": null
//           }
//       ],
//       "boss_walk_state": "odd",
//       "projected_noise": {
//           "min": 1.5,
//           "max": 2,
//           "actual_min": 2,
//           "actual_max": 4
//       },
//       "can_use_harp_strings": true,
//       "is_auto_harp_enabled": false,
//       "wall_state": "default",
//       "hunts_remaining": 19,
//       "hunts_remaining_text": "19 hunts",
//       "boss_chase_hunts_remaining_text": ""
//   },
//   "vines": [
//       {
//           "type": "short_vine",
//           "name": "Short Vine",
//           "destination_name": "Dungeon Floor",
//           "destination_type": "dungeon_floor",
//           "max_noise_level": 200,
//           "cost": [
//               {
//                   "type": "fabled_fertilizer_stat_item",
//                   "name": "Fabled Fertilizer",
//                   "quantity": 1
//               }
//           ],
//           "can_plant": false,
//           "rooms": [
//               {
//                   "type": "lapis_bean",
//                   "name": "Lavish Lapis Bean Room",
//                   "rarity": "Plentiful",
//                   "loot_image": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/3c25006d3bcde379288367db25f92234.png?cv=3"
//               },
//               {
//                   "type": "magic_bean",
//                   "name": "Magic Bean Room",
//                   "rarity": "Uncommon",
//                   "loot_image": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/2fe750813ff4fcb5fe510a1996958003.png?cv=3"
//               },
//               {
//                   "type": "mystery",
//                   "name": "Mystery Room",
//                   "rarity": "Rare",
//                   "loot_image": false
//               }
//           ]
//       },
//       {
//           "type": "medium_vine",
//           "name": "Medium Vine",
//           "destination_name": "Ballroom Floor",
//           "destination_type": "ballroom_floor",
//           "max_noise_level": 400,
//           "cost": [
//               {
//                   "type": "fabled_fertilizer_stat_item",
//                   "name": "Fabled Fertilizer",
//                   "quantity": 12
//               }
//           ],
//           "can_plant": false,
//           "rooms": [
//               {
//                   "type": "ruby_bean",
//                   "name": "Royal Ruby Bean Room",
//                   "rarity": "Plentiful",
//                   "loot_image": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/c5b85aa5e8c9d67070f96a82a9b0038d.png?cv=3"
//               },
//               {
//                   "type": "string",
//                   "name": "Golden Harp String Room",
//                   "rarity": "Uncommon",
//                   "loot_image": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/efda67fa3181ef6ea95bf41cb7082d6a.png?cv=3"
//               },
//               {
//                   "type": "mystery",
//                   "name": "Mystery Room",
//                   "rarity": "Rare",
//                   "loot_image": false
//               }
//           ]
//       },
//       {
//           "type": "tall_vine",
//           "name": "Tall Vine",
//           "destination_name": "Great Hall Floor",
//           "destination_type": "great_hall_floor",
//           "max_noise_level": 300,
//           "cost": [
//               {
//                   "type": "fabled_fertilizer_stat_item",
//                   "name": "Fabled Fertilizer",
//                   "quantity": 100
//               }
//           ],
//           "can_plant": false,
//           "rooms": [
//               {
//                   "type": "egg",
//                   "name": "Golden Egg Room",
//                   "rarity": "Guaranteed",
//                   "loot_image": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/fed306408239bee0cadb771f166d1a3e.png?cv=3"
//               }
//           ]
//       }
//   ],
//   "standard_bait_choice": "super_brie_cheese",
//   "bait_disarm_preference": "standardBait",
//   "embellishments": [
//       {
//           "type": "golden_key",
//           "name": "Giant's Golden Key",
//           "description": "Removes all Standard rooms from the chosen floor.",
//           "floor_requirement": null,
//           "cost": [
//               {
//                   "type": "giant_golden_key_stat_item",
//                   "name": "Giant's Golden Key",
//                   "image_url": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/e9cba6922945c08a0144ae9b9cb77f48.png?cv=3",
//                   "user_quantity": 16,
//                   "cost_quantity": 1
//               }
//           ],
//           "can_activate": true,
//           "is_active": false
//       },
//       {
//           "type": "golden_feather",
//           "name": "Golden Goose Feather",
//           "description": "Adds a x2 Loot Multiplier or x4 if you've earned the Golden Quill upgrade from the Table of Contents.",
//           "floor_requirement": null,
//           "cost": [
//               {
//                   "type": "golden_goose_feather_stat_item",
//                   "name": "Golden Goose Feather",
//                   "image_url": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/0705d0b6a4e0abd12492cac9aa4b8c8a.png?cv=3",
//                   "user_quantity": 4,
//                   "cost_quantity": 1
//               }
//           ],
//           "can_activate": true,
//           "is_active": false
//       },
//       {
//           "type": "ruby_remover",
//           "name": "Ruby Room Remover",
//           "description": "Removes all Ruby Bean Rooms from the Ballroom.",
//           "floor_requirement": "ballroom_floor",
//           "cost": [
//               {
//                   "type": "royal_ruby_bean_stat_item",
//                   "name": "Royal Ruby Bean",
//                   "image_url": "https://www.mousehuntgame.com/images/items/stats/transparent_thumb/c5b85aa5e8c9d67070f96a82a9b0038d.png?cv=3",
//                   "user_quantity": 35214,
//                   "cost_quantity": 2500
//               }
//           ],
//           "can_activate": true,
//           "is_active": false
//       }
//   ],
//   "max_noise_increase": 396,
//   "max_noise_decrease": 4,
//   "trap_warnings": {
//       "power_type": null,
//       "bait": null,
//       "misc": null
//   },
//   "has_trap_warning": null
// }
