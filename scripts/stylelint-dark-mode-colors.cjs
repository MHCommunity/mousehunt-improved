/**
 * Keeps Native Dark Mode backgrounds on the role tokens from
 * src/modules/native-dark-mode/styles/_root.css (see AGENTS.md, "Dark mode colors").
 */
const stylelint = require('stylelint');

const ruleName = 'mhui/dark-mode-colors';

const rawSurfaces = {
  'var(--d)': 'a role such as --d-surface-page or --d-surface-inset',
  'var(--d-alt)': 'a role such as --d-surface-inset, --d-surface-header, --d-tab or --d-row-alt',
  'var(--d-bg)': 'a role such as --d-surface-panel, --d-surface-popover or --d-tab-active',
  'var(--d-action)': 'a role such as --d-hover or --d-button',
};

const retired = ['--d-bg-alt'];

const messages = stylelint.utils.ruleMessages(ruleName, {
  raw: (value, suggestion) => `Use ${suggestion} instead of the raw surface color ${value}`,
  retired: (token) => `${token} was retired; use a surface role token instead`,
});

const isDarkModeRule = (rule) => rule.selectors && rule.selectors.length > 0 && rule.selectors.every((selector) => /\.mh-dark(?![\w-])/.test(selector));

/** @type {import('stylelint').Rule} */
const ruleFunction = (enabled) => (root, result) => {
  if (!enabled || (root.source?.input?.file || '').endsWith('native-dark-mode/styles/_root.css')) {
    return;
  }

  root.walkDecls((decl) => {
    const value = decl.value.trim();

    for (const token of retired) {
      if (value.includes(`var(${token})`)) {
        stylelint.utils.report({ ruleName, result, node: decl, message: messages.retired(token) });
      }
    }

    if (!/^background(-color)?$/.test(decl.prop) || !isDarkModeRule(decl.parent)) {
      return;
    }

    if (rawSurfaces[value]) {
      stylelint.utils.report({ ruleName, result, node: decl, message: messages.raw(value, rawSurfaces[value]) });
    }
  });
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;

module.exports = stylelint.createPlugin(ruleName, ruleFunction);
