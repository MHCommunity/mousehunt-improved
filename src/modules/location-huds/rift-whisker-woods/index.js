import { addHudStyles, makeElement, onRequest } from '@utils';

import styles from './styles.css';

let hasHiddenTauntingWarning = false;
const showTauntingWarning = () => {
  const existing = document.querySelector('.mhui-taunting-warning');
  if (existing) {
    return;
  }

  const baitWarning = document.querySelector('.riftWhiskerWoodsHUD-bossBaitWarning');
  if (! baitWarning) {
    return;
  }

  console.log('showing taunting warning');

  if (hasHiddenTauntingWarning) {
    console.log('has hidden taunting warning');
    return;
  }

  // clone the existing warning
  const warning = baitWarning.cloneNode(true);
  warning.classList.add('mhui-taunting-warning', 'active');
  warning.innerHTML = 'You don\'t have a Taunting Charm equipped! You will reset your rage!';

  const warningClose = makeElement('div', 'mhui-taunting-warning-close');
  warningClose.innerHTML = '×';
  warningClose.onclick = (e) => {
    e.preventDefault();
    hasHiddenTauntingWarning = true;
    warning.classList.remove('active');
  };

  warning.append(warningClose);
  baitWarning.after(warning);
};

const checkAndWarnWhenNoTauntingCharm = () => {
  // Bail if taunting is equipped.
  // eslint-disable-next-line eqeqeq
  if ('1647' == user.trinket_item_id) {
    return;
  }

  const rage = {
    clearing: user.quests?.QuestRiftWhiskerWoods?.zones?.clearing?.level || 0,
    lagoon: user.quests?.QuestRiftWhiskerWoods?.zones?.lagoon?.level || 0,
    tree: user.quests?.QuestRiftWhiskerWoods?.zones?.tree?.level || 0,
  };

  if (
    rage.clearing > 48 ||
    rage.lagoon > 48 ||
    rage.tree > 48 ||
    // eslint-disable-next-line eqeqeq
    '1646' == user.bait_item_id // LLC
  ) {
    showTauntingWarning();
  }
};

/**
 * Initialize the module.
 */
export default async () => {
  addHudStyles(styles);

  checkAndWarnWhenNoTauntingCharm();
  onRequest(checkAndWarnWhenNoTauntingCharm);
};
