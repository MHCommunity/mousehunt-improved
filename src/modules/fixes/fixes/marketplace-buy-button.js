/**
 * Fix for the marketplace buy button.
 */
export default async () => {
  /**
   * Set the order price.
   *
   * @param {number} price The price to set.
   */
  hg.views.MarketplaceView.setOrderPrice = (price) => {
    const input = document.querySelector('.marketplaceView-item-unitPriceWithTariff');
    if (input) {
      input.value = price;
      hg.views.MarketplaceView.blurInput(input);
    }
  };
};
