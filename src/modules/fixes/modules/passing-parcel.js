import { onNavigation } from '@utils';

let passingParcelAction = null;
let handleParcelClick = null;

/**
 * Fix the passing parcel message item markup.
 */
const fixPassingParcel = () => {
  const passingParcel = document.querySelector('.inventoryPage-item[data-item-type="passing_parcel_message_item"]');
  if (! passingParcel) {
    return;
  }

  const quantity = passingParcel.querySelector('.quantity');
  if (! quantity) {
    return;
  }

  const newMarkup = `<div class="inventoryPage-item full convertible " onclick="app.pages.InventoryPage.useItem(this); return false;" data-item-id="1281" data-item-type="passing_parcel_message_item" data-item-classification="convertible" data-name="Passing Parcel" data-display-order="0">
    <div class="inventoryPage-item-margin clear-block">
        <div class="inventoryPage-item-name">
      <a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_message_item'); return false;">
        <abbr title="Passing Parcel">Passing Parcel (collectible)</abbr>
      </a>
    </div>
    <a href="#" class="inventoryPage-item-larryLexicon" onclick="hg.views.ItemView.show('passing_parcel_message_item'); return false;">?</a>
    <div class="inventoryPage-item-imageContainer">
      <div class="itemImage">
        <a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_message_item'); return false;">
          <img src="https://www.mousehuntgame.com/images/items/message_items/5591e5c34f081715aaca4e95e97a3379.jpg" alt="Passing Parcel" title="Passing Parcel" />
        </a>
        <div class="quantity">
          ${quantity.textContent}
        </div>
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

  passingParcelAction = document.querySelector('#passing-parcel-action');
  handleParcelClick = () => {
    window.location.href = 'https://www.mousehuntgame.com/supplytransfer.php?item_type=passing_parcel_message_item';
  };
  if (passingParcelAction) {
    passingParcelAction.addEventListener('click', handleParcelClick);
  }
};

/**
 * Cleanup function to remove event listeners.
 */
const cleanupPassingParcel = () => {
  if (passingParcelAction && handleParcelClick) {
    passingParcelAction.removeEventListener('click', handleParcelClick);
  }
  passingParcelAction = null;
  handleParcelClick = null;
};

/**
 * Initialize the passing parcel fix.
 */
export default async () => {
  onNavigation(() => {
    cleanupPassingParcel();
    fixPassingParcel();
  }, {
    page: 'inventory',
    tab: 'special',
    onLoad: true,
  });
};
