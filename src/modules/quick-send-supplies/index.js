import { addUIStyles } from '../utils';
import styles from './styles.css';

const makeItem = (name, type, image, appendTo) => {
  const item = makeElement('div', 'quickSendItem');
  item.title = name;

  const itemImage = document.createElement('img');
  itemImage.setAttribute('src', image);
  itemImage.setAttribute('alt', name);

  const selected = makeElement('input', 'quickSendItemRadio');
  selected.setAttribute('type', 'radio');
  selected.setAttribute('name', 'item');
  selected.setAttribute('value', type);
  selected.setAttribute('data-name', name);

  item.addEventListener('click', () => {
    selected.checked = true;

    const items = document.querySelectorAll('.quickSendItem');
    items.forEach((i) => {
      i.classList.remove('selected');
    });

    item.classList.add('selected');
  });

  item.appendChild(selected);
  item.appendChild(itemImage);

  appendTo.appendChild(item);
};

const main = () => {
  const sendSupplies = document.querySelectorAll('.userInteractionButtonsView-button.sendSupplies');
  if (! sendSupplies) {
    return;
  }

  sendSupplies.forEach((btn) => {
    const existing = btn.getAttribute('data-quick-send');
    if (existing) {
      return;
    }

    // get the parent parent
    const snuid = btn.parentNode.parentNode.getAttribute('data-recipient-snuid');
    if (! snuid) {
      return;
    }

    btn.setAttribute('data-quick-send', 'true');

    btn.classList.remove('mousehuntTooltipParent');
    const tooltip = btn.querySelector('.mousehuntTooltip');
    if (tooltip) {
      tooltip.remove();
    }

    const quickSendLinkWrapper = makeElement('form', ['quickSendWrapper', 'hidden']);
    const itemsWrapper = makeElement('div', 'itemsWrapper');

    makeItem('SUPER|brie+', 'super_brie_cheese', 'https://www.mousehuntgame.com/images/items/bait/transparent_thumb/3a23203e08a847b23f7786b322b36f7a.png?cv=2', itemsWrapper);
    makeItem('Rare Map Dust', 'rare_map_dust_stat_item', 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/458789350947048fd501508b8bdc88b1.png?cv=2', itemsWrapper);
    makeItem('Adorned Empyrean Jewel', 'floating_trap_upgrade_stat_item', 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/2f116b49f7aebb66942a4785c86ec984.png?cv=2', itemsWrapper);
    makeItem('Rift-torn Roots', 'rift_torn_roots_crafting_item', 'https://www.mousehuntgame.com/images/items/crafting_items/transparent_thumb/bffc5e77073c0f99e3c2b5f16ee845a5.png?cv=2', itemsWrapper);

    quickSendLinkWrapper.appendChild(itemsWrapper);

    const quickSendGoWrapper = makeElement('div', 'quickSendGoWrapper');

    const quickSendInput = makeElement('input', 'quickSendInput');
    quickSendInput.setAttribute('type', 'number');
    quickSendInput.setAttribute('placeholder', 'Quantity');

    const quickSendButton = makeElement('div', ['quickSendButton', 'mousehuntActionButton', 'tiny'], '<span>Send</span>');
    const message = makeElement('div', 'quickSendmessage', 'Sent!', quickSendGoWrapper);

    quickSendButton.addEventListener('click', () => {
      const qty = quickSendInput.value;
      if (! qty) {
        message.innerHTML = 'Please enter a quantity';
        message.classList.add('full-opacity', 'error');
        return;
      }

      const selected = document.querySelector('.quickSendItem.selected');
      const item = selected.querySelector('.quickSendItemRadio');
      if (! item) {
        message.innerHTML = 'Please select an item';
        message.classList.add('full-opacity', 'error');
        return;
      }

      quickSendButton.classList.add('disabled');

      const itemType = item.getAttribute('value');
      const itemName = item.getAttribute('data-name');
      const url = `https://www.mousehuntgame.com/managers/ajax/users/supplytransfer.php?sn=Hitgrab&hg_is_ajax=1&receiver=${snuid}&uh=${user.unique_hash}&item=${itemType}&item_quantity=${qty}`;

      fetch(url, {
        method: 'POST',
      }).then((response) => {
        if (response.status === 200) {
          quickSendInput.value = '';

          quickSendButton.classList.remove('disabled');

          message.innerHTML = `Sent ${qty} ${itemName}!`;
          message.classList.remove('error');

          message.style.opacity = 1;
          setTimeout(() => {
            message.style.opacity = 0;
          }, 2000);
        }
      });
    });

    quickSendGoWrapper.appendChild(quickSendInput);
    quickSendGoWrapper.appendChild(quickSendButton);
    quickSendLinkWrapper.appendChild(quickSendGoWrapper);
    btn.parentNode.insertBefore(quickSendLinkWrapper, btn.nextSibling);
  });
};

export default function quickSendSupplies() {
  addUIStyles(styles);

  main();
  onPageChange(main);
  onAjaxRequest(main);
  onEvent('profile_hover', main);
}
