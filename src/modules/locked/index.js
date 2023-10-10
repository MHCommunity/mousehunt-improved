import { getFlag } from '../utils';
import trollMode from './modules/troll-mode';

export default () => {
  if (getFlag('lol-gottem')) {
    trollMode();
  }
};
