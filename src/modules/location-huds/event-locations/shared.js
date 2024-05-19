/**
 * Update the countdown tooltip.
 *
 * @param {string} selector The selector to update.
 */
const updateDateTooltip = (selector) => {
  const tooltip = document.querySelector(selector);
  if (! tooltip) {
    return;
  }

  if (tooltip.getAttribute('data-changed')) {
    return;
  }

  tooltip.classList.add('bottom');
  tooltip.classList.remove('top');
  tooltip.setAttribute('data-changed', 'true');
};

/**
 * Space out the numbers in a string.
 *
 * @param {string} text The text to space out.
 *
 * @return {string} The spaced out text.
 */
const spaceNumbers = (text) => {
  return text.replaceAll(/(\d+)/g, ' $1 ').trim();
};

/**
 * Update the date elements in the date tooltip.
 *
 * @param {string} remainingSelector The selector for the remaining element.
 * @param {string} textSelector      The selector for the text element.
 */
const updateDateDates = (remainingSelector, textSelector = false) => {
  const badge = document.querySelector(remainingSelector);
  if (badge) {
    if (badge.getAttribute('data-changed')) {
      return;
    }

    badge.innerHTML = spaceNumbers(badge.innerHTML);
    badge.setAttribute('data-changed', 'true');
  }

  if (! textSelector) {
    return;
  }

  const tooltip = document.querySelector(textSelector);
  if (tooltip) {
    if (tooltip.getAttribute('data-changed')) {
      return;
    }

    tooltip.innerHTML = spaceNumbers(tooltip.innerHTML);
    tooltip.setAttribute('data-changed', 'true');
  }
};

export {
  updateDateTooltip,
  updateDateDates
};
