/**
 * Reverse daily_draw elements.
 */
const reverseDailyDrawElements = () => {
  const container = document.querySelector('.daily_draw')?.parentElement;
  if (! container) {
    return;
  }

  const dailyDrawDivs = [...container.querySelectorAll('.daily_draw')];
  if (dailyDrawDivs.length === 0) {
    return;
  }

  const emptyDiv = container.querySelector('.empty');

  dailyDrawDivs.reverse().forEach((div) => {
    if (emptyDiv) {
      emptyDiv.before(div);
    } else {
      container.append(div);
    }
  });
};

let _originalTogglePopup;

/**
 * Initialize the module.
 */
const init = async () => {
  if (_originalTogglePopup || ! messenger?.UI?.notification) {
    return;
  }

  _originalTogglePopup = messenger.UI.notification.togglePopup;

  messenger.UI.notification.togglePopup = function (...args) {
    const result = _originalTogglePopup.apply(this, args);
    setTimeout(reverseDailyDrawElements, 400);
    return result;
  };
};

/**
 * Module definition.
 */
export default {
  id: 'reverse-daily-draw-order',
  name: 'Daily Draw: Reverse Order',
  default: false,
  description: 'Reverse the order of the Daily Draw inbox entries so that the most recent is at the top.',
  load: init,
};
