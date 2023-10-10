import { getFlag } from '../utils';
import trollMode from './modules/troll-mode';

export default () => {
  console.log('lol gottem', getFlag('lol-gottem'));
  if (getFlag('lol-gottem')) {
    trollMode();
  }
};
