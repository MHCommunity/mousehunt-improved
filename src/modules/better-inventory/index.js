import { addUIStyles, onNavigationPatched } from '../utils';
import styles from './styles.css';

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

      return;
    }

    item.addEventListener('mouseenter', async () => {
      if (item.getAttribute('data-new-tooltip') === 'newTooltip') {
        return;
      }

      item.setAttribute('data-new-tooltip', 'newTooltip');

      if (producedItem.includes(',')) {
        producedItem = producedItem.split(',');
      } else {
        producedItem = [producedItem];
      }

      const itemType = item.getAttribute('data-item-type');
      producedItem.push(itemType);

      const itemData = await getUserItems(producedItem); // eslint-disable-line no-undef
      if (! itemData || ! itemData[0]) {
        return;
      }

      // get the formatted_parts attribute from the itemData array where the type matches the itemType
      const formattedParts = itemData.find((itemDataItem) => itemDataItem.type === itemType).formatted_parts;
      if (! formattedParts) {
        return;
      }

      const tooltipWrapper = makeElement('div', ['newTooltip', 'tooltip']);

      itemData.forEach((itemDataItem) => {
        // get the data in formattedParts where the type matches the itemDataItem.type
        const formattedPart = formattedParts.find((formattedPartItem) => formattedPartItem.type === itemDataItem.type);
        if (! formattedPart) {
          return;
        }

        const name = formattedPart.name;
        const thumb = formattedPart.thumbnail_transparent || itemDataItem.thumbnail;
        let quantity = formattedPart.quantity;

        if ('gold_stat_item' === itemDataItem.type) {
          // convert to k or m
          const quantityInt = parseInt(quantity);
          if (quantityInt >= 1000000) {
            quantity = `${Math.floor(quantityInt / 100000) / 10}m`;
          } else if (quantityInt >= 1000) {
            quantity = `${Math.floor(quantityInt / 100) / 10}k`;
          }
        }

        // const itemTooltip = makeElement('div', 'new-tooltip-item');
        makeElement('div', ['new-tooltip-item', 'inventoryPage-item'], `
        <div class="inventoryPage-item-margin clear-block">
          <div class="inventoryPage-item-imageContainer">
            <div class="itemImage"><img src="${thumb}">
              <div class="quantity">${quantity}</div>
            </div>
          </div>
          <div class="inventoryPage-item-content-nameContainer">
            <div class="inventoryPage-item-content-name">
              <span>${name}</span>
            </div>
          </div>
        </div>`, tooltipWrapper);
        // makeElement('div', 'tooltip-title', `<b>${name}</b>`, itemTooltip);
        // makeElement('div', 'tooltip-image', `<img src="${thumb}">`, itemTooltip);
        // tooltipWrapper.appendChild(itemTooltip);
      });

      tooltip.parentNode.insertBefore(tooltipWrapper, tooltip.nextSibling);
    });


  });



    return;
  }

};

};

const main = () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

  addOpenAlltoConvertiblePage();

  onNavigationPatched(addOpenAlltoConvertiblePage, {
    page: 'inventory',
  });

  onEvent('js_dialog_show', addOpenAlltoConvertible);

};

export default () => {
  addUIStyles(styles);
  main();
};
