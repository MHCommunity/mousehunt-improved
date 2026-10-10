import { addStyles, getSetting, saveSetting } from '@utils';

import gridStyles from './styles/grid.css';
import listStyles from './styles/list.css';
import onlyIconsStyles from './styles/icons.css';

const layoutKey = 'show-auras.layout-0';
const iconsOnlyKey = 'show-auras.icons-only';

const layoutOptions = [
  { name: 'Grid', value: 'grid', styles: gridStyles },
  { name: 'List', value: 'list', styles: listStyles },
];

/**
 * Get the aura layout, grid or list.
 *
 * @return {string} The layout.
 */
const getAuraLayout = () => {
  const layout = getSetting(layoutKey, 'grid');
  return layoutOptions.some((option) => option.value === layout) ? layout : 'grid';
};

/**
 * Check whether the auras show only their icons.
 *
 * @return {boolean} Whether they do.
 */
const getAuraIconsOnly = () => {
  // Icons only used to be one of the layouts.
  return getSetting(iconsOnlyKey, 'icons' === getSetting(layoutKey, 'grid'));
};

/**
 * Add the styles for the aura layout.
 */
const applyAuraLayout = () => {
  const layout = layoutOptions.find((option) => option.value === getAuraLayout());
  addStyles(getAuraIconsOnly() ? onlyIconsStyles : layout.styles, 'show-auras-layout');
};

/**
 * Change the aura layout.
 *
 * @param {string} layout The layout.
 */
const setAuraLayout = (layout) => {
  // Saved first, since it can come from the old layout.
  saveSetting(iconsOnlyKey, getAuraIconsOnly());
  saveSetting(layoutKey, layout);
  applyAuraLayout();
};

/**
 * Change whether the auras show only their icons.
 *
 * @param {boolean} iconsOnly Whether they do.
 */
const setAuraIconsOnly = (iconsOnly) => {
  saveSetting(iconsOnlyKey, iconsOnly);
  applyAuraLayout();
};

export { applyAuraLayout, getAuraIconsOnly, getAuraLayout, layoutOptions, setAuraIconsOnly, setAuraLayout };
