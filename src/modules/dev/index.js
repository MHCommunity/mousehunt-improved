import * as Utils from '../utils';

const main = () => {
  // Ad all the stuff from Utils to be accessible in the console as 'app.mhutils'
  window.app = window.app || {};
  window.app.mhutils = Utils;
};

export default main;
