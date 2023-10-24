import { addUIStyles, getMhuiSetting } from '../utils';
import styles from './styles.css';
import onlyOpenMultiple from './only-open-multiple.css';
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

const addOpenAlltoConvertible = () => {
  const form = document.querySelector('.convertible .itemView-action-convertForm');
  if (! form) {
    return;
  }

  if (form.getAttribute('data-open-all-added')) {
    return;
  }

  form.setAttribute('data-open-all-added', true);

  // get the innerHTML and split it on the input tag. then wrap the second match in a span so we can target it
  const formHTML = form.innerHTML;
  const formHTMLArray = formHTML.split(' /');
  // if we dont have a second match, just return
  if (! formHTMLArray[1]) {
    return;
  }

  const formHTMLArray2 = formHTMLArray[1].split('<a');
  if (! formHTMLArray2[1]) {
    return;
  }

  const quantity = formHTMLArray2[0].trim();

  const newFormHTML = `${formHTMLArray[0]}/ <span class="open-all">${quantity}</span><a${formHTMLArray2[1]}`;
  form.innerHTML = newFormHTML;

  const openAll = document.querySelector('.open-all');
  openAll.addEventListener('click', () => {
    const input = form.querySelector('.itemView-action-convert-quantity');
    if (! input) {
      return;
    }

    input.value = quantity;
  });
};

const addOpenAllButOneButton = () => {
  const convertibleItems = document.querySelectorAll('.inventoryPage-item.convertible[data-item-classification="convertible"]');
  if (! convertibleItems.length) {
    return;
  }

  // Remove the existing open all but one buttons.
  const existingButtons = document.querySelectorAll('.open-all-but-one');
  existingButtons.forEach((button) => {
    button.parentNode.removeChild(button);
  });

  convertibleItems.forEach((item) => {
    const button = item.querySelector('.inventoryPage-item-button[data-item-action="all"]');
    if (! button) {
      return;
    }

    const newButton = button.cloneNode(true);
    newButton.classList.add('open-all-but-one');
    newButton.textContent = 'All but One';
    newButton.value = 'All but One';
    newButton.setAttribute('data-item-action', 'single');
    button.parentNode.insertBefore(newButton, button.nextSibling);
    // remove the onclick attribute from this button
    button.onclick = null;
    button.addEventListener('click', (e) => {
      const quantity = item.querySelector('.inventoryPage-item-imageContainer .quantity');
      if (! quantity) {
        return;
      }

      quantity.textContent = parseInt(quantity.textContent, 10) - 1;
      app.pages.InventoryPage.useConvertible(e.target);
    });
  });
};

const inventoryPage = () => {
  if (getMhuiSetting('better-inventory-open-all-but-one', true)) {
    addOpenAllButOneButton();
  }

  if (getMhuiSetting('better-inventory-lock-open-all', false)) {
    addUIStyles(onlyOpenMultiple);
  }

  if ('item' !== getCurrentPage()) {
    return;
  }

  addOpenAlltoConvertible();
};

const addItemViewPopupToCollectibles = () => {
  const collectibles = document.querySelectorAll('.inventoryPage-item.small');
  if (! collectibles.length) {
    return;
  }

  collectibles.forEach((collectible) => {
    const type = collectible.getAttribute('data-item-type');
    if (! type) {
      return;
    }

    const messageItem = collectible.querySelector('.tooltipContent .button');

    collectible.setAttribute('onclick', '');
    collectible.addEventListener('click', (e) => {
      e.preventDefault();
      hg.views.ItemView.show(type);

      const getDesc = (messageItemCopy) => {
        const popup = document.querySelector('.itemViewPopup .itemViewContainer.message_item .itemView-actionContainer');
        if (! popup) {
          return false;
        }

        popup.appendChild(messageItemCopy);
        return true;
      };

      if (messageItem) {
        const messageItemCopy = messageItem.cloneNode(true);

        eventRegistry.addEventListener('js_dialog_show', () => {
          setTimeout(() => {
            getDesc(messageItemCopy);
          }, 250);
        }, null, true);
      }
    });
  });
};

const main = () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

  inventoryPage();
  addItemViewPopupToCollectibles();

  onNavigation(() => {
    inventoryPage();
    addItemViewPopupToCollectibles();
  }, {
    page: 'inventory',
  });

  onEvent('js_dialog_show', addOpenAlltoConvertible);
};

export default () => {
  addUIStyles(styles);
  main();
  recipes();
};
