import { makeCollapsible, makeElement } from '@utils';

const headerClass = 'mhui-marketplace-description-header';

/**
 * Keep the description header right above the description, as charts get added above it.
 */
const keepDescriptionHeaderInPlace = () => {
  const description = document.querySelector('.marketplaceView-item > .marketplaceView-item-description');
  const header = description?.parentElement.querySelector(`:scope > .${headerClass}`);
  if (header && description.previousElementSibling !== header) {
    description.before(header);
  }
};

/**
 * Add a collapse toggle to the item description in the marketplace item view.
 */
const makeDescriptionCollapsible = () => {
  const description = document.querySelector('.marketplaceView-item > .marketplaceView-item-description');
  if (!description || description.previousElementSibling?.classList.contains(headerClass)) {
    return;
  }

  const header = makeElement('div', ['mhui-marketplace-section-header', headerClass]);
  makeElement('span', 'mhui-marketplace-section-title', 'Description', header);
  description.before(header);

  makeCollapsible({
    key: 'marketplace.description',
    section: description,
    header,
    apply: (collapsed) => {
      description.classList.toggle('mhui-marketplace-description-collapsed', collapsed);
      header.classList.toggle('collapsed', collapsed);
    },
  });
};

export { keepDescriptionHeaderInPlace, makeDescriptionCollapsible };
