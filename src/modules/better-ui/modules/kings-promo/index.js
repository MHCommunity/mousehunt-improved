import { onRequest } from "@utils";

/**
 * Change the text in the Kings Calibrator promo.
 */
const kingsPromoTextChange = () => {
  const kingsPromo = document.querySelector('.shopsPage-kingsCalibratorPromo');
  if (kingsPromo) {
    kingsPromo.innerHTML = kingsPromo.innerHTML.replace('and even', 'and');
  }
};

export default async () => {
  onRequest('users/dailyreward.php', kingsPromoTextChange);
};
