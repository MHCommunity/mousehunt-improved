import { makeElement, mapData } from '@utils';

let hasClaimGuard = false;

/**
 * Require a second click on the claim consolation prize button, since claiming
 * removes the hunter from the map and can't be undone.
 */
const addClaimConfirmation = () => {
  if (hasClaimGuard) {
    return;
  }

  hasClaimGuard = true;

  let revertTimeout;
  document.addEventListener(
    'click',
    (event) => {
      const button = event.target.closest('.treasureMapView-consolationPrizeButton');
      if (!button) {
        return;
      }

      if (button.classList.contains('mh-improved-confirm-claim')) {
        clearTimeout(revertTimeout);
        button.classList.remove('mh-improved-confirm-claim');
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      button.classList.add('mh-improved-confirm-claim');
      const label = button.querySelector('span') || button;
      const originalText = label.textContent;
      label.textContent = 'Are you sure?';

      revertTimeout = setTimeout(() => {
        button.classList.remove('mh-improved-confirm-claim');
        label.textContent = originalText;
      }, 5000);
    },
    true
  );
};

/**
 * Add consolation prizes to the map view.
 */
export default async () => {
  addClaimConfirmation();

  const consolationButton = document.querySelector('.treasureMapView-consolationPrize-message');
  if (!consolationButton || !mapData().has_consolation_prizes || !mapData().consolation_prizes) {
    return;
  }

  const existing = document.querySelector('.mh-mapper-consolation-prizes');
  if (existing) {
    existing.remove();
  }

  const prizeWrapper = makeElement('div', 'mh-mapper-consolation-prizes');
  const prizes = mapData().consolation_prizes || [];
  for (const prize of prizes) {
    const prizeDiv = makeElement('div', 'mh-mapper-consolation-prize');
    const prizeImg = makeElement('img', 'mh-mapper-consolation-prize');
    prizeImg.src = prize.thumb;
    prizeDiv.append(prizeImg);
    makeElement('div', 'mh-mapper-consolation-prize-text', `${prize.quantity} ${prize.name}`, prizeDiv);

    prizeWrapper.append(prizeDiv);
  }

  consolationButton.parentElement.append(prizeWrapper);
};
