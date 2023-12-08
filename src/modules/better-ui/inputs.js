import { onDialogShow, onNavigation } from '@/mh-utils';

const update = (input) => {
  input.setAttribute('type', 'number');
};

const updateInputs = async () => {
  // Shop and other actions.
  const actionInputs = document.querySelectorAll('.itemPurchaseView-action-quantity input');
  if (actionInputs.length > 0) {
    for (const input of actionInputs) {
      update(input);
    }
  }

  // Convertible dialogs and other actions.
  const convertibleInputs = document.querySelectorAll('.itemView-action-convert-quantity');
  if (convertibleInputs.length > 0) {
    for (const input of convertibleInputs) {
      update(input);
    }
  }
};

const main = () => {
  // dumb way to handle the ajax loading, but it works.
  updateInputs();
  setTimeout(updateInputs, 500);
  setTimeout(updateInputs, 1000);
  setTimeout(updateInputs, 1500);
  setTimeout(updateInputs, 2000);
};

export default () => {
  onNavigation(main);
  onDialogShow(main);
  main();
};
