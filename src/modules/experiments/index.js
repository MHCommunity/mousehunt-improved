import settings from './settings';

const init = () => {};

export default {
  id: 'experiments',
  name: 'Experiments',
  description: 'Upcoming features and experiments.',
  type: 'beta',
  default: true,
  order: -1,
  load: init,
  settings
};
