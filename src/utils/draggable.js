
/**
 * Make an element draggable. Saves the position to local storage.
 *
 * @param {string}  dragTarget   The selector for the element that should be dragged.
 * @param {string}  dragHandle   The selector for the element that should be used to drag the element.
 * @param {number}  defaultX     The default X position.
 * @param {number}  defaultY     The default Y position.
 * @param {string}  storageKey   The key to use for local storage.
 * @param {boolean} savePosition Whether or not to save the position to local storage.
 */
const makeElementDraggable = (dragTarget, dragHandle, defaultX = null, defaultY = null, storageKey = null, savePosition = true) => {
  const modal = document.querySelector(dragTarget);
  if (! modal) {
    return;
  }

  const handle = document.querySelector(dragHandle);
  if (! handle) {
    return;
  }

  /**
   * Make sure the coordinates are within the bounds of the window.
   *
   * @param {string} type  The type of coordinate to check.
   * @param {number} value The value of the coordinate.
   *
   * @return {number} The value of the coordinate, or the max/min value if it's out of bounds.
   */
  const keepWithinLimits = (type, value) => {
    if ('top' === type) {
      return value < -20 ? -20 : value;
    }

    if (value < (handle.offsetWidth * -1) + 20) {
      return (handle.offsetWidth * -1) + 20;
    }

    if (value > document.body.clientWidth - 20) {
      return document.body.clientWidth - 20;
    }

    return value;
  };

  /**
   * When the mouse is clicked, add the class and event listeners.
   *
   * @param {Object} e The event object.
   */
  const onMouseDown = (e) => {
    e.preventDefault();
    setTimeout(() => {
      // Get the current mouse position.
      x1 = e.clientX;
      y1 = e.clientY;

      // Add the class to the element.
      modal.classList.add('mh-is-dragging');

      // Add the onDrag and finishDrag events.
      document.onmousemove = onDrag;
      document.onmouseup = finishDrag;
    }, 50);
  };

  /**
   * When the drag is finished, remove the dragging class and event listeners, and save the position.
   */
  const finishDrag = () => {
    document.onmouseup = null;
    document.onmousemove = null;

    // Remove the class from the element.
    modal.classList.remove('mh-is-dragging');

    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ x: modal.offsetLeft, y: modal.offsetTop }));
    }
  };

  /**
   * When the mouse is moved, update the element's position.
   *
   * @param {Object} e The event object.
   */
  const onDrag = (e) => {
    e.preventDefault();

    // Calculate the new cursor position.
    x2 = x1 - e.clientX;
    y2 = y1 - e.clientY;

    x1 = e.clientX;
    y1 = e.clientY;

    const newLeft = keepWithinLimits('left', modal.offsetLeft - x2);
    const newTop = keepWithinLimits('top', modal.offsetTop - y2);

    // Set the element's new position.
    modal.style.left = `${newLeft}px`;
    modal.style.top = `${newTop}px`;
  };

  // Set the default position.
  let startX = defaultX || 0;
  let startY = defaultY || 0;

  // If the storageKey was passed in, get the position from local storage.
  if (! storageKey) {
    storageKey = `mh-draggable-${dragTarget}-${dragHandle}`;
  }

  if (savePosition) {
    const storedPosition = localStorage.getItem(storageKey);
    if (storedPosition) {
      const position = JSON.parse(storedPosition);

      // Make sure the position is within the bounds of the window.
      startX = keepWithinLimits('left', position.x);
      startY = keepWithinLimits('top', position.y);
    }
  }

  // Set the element's position.
  modal.style.left = `${startX}px`;
  modal.style.top = `${startY}px`;

  // Set up our variables to track the mouse position.
  let x1 = 0,
    y1 = 0,
    x2 = 0,
    y2 = 0;

  // Add the event listener to the handle.
  handle.onmousedown = onMouseDown;
};

export {
  makeElementDraggable
};
