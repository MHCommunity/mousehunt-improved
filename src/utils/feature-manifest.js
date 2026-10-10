import { getSetting } from './settings';

/**
 * Load the enabled features from a module's feature manifest.
 *
 * Each feature is `{ id, setting, default, condition, load }`. A feature loads when its
 * `condition` (if any) returns true and its `setting` (if any) is enabled. Features start
 * in manifest order without waiting on each other.
 *
 * @param {Array} featureManifest The features to load.
 *
 * @return {Promise} Resolves once every loaded feature has finished.
 */
const loadFeatures = (featureManifest) => {
  const loading = [];

  for (const feature of featureManifest) {
    if (feature.condition && !feature.condition()) {
      continue;
    }

    if (feature.setting && !getSetting(feature.setting, feature.default)) {
      continue;
    }

    loading.push(feature.load());
  }

  return Promise.all(loading);
};

export { loadFeatures };
