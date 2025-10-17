import { makeElement } from './elements';
import { onEvent } from './event-registry';

let activeBlueprint = null;
let addedEvent = false;

/**
 * Toggle the blueprint view.
 *
 * @param {string}  id      The ID of the blueprint.
 * @param {Element} content The content to display in the blueprint.
 */
const toggleBlueprint = (id, content) => {
  const container = document.querySelector('#mousehuntContainer');
  if (! container) {
    return;
  }

  const blueprint = document.querySelector('.trapSelectorView__blueprint');
  if (! blueprint) {
    return;
  }

  const browserStateParent = document.querySelector('.trapSelectorView__browserStateParent');
  if (! browserStateParent) {
    return;
  }

  const existing = document.querySelector(`#mh-improved-blueprint--${id}`);
  if (existing) {
    existing.remove();
  }

  const wrapper = makeElement('div', [
    'trapSelectorView__browserState',
    'trapSelectorView__browserContainer',
    'mh-improved-blueprint',
    `mh-improved-blueprint--${id}`
  ]);
  wrapper.id = `mh-improved-blueprint--${id}`;
  const inner = makeElement('div', 'trapSelectorView__outerBlock');

  inner.append(content);
  wrapper.append(inner);
  browserStateParent.append(wrapper);

  if (activeBlueprint === id) {
    activeBlueprint = null;
    container.classList.remove('showBlueprint');
    blueprint.classList.remove('trapSelectorView__blueprint--active', 'mh-improved-blueprint--active');
    browserStateParent.classList.remove(`trapSelectorView__browserStateParent--${id}`);
  } else {
    const close = document.querySelector('.campPage-trap-blueprint-closeButton');
    if (close) {
      close.click();
    }

    activeBlueprint = id;
    container.classList.add('showBlueprint');
    blueprint.classList.add('trapSelectorView__blueprint--active', 'mh-improved-blueprint--active');
    browserStateParent.classList.add(`trapSelectorView__browserStateParent--${id}`);
  }

  if (! addedEvent) {
    onEvent('camp_page_toggle_blueprint', () => {
      activeBlueprint = null;
    });
    addedEvent = true;
  }
};

export {
  toggleBlueprint
};
