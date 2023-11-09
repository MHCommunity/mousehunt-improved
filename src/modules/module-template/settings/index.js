import { addMhuiSetting } from '../../utils';

export default function (module) {
  addMhuiSetting(
    'example-setting',
    'Example Setting',
    true,
    'This is an example setting.',
    module
  );
}
