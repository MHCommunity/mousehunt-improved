import { getFlag } from '../utils';
import trollMode from './modules/troll-mode';

const fillTwttrObject = () => {
  window.twttr = {
    widgets: {
      load: () => {},
      createShareButton: () => {},
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
