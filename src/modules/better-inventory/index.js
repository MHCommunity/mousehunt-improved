const setOpenQuantityOnClick = () => {
  const qty = document.querySelector('.itemView-action-convertForm');
  if (! qty) {
    return;
  }

  qty.addEventListener('click', (e) => {
    if (e.target.tagName === 'DIV') {
      const textQty = e.target.innerText;
      const qtyArray = textQty.split(' ');
      let maxNum = qtyArray[ qtyArray.length - 1 ];
      maxNum = maxNum.replace('Submit', '');
      maxNum = parseInt(maxNum);
      // console.log(maxNum);

      const input = document.querySelector('.itemView-action-convert-quantity');
      input.value = maxNum;
    }
  });
};

const main = () => {
  setOpenQuantityOnClick();
};

export default function inventoryHelper() {
  main();
  onPageChange({ change: main });
}
