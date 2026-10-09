/**
 * Going to the camp page without a page load makes the game create the trap selector view twice on
 * the same element, once when the page starts and again when its ajax response comes in. Both bind
 * their click handlers, so toggles like "See more friends" fire twice and undo themselves. When a
 * new view is made for the same element, take off the handlers the old one added.
 */
export default () => {
  const OriginalView = hg?.views?.TrapSelectorView;
  if ('function' !== typeof OriginalView || 'function' !== typeof $?.fn?.on) {
    return;
  }

  let previous = null;

  /**
   * Make the trap selector view, keeping track of the handlers it binds.
   *
   * @param {Object} container The jQuery container for the view.
   * @param {...*}   args      The rest of the arguments.
   *
   * @return {Object} The view.
   */
  const TrapSelectorView = function (container, ...args) {
    const element = container?.[0] ?? null;
    if (element && previous?.element === element) {
      for (const { target, events, selector, handler } of previous.bindings) {
        $(target).off(events, selector, handler);
      }
    }

    const bindings = [];
    const originalOn = $.fn.on;
    $.fn.on = function (events, ...rest) {
      const handler = rest.findLast((arg) => 'function' === typeof arg);
      if ('string' === typeof events && handler) {
        bindings.push({ target: this, events, selector: 'string' === typeof rest[0] ? rest[0] : undefined, handler });
      }

      return originalOn.call(this, events, ...rest);
    };

    try {
      return new OriginalView(container, ...args);
    } finally {
      $.fn.on = originalOn;
      previous = { element, bindings };
    }
  };

  Object.assign(TrapSelectorView, OriginalView);
  TrapSelectorView.prototype = OriginalView.prototype;
  hg.views.TrapSelectorView = TrapSelectorView;
};
