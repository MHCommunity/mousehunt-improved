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

  if (hasHiddenTauntingWarning) {
    return;
  }

  // clone the existing warning
  const warning = baitWarning.cloneNode(true);
  warning.classList.add('mhui-taunting-warning', 'active');
  warning.innerHTML = 'You don\'t have a Taunting Charm equipped! You may reset your rage!';

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

  const rage = [
    user.quests?.QuestRiftWhiskerWoods?.zones?.clearing?.level || 0,
    user.quests?.QuestRiftWhiskerWoods?.zones?.lagoon?.level || 0,
    user.quests?.QuestRiftWhiskerWoods?.zones?.tree?.level || 0,
  ];

  const rage48 = rage.filter((val) => val >= 48).length;
  const rage49 = rage.filter((val) => val >= 49).length;
  const rage50 = rage.filter((val) => val >= 50).length;

  if (
    rage48 === 3 || // If all 3 are 48.
    rage49 === 2 || // If 2 are 49.
    rage50 === 1 || // If 1 is 50.
    user.bait_item_id == '1646' // eslint-disable-line eqeqeq
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
  onRequest('*', checkAndWarnWhenNoTauntingCharm);
};
