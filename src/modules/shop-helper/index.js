import styles from './styles.css';

const main = () => {
  const golds = document.querySelectorAll('.itemPurchaseView-action-goldGost')
  if (golds) {
    golds.forEach((gold) => {
      gold.innerText = gold.innerText.replace( 'Cost:', '' )
    })
  }

  const buyBtns = document.querySelectorAll('.itemPurchaseView-action-form-button.buy')
  if (buyBtns) {
    buyBtns.forEach((btn) => {
      btn.classList.add('mousehuntActionButton');
      btn.innerHTML = '<span>Buy</span>'
    })
  }

  const sellBtns = document.querySelectorAll('.itemPurchaseView-action-form-button.sell')
  if (sellBtns) {
    sellBtns.forEach((btn) => {
      btn.classList.add('mousehuntActionButton');
      btn.classList.add('lightBlue');
      btn.innerHTML = '<span>Sell</span>'
    })
  }

  const purchaseBlocks = document.querySelectorAll('.itemPurchaseView-action-state.view')
  if (purchaseBlocks) {
    purchaseBlocks.forEach((block) => {
      const qty = block.querySelector('.itemPurchaseView-action-maxPurchases')
      if (!qty) return
      let maxQty = qty.innerText

      if (maxQty.includes('Inventory max')) {
        maxQty = 0;
      }

      const input = block.querySelector('input')
      if (!input) return
      // input.setAttribute('placeholder', `You can afford ${parseInt(maxQty)}`)
      input.setAttribute('placeholder', parseInt(maxQty))
    })
  }

  const owned = document.querySelectorAll('.itemPurchaseView-action-purchaseHelper-owned')
  if (owned) {
    owned.forEach((owned) => {
      let ownText = owned.innerHTML.replace('You own:', 'Own: ')
      ownText = ownText.replace('( (', '( ')
      ownText = ownText.replace(') )', ' )')
      owned.innerHTML = `(${ownText} )`
    })
  }

  const kingsCart = document.querySelectorAll('.itemPurchaseView-container.kingsCartItem')
  if (kingsCart) {
    kingsCart.forEach((cart) => {
      cart.classList.remove('kingsCartItem')
    })
  }

  const shopQty = document.querySelectorAll('.itemPurchaseView-action-quantity input');
  if (!shopQty) return;

  shopQty.forEach((qty) => {
    qty.setAttribute('maxlength', '100');
  });
};

export default function shopHelper() {
  addStyles(styles);

  main();
  onPageChange({ change: main });
}
