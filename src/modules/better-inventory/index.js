import { addUIStyles } from '../utils';
import styles from './styles.css';
import recipes from './recipes';

const setOpenQuantityOnClick = (attempts = 0) => {
  const qty = document.querySelector('.itemView-action-convertForm');
  if (! qty) {
    if (attempts > 10) {
      return;
    }

    setTimeout(() => {
      setOpenQuantityOnClick(attempts + 1);
    }, 200);
    return;
  }

  qty.addEventListener('click', (e) => {
    if (e.target.tagName === 'DIV') {
      const textQty = e.target.innerText;
      const qtyArray = textQty.split(' ');
      let maxNum = qtyArray[qtyArray.length - 1];
      maxNum = maxNum.replace('Submit', '');
      maxNum = parseInt(maxNum);

      const input = document.querySelector('.itemView-action-convert-quantity');
      input.value = maxNum;
    }
  });
};

const addOpenAllButtons = async () => {
  const items = document.querySelectorAll('.inventoryPage-item.convertible') || [];
  items.forEach((item) => {
    const quantity = parseInt(item.querySelector('.quantity') || 0);
    if (quantity <= 2) {
      return;
    }

    const buttons = item.querySelector('.inventoryPage-item-content-action');

    const openAllButOneButton = makeElement('input', 'inventoryPage-item-button button', 'Open All But One');
    openAllButOneButton.addEventListener('click', () => {
      // On click we want to open the dialog and then set the quantity to the quantity - 1 and then submit the form.
      app.pages.InventoryPage.useItem(item); // eslint-disable-line no-undef
      // wait for the dialog to open
      onDialogShow(() => {
        console.log('dialog shown');
      }, 'itemViewContainer.convertible');
    });
  });
};

const addOpenAllToConvertibleDialog = () => {
  const action = document.querySelector('.itemView-action convertible .mouseHunActionButton');
  if (! action) {

  }
};

const addOpenAlltoConvertiblePage = () => {
  console.log('addOpenAlltoConvertiblePage');
  addOpenAlltoConvertible();
};

const main = () => {
  // onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  // if ('item' === getCurrentPage()) {
  //   setOpenQuantityOnClick();
  // }

  // addOpenAlltoConvertiblePage();

  // onNavigation(addOpenAlltoConvertiblePage, {
  //   page: 'inventory',
  //   subpage: 'item'
  // });

  onEvent('js_dialog_show', addOpenAllToConvertibleDialog);
};

export default () => {
  addUIStyles(styles);
  recipes();
};
