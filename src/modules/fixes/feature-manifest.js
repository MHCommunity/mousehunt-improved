import itemPage from './modules/item-page';
import marketplaceBuyButton from './modules/marketplace-buy-button';
import passingParcel from './modules/passing-parcel';
import riftTooltipQuantities from './modules/rift-tooltip-quantities';
import teamMemberLinks from './modules/team-member-links';
import trapSelectorDoubleBinding from './modules/trap-selector-double-binding';

const featureManifest = [
  { id: 'item-page', load: itemPage },
  { id: 'marketplace-buy-button', load: marketplaceBuyButton },
  { id: 'passing-parcel', load: passingParcel },
  { id: 'rift-tooltip-quantities', load: riftTooltipQuantities },
  { id: 'team-member-links', load: teamMemberLinks },
  { id: 'trap-selector-double-binding', load: trapSelectorDoubleBinding },
];

export default featureManifest;
