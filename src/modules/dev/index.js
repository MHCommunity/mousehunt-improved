import * as Utils from '@utils';
export default {
  id: 'dev',
  name: 'Developer Tools',
  type: 'required',
  load: () => { // eslint-disable-line jsdoc/require-jsdoc
    // Add all the stuff from Utils to be accessible in the console as 'app.mhutils'
    window.app = window.app || {};
    window.app.mhutils = Utils;
  }
};
