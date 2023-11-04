import { addMhuiSetting } from '../../utils';

export default function (module) {
  addMhuiSetting(
    'better-journal-privacy',
    'Hide player names in journal entries',
    true,
    'Hides player names in the journal. Good for screenshots that won\'t dox them.',
    module
  );
}
