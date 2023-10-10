import { getFlag } from '../utils';
import trollMode from './modules/troll-mode';

const fillTwttrObject = () => {
  window.twttr = {
    widgets: {
      load: () => {},
    },
  };
};

export default () => {
  if (getFlag('lol-gottem')) {
    trollMode();
  }

  if (getFlag('twitter')) {
    fillTwttrObject();
  }
};
