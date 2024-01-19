import { addStyles } from '@utils';

import animationStyles from './animations.css';
import buttonStyles from './buttons.css';
import errorPageStyles from './error-page.css';
import errorStyles from './errors.css';
import generalStyles from './general.css';
import messagesStyles from './messages.css';
import tooltipsStyles from './tooltips.css';
import utilityStyles from './utility.css';

/**
 * Initialize the module.
 */
const init = async () => {
  addStyles([
    animationStyles,
    buttonStyles,
    errorPageStyles,
    errorStyles,
    generalStyles,
    messagesStyles,
    tooltipsStyles,
    utilityStyles,
  ]);
};

export default {
  id: 'global-styles',
  type: 'required',
  load: init,
};
