import { cacheGet, cacheSet, makeElement, onNavigation } from '@utils';

const addEggMasterIcon = async () => {
  const eggMasterIcon = makeElement('div', ['eggMasterIcon', 'mousehuntTooltipParent', 'mh-improved-egg-master-icon']);
  eggMasterIcon.title = 'Egg Master';

  const tooltip = makeElement('div', ['mousehuntTooltip', 'bottom', 'noEvents']);
  const tooltipText = makeElement('div', ['userInteractionButtonsView-button-label'], 'Egg Master');
  const tooltipArrow = makeElement('div', ['mousehuntTooltip-arrow']);
  tooltip.append(tooltipText, tooltipArrow);
  eggMasterIcon.append(tooltip);

  const container = document.querySelector('.hunterInfoView-idCardBlock');
  if (container) {
    container.append(eggMasterIcon);
  }
};

/**
 * Reorder the blocks on the friends page.
 */
const checkForEggMaster = async () => {
  const snuidEl = document.querySelector('.hunterInfoView-friendsBlock .userInteractionButtonsView-action[data-recipient-snuid]');
  let snuid = snuidEl ? snuidEl.getAttribute('data-recipient-snuid') : false;
  if (! snuid && document.querySelector('.friendsProfileView-selfStats')) {
    snuid = user.sn_user_id;
  }

  const isCachedEggMaster = await cacheGet(`eggmaster-${snuid}`, false);
  if (isCachedEggMaster) {
    addEggMasterIcon();
  } else {
    hg.utils.User.getUserData([snuid], ['is_egg_master'], (data) => {
      const isEggMaster = data[0] && data[0].is_egg_master;
      if (isEggMaster) {
        addEggMasterIcon();
      }

      cacheSet(`eggmaster-${snuid}`, isEggMaster);
    });
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  onNavigation(checkForEggMaster, {
    page: 'hunterprofile',
  });
};
