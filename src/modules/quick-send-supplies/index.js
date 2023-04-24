import { addUIStyles } from '../utils';
import styles from './styles.css';

const makeItem = (name, type, image) => {
  const item = document.createElement('div');
  item.classList.add('quickSendItem');
  item.title = name;

  const itemImage = document.createElement('img');
  itemImage.setAttribute('src', image);
  itemImage.setAttribute('alt', name);

  const selected = document.createElement('input');
  selected.classList.add('quickSendItemRadio');
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

  return item;
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

    const quickSendLinkWrapper = document.createElement('form');
    quickSendLinkWrapper.classList.add('quickSendWrapper');
    quickSendLinkWrapper.style.display = 'none';

    const itemsWrapper = document.createElement('div');
    itemsWrapper.classList.add('itemsWrapper');

    const sb = makeItem('SUPER|brie+', 'super_brie_cheese', 'https://www.mousehuntgame.com/images/items/bait/transparent_thumb/3a23203e08a847b23f7786b322b36f7a.png?cv=2');
    itemsWrapper.appendChild(sb);

    const rmd = makeItem('Rare Map Dust', 'rare_map_dust_stat_item', 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/458789350947048fd501508b8bdc88b1.png?cv=2');
    itemsWrapper.appendChild(rmd);

    const aej = makeItem('Adorned Empyrean Jewel', 'floating_trap_upgrade_stat_item', 'https://www.mousehuntgame.com/images/items/stats/transparent_thumb/2f116b49f7aebb66942a4785c86ec984.png?cv=2');
    itemsWrapper.appendChild(aej);

    const bw = makeItem('Rift-torn Roots', 'rift_torn_roots_crafting_item', 'https://www.mousehuntgame.com/images/items/crafting_items/transparent_thumb/bffc5e77073c0f99e3c2b5f16ee845a5.png?cv=2');
    itemsWrapper.appendChild(bw);

    quickSendLinkWrapper.appendChild(itemsWrapper);

    const quickSendGoWrapper = document.createElement('div');
    quickSendGoWrapper.classList.add('quickSendGoWrapper');

    const quickSendInput = document.createElement('input');
    quickSendInput.classList.add('quickSendInput');
    quickSendInput.setAttribute('type', 'number');
    quickSendInput.setAttribute('placeholder', 'Quantity');

    const quickSendButton = makeElement('div', ['quickSendButton', 'mousehuntActionButton', 'tiny'], '<span>Send</span>');

    const message = makeElement('div', 'quickSendmessage', 'Sent!');
    quickSendGoWrapper.appendChild(message);

    quickSendButton.addEventListener('click', () => {
      const qty = quickSendInput.value;
      if (! qty) {
        message.innerHTML = 'Please enter a quantity';
        message.style.opacity = 1;
        message.classList.add('error');
        return;
      }

      const selected = document.querySelector('.quickSendItem.selected');
      const item = selected.querySelector('.quickSendItemRadio');
      if (! item) {
        message.innerHTML = 'Please select an item';
        message.style.opacity = 1;
        message.classList.add('error');
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

    btn.addEventListener('mouseover', () => {
      btn.removeEventListener('mouseout', () => {});

      quickSendLinkWrapper.style.display = 'block';

      // make sure the popup isn't off the screen
      const rect = quickSendLinkWrapper.getBoundingClientRect();
      const left = rect.left;
      const right = rect.right;
      const top = rect.top;

      const windowWidth = window.innerWidth;

      if (left < 0) {
        quickSendLinkWrapper.style.left = '0px';
      }

      if (right > windowWidth) {
        quickSendLinkWrapper.style.left = `${windowWidth - right}px`;
      }

      if (top < 0) {
        quickSendLinkWrapper.style.top = '5px';
      }

      btn.addEventListener('mouseout', () => {
        const mouseLeaveTarget = addEventListener('mousemove', (e) => {
          // get the dimensions of the popup
          const rrect = quickSendLinkWrapper.getBoundingClientRect();

          // get the mouse position
          const x = e.clientX;
          const y = e.clientY;

          const leavebottom = rrect.bottom + 10;
          const leavetop = rrect.top - 10;
          const leaveleft = rrect.left - 10;
          const leaveright = rrect.right + 10;

          // if the mouse is outside the popup, remove it
          if (y < leavetop || y > leavebottom || x < leaveleft || x > leaveright) {
            quickSendLinkWrapper.style.display = 'none';
            removeEventListener('mousemove', mouseLeaveTarget);
          }
        });
      });
    });
  });
};

export default function quickSendSupplies() {
  addUIStyles(styles);

  main();
  onPageChange(main);
  onAjaxRequest(main);
  onEvent('profile_hover', main);
}
