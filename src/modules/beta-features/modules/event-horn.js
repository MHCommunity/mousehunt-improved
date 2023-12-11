/**
 * Add an event class to the hunters horn.
 *
 * @param {string} hornClass The class to add to the horn.
 */
export default (hornClass) => {
  const horn = document.querySelector('.huntersHornView');
  if (! horn) {
    return;
  }

  horn.classList.add(`huntersHornView--seasonalEvent-${hornClass}`);
};
