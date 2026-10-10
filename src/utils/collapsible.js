import { getSetting, saveSetting } from './settings';
import { makeElement } from './elements';

// Every collapsible section's state lives in one setting, keyed by section, like
// `item-view.drop-rates`. A key covers every place the section shows up, not one mouse or item.
const settingKey = 'collapsed-sections';

/**
 * Get the saved states of the collapsible sections.
 *
 * @return {Object} Whether each section is collapsed, by key.
 */
const getCollapsedSections = () => {
  const saved = getSetting(settingKey, {});
  return saved && 'object' === typeof saved && !Array.isArray(saved) ? saved : {};
};

/**
 * Check whether a section is collapsed.
 *
 * @param {string}  key              The section key.
 * @param {boolean} defaultCollapsed Whether it's collapsed before it's toggled.
 *
 * @return {boolean} Whether it's collapsed.
 */
const isSectionCollapsed = (key, defaultCollapsed = false) => {
  const saved = getCollapsedSections();
  return key in saved ? Boolean(saved[key]) : defaultCollapsed;
};

/**
 * Save whether a section is collapsed.
 *
 * @param {string}  key       The section key.
 * @param {boolean} collapsed Whether it's collapsed.
 */
const saveSectionCollapsed = (key, collapsed) => {
  saveSetting(settingKey, { ...getCollapsedSections(), [key]: collapsed });
};

/**
 * Make a section collapse when its header is clicked, with the shared caret, remembering the state.
 *
 * By default the section gets `mh-ui-collapsed`, which hides everything in it but the header. Pass
 * `apply` for sections that hide themselves differently.
 *
 * @param {Object}      options                  The options.
 * @param {string}      options.key              The section key, shared by every copy of the section.
 * @param {HTMLElement} options.section          The section.
 * @param {HTMLElement} options.header           The header to click.
 * @param {boolean}     options.defaultCollapsed Whether it's collapsed before it's toggled.
 * @param {boolean}     options.caret            Whether to add the caret to the header.
 * @param {string}      options.ignore           Clicks on these in the header don't toggle it.
 * @param {Function}    options.apply            Shows the state, given whether it's collapsed.
 * @param {Function}    options.onToggle         Called with whether it's collapsed when it's toggled.
 *
 * @return {Object} `isCollapsed()` and `setCollapsed(collapsed)`, which saves the state.
 */
const makeCollapsible = ({ key, section, header, defaultCollapsed = false, caret = true, ignore = 'a[href], button, select, input, label', apply = null, onToggle = null }) => {
  let collapsed = isSectionCollapsed(key, defaultCollapsed);

  const show = () => {
    if (apply) {
      apply(collapsed);
    } else {
      section.classList.toggle('mh-ui-collapsed', collapsed);
    }

    header.title = collapsed ? 'Expand' : 'Collapse';
    header.setAttribute('aria-expanded', String(!collapsed));
  };

  const setCollapsed = (value) => {
    collapsed = Boolean(value);
    saveSectionCollapsed(key, collapsed);
    show();
  };

  // Sections that show the state themselves keep their classes as they are (Profile+ keys King's
  // Crowns groups on their class attribute).
  if (!apply) {
    section.classList.add('mh-ui-collapsible');
  }

  header.classList.add('mh-ui-collapsible-header');
  if (caret && !header.querySelector(':scope > .mh-ui-caret')) {
    header.prepend(makeElement('span', 'mh-ui-caret'));
  }

  show();

  if (!header.hasAttribute('data-mh-collapsible')) {
    header.setAttribute('data-mh-collapsible', '');
    header.addEventListener('click', (event) => {
      if (ignore && event.target.closest(ignore) && event.target.closest(ignore) !== header) {
        return;
      }

      event.preventDefault();

      // Read the saved state, in case the section was set up again since this listener was added.
      setCollapsed(!isSectionCollapsed(key, defaultCollapsed));
      onToggle?.(collapsed);
    });
  }

  return { isCollapsed: () => collapsed, setCollapsed };
};

export { isSectionCollapsed, makeCollapsible, saveSectionCollapsed };
