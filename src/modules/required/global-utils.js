import * as Utils from '@utils';

/**
 * Add 'app.mhutils' to the global window object.
 */
export default () => {
  window.app = window.app || {};
  window.app.mhutils = Utils;
};
