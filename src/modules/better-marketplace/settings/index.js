import { addMhuiSetting } from '@/utils';

export default function (module) {
  addMhuiSetting(
    'better-marketplace-search-all',
    'Default to showing all items in the marketplace search.',
    false,
    'If disabled, then useless items will be hidden from the search dropdown by default.',
    module
  );
}
