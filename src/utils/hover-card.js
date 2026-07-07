import { makeElement } from './elements';

/**
 * Extract the type/id encoded in a journal link, from either its `onclick`
 * (e.g. `MouseView.show('abc')`) or its `href` query parameter.
 *
 * @param {HTMLElement} link      The link element.
 * @param {string}      hrefParam The href query parameter to read (e.g. 'mouse_type').
 *
 * @return {string|null} The extracted type, or null if not found.
 */
const getTypeFromLink = (link, hrefParam) => {
  let match;

  if (link.getAttribute('onclick')) {
    match = link.getAttribute('onclick').match(/'([^']+)'/);
  } else if (link.getAttribute('href')) {
    match = link.getAttribute('href').match(new RegExp(`${hrefParam}=([^&]+)`));
  }

  if (! match || match.length < 2) {
    return null;
  }

  return match[1];
};

/**
 * Create a hover-card controller that shows a positioned detail popup when the
 * user hovers a link, fetching and rendering the data on demand.
 *
 * @param {Object}   options               The options.
 * @param {string}   options.wrapperId     The id/class used for the popup wrapper (and `${wrapperId}-loading` for the loading span).
 * @param {string}   options.hrefParam     The href query parameter holding the type/id (e.g. 'mouse_type').
 * @param {Function} options.fetchData     Async `(type) => data` fetcher.
 * @param {Function} options.render        `(data) => HTMLElement|false` renderer.
 * @param {string}   [options.loadingText] The loading text.
 * @param {number}   [options.delay]       The hover delay before showing, in ms.
 *
 * @return {Object} A controller with an `attach(link)` method.
 */
const createHoverCard = ({
  wrapperId,
  hrefParam,
  fetchData,
  render,
  loadingText = 'Loading...',
  delay = 500,
}) => {
  let wrapper;
  const listeners = new Map();

  /**
   * Show the loading popup, positioned relative to the hovered element.
   *
   * @param {Event} e The mouseenter event.
   */
  const showLoading = (e) => {
    if (wrapper) {
      wrapper.remove();
    }

    wrapper = makeElement('div', wrapperId);
    wrapper.id = wrapperId;
    wrapper.innerHTML = `<span class="${wrapperId}-loading">${loadingText}</span>`;

    document.body.append(wrapper);

    const rect = e.target.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    let tooltipTop = top - wrapper.offsetHeight - 10;
    if (tooltipTop < 0) {
      tooltipTop = top + rect.height + 10;
    }

    wrapper.style.top = `${tooltipTop}px`;
    wrapper.style.left = `${left - (wrapper.offsetWidth / 2) + (rect.width / 2)}px`;
  };

  /**
   * Hide the popup.
   */
  const hide = () => {
    if (wrapper) {
      wrapper.remove();
    }
  };

  /**
   * Attach the hover behavior to a link.
   *
   * @param {HTMLElement} link The link element.
   */
  const attach = (link) => {
    let timeoutId = null;
    let isMouseOver = false;

    if (listeners.has(link)) {
      const prev = listeners.get(link);
      link.removeEventListener('mouseenter', prev.enter);
      link.removeEventListener('mouseleave', prev.leave);
    }

    const enter = (e) => {
      isMouseOver = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        if (! isMouseOver) {
          return;
        }

        showLoading(e);

        const type = getTypeFromLink(link, hrefParam);
        if (! type) {
          return;
        }

        const data = await fetchData(type);
        if (data && wrapper && isMouseOver) {
          const markup = render(data);
          if (markup) {
            wrapper.innerHTML = markup.outerHTML;
          }
        }
      }, delay);
    };

    const leave = () => {
      isMouseOver = false;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      hide();
    };

    link.addEventListener('mouseenter', enter);
    link.addEventListener('mouseleave', leave);

    listeners.set(link, { enter, leave });
  };

  return { attach };
};

export {
  createHoverCard,
  getTypeFromLink
};
