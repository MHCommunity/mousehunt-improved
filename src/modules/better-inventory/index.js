import { addUIStyles } from '../utils';
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

const fixPassingParcel = () => {
  const passingParcel = document.querySelector('.inventoryPage-item[data-item-type="passing_parcel_message_item"]');
  if (! passingParcel) {
    return;
  }

  const quantity = passingParcel.querySelector('.quantity');
  if (! quantity) {
    return;
  }

  const newMarkup = `<div class="inventoryPage-item full convertible " onclick="app.pages.InventoryPage.useItem(this); return false;" data-item-id="1281" data-item-type="passing_parcel_convertible" data-item-classification="convertible" data-name="Passing Parcel" data-display-order="0">
	<div class="inventoryPage-item-margin clear-block">
		<div class="inventoryPage-item-name">
      <a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">
        <abbr title="Passing Parcel">Passing Parcel (collectible)</abbr>
      </a>
    </div>
    <a href="#" class="inventoryPage-item-larryLexicon" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">?</a>
    <div class="inventoryPage-item-imageContainer">
      <div class="itemImage"><a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">
        <img src="https://www.mousehuntgame.com/images/items/message_items/5591e5c34f081715aaca4e95e97a3379.jpg?cv=2"></a>
          <div class="quantity">${quantity.innerText}</div>
        </div>
      </div>
      <div class="inventoryPage-item-contentContainer">
        <div class="inventoryPage-item-content-description">
          <div class="inventoryPage-item-content-description-text">
            This parcel is meant to be passed along to a friend! If a friend sends one to you, tear away a layer and see if there's something inside!
          </div>
          <div class="inventoryPage-item-content-action">
            <input type="button" id="passing-parcel-action" class="inventoryPage-item-button button" value="Pass Along">
          </div>
      </div>
    </div>
  </div>`;

  passingParcel.outerHTML = newMarkup;

  const passingParcelAction = document.querySelector('#passing-parcel-action');
  passingParcelAction.addEventListener('click', () => {
    window.location.href = 'https://www.mousehuntgame.com/supplytransfer.php?item_type=passing_parcel_message_item';
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

const addOpenAlltoConvertiblePage = () => {
  if ('item' !== getCurrentPage()) {
    return;
  }

  addOpenAlltoConvertible();
};

const modifySmashableTooltip = async () => {
  if ('crafting' !== getCurrentTab() || 'hammer' !== getCurrentSubtab()) { // eslint-disable-line no-undef
    return;
  }

  const items = document.querySelectorAll('.inventoryPage-item');
  if (! items) {
    return;
  }

  items.forEach(async (item) => {
    const tooltip = item.querySelector('.tooltip');
    if (! tooltip) {
      return;
    }

    // get the data for the data-produced-item attribute
    let producedItem = item.getAttribute('data-produced-item');
    if (! producedItem) {
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
};

const showCraftWarning = (text) => {
  const confirm = document.querySelector('.mousehuntActionButton.inventoryPage-confirmPopup-suffix-button.confirm');
  if (! confirm) {
    return;
  }

  const existing = document.querySelector('.mhui-craft-warning-tooltip');
  if (existing) {
    existing.remove();
  }

  const tooltip = makeElement('div', 'mhui-craft-warning-tooltip', text);
  confirm.parentNode.appendChild(tooltip);
};

const warnOnBadCrafts = () => {
  const confirm = document.querySelector('.mousehuntActionButton.inventoryPage-confirmPopup-suffix-button.confirm');
  if (! confirm) {
    setTimeout(warnOnBadCrafts, 100);
    return;
  }

  const type = confirm.getAttribute('data-confirm-type');
  if (! type || 'recipe' !== type) {
    return;
  }

  const popup = document.querySelector('.inventoryPage-confirmPopup');
  if (! popup) {
    return;
  }

  const recipe = popup.getAttribute('data-item-type');
  if (! recipe) {
    return;
  }

  // No me.
  // 1D
  // CCC
  // Cherry
  // Gnarled
  // RBC
  // TI Cheese
  // UE/USE
  // Vanilla

  // Maybe ME, check prices.
  // ASC
  // DewThief
  // Duskhade
  // GSC
  // T2-T4
  // Wicked Gnarly

  // No ME.
  const no = [
    'abominable_asiago_cheese_magic',
    'ancient_cheese_6_pieces',
    'limelight_cheese_6',
    'runic_cheese_2_pieces',
  ];

  const maybe = [
    'crimson_cheese_magic_essence_recipe',
    'glowing_gruyere_cheese_5_pieces',
    'vengeful_vanilla_stilton_magic_essence',
  ];

  if (no.includes(recipe)) {
    showCraftWarning('This is not worth crafting using Magic Essence');
  } else if (maybe.includes(recipe)) {
    showCraftWarning('Check the price of SUPER|brie+ before using Magic Essence');
  }
};

const main = () => {
  onOverlayChange({ item: { show: setOpenQuantityOnClick } });
  if ('item' === getCurrentPage()) {
    setOpenQuantityOnClick();
  }

  fixPassingParcel();
  addOpenAlltoConvertiblePage();
  modifySmashableTooltip();
};

export default function inventoryHelper() {
  addUIStyles(styles);

  main();
  onPageChange({ change: main });
  onEvent('js_dialog_show', addOpenAlltoConvertible);
  onEvent('js_dialog_show', warnOnBadCrafts);
}
