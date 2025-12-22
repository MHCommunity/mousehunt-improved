let originalTogglePopup;

const init = async () => {
  if (originalTogglePopup) {
    return;
  }

  // Check if messenger exists (it should if loaded after page load, usually)
  if (!messenger?.UI?.notification) {
    return;
  }

  originalTogglePopup = messenger.UI.notification.togglePopup;

  messenger.UI.notification.togglePopup = function (...args) {
    // Run the original function
    const result = originalTogglePopup.apply(this, args);

    // Start observing specifically for the daily draw to appear
    const observer = new MutationObserver((_mutations, obs) => {
      const dailyDraw = document.querySelector('.daily_draw');
      if (dailyDraw) {
        const container = dailyDraw.parentElement;
        if (!container) {
          return;
        }

        const dailyDrawDivs = [...container.querySelectorAll('.daily_draw')];
        if (dailyDrawDivs.length === 0) {
          return;
        }

        // Check if sorted
        const lastSorted = container._mhSortedChildren;
        if (
          lastSorted &&
          lastSorted.length === dailyDrawDivs.length &&
          lastSorted.every((el, index) => el === dailyDrawDivs[index])
        ) {
          return;
        }

        const emptyDiv = container.querySelector('.empty');

        // Reverse
        dailyDrawDivs.reverse().forEach((div) => {
          if (emptyDiv) {
            emptyDiv.before(div);
          } else {
            container.append(div);
          }
        });

        container._mhSortedChildren = [...container.querySelectorAll('.daily_draw')];
        obs.disconnect();
      }
    });

    // Observe body to catch wherever it gets inserted
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Timeout to stop observing if it never appears
    setTimeout(() => {
      observer.disconnect();
    }, 5000);

    return result;
  };
};

export default {
  id: 'reverse-daily-draw-order',
  name: 'Daily Draw: Reverse Order',
  default: false,
  description: 'Reverse the order of the Daily Draw inbox entries so that the most recent is at the top.',
  load: init,
};
