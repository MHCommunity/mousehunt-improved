const fixMpBuyButton = () => {
  hg.views.MarketplaceView.setOrderPrice = (price) => {
    const input = document.querySelector('.marketplaceView-item-unitPriceWithTariff');
    if (input) {
      input.value = price;
      hg.views.MarketplaceView.blurInput(input);
    }
  };
};

export default async () => {
  fixMpBuyButton();
};
