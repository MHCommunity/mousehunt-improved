import maps from './modules/maps';
import journal from './modules/journal';
import misc from './modules/misc';
import onlyOpenMultiple from './modules/only-open-multiple';

const modules = [
  {
    id: 'mh-ui-disable-minor-fixes',
    name: 'Disable minor fixes',
    default: false,
    description: '',
    load: misc
  },
  {
    id: 'mh-ui-journal',
    name: 'Cleaned up Journal',
    default: true,
    description: '',
    load: journal
  },
  {
    id: 'mh-ui-only-open-multiple',
    name: 'Only allow opening an item if you have multiple',
    default: false,
    description: '',
    load: onlyOpenMultiple
  },
  {
    id: 'mh-ui-maps',
    name: 'Better maps',
    default: true,
    description: '',
    load: maps
  },
];

modules.forEach(setting => {
  addSetting(setting.name, setting.id, setting.default, setting.description, { id: 'mh-ui', name: 'MH UI Settings'});

  const isEnabled = getSetting(setting.id, setting.default);
  if (isEnabled) {
    setting.load();
  }
});
