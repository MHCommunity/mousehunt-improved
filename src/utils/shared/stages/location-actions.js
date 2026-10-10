import { onRequest } from '@utils';

/**
 * Location actions that change a location's stage, keyed by the endpoint the location's HUD sends
 * them to. Some endpoints don't match the environment id (zugzwangs_tower.php).
 */
const locationActions = {
  'environment/afterword_acres.php': ['increment_droid', 'decrement_droid'],
  'environment/ancient_city.php': ['retreat'],
  'environment/bountiful_beanstalk.php': ['plant_vine'],
  'environment/cerulean_skyport.php': ['start_raid', 'start_shipment'],
  'environment/conclusion_cliffs.php': ['start_writing', 'finish_writing_early'],
  'environment/desert_warpath.php': ['enter_portal'],
  'environment/floating_islands.php': ['retreat'],
  'environment/foreword_farm.php': ['start_growing'],
  'environment/fort_rox.php': ['enter_the_night', 'enter_lair'],
  'environment/harbour.php': ['beginSearch', 'claimBooty'],
  'environment/iceberg.php': ['use_drill'],
  'environment/labyrinth.php': ['retreat', 'scramble_intersections', 'make_intersection_choice'],
  'environment/mousoleum.php': ['build_wall', 'destroy_wall'],
  'environment/rift_bristle_woods.php': ['enter_portal', 'retreat'],
  'environment/rift_furoma.php': ['leave_pagoda'],
  'environment/rift_valour.php': ['enter_tower', 'retreat'],
  'environment/table_of_contents.php': ['start_writing', 'claim_book_rewards'],
  'environment/zugzwangs_tower.php': ['reset_and_travel'],
};

/**
 * Do something after a location action that changes the location's stage.
 *
 * @param {Function} callback The callback, passed the response and request.
 */
const onLocationAction = (callback) => {
  for (const [endpoint, actions] of Object.entries(locationActions)) {
    onRequest(endpoint, (response, request) => {
      if (actions.includes(request?.action)) {
        callback(response, request);
      }
    });
  }
};

export { onLocationAction };
