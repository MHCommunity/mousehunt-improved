import { addStyles, formatNumber, onJournalEntry, parseNumber } from '@utils';

import replacements from './rules';
import styles from './styles.css';

const keepOriginalClasses = new Set([
  'lunar_lantern',
  'valentines_matchmaker',
  'vending_machine_purchase',
  'fullyExplored',
  'folkloreForest-bookClaimed',
  'claimBooty',
]);

/**
 * Whether text replacements should leave an entry untouched.
 *
 * @param {Object} model The journal entry model.
 *
 * @return {boolean} Whether to skip the entry.
 */
const shouldSkip = (model) => {
  return [...model.classes].some((entryClass) => keepOriginalClasses.has(entryClass));
};

/**
 * Whether a replacement rule applies to an entry.
 *
 * @param {Object} rule  The replacement rule.
 * @param {Object} model The journal entry model.
 *
 * @return {boolean} Whether the rule applies.
 */
const ruleMatchesEntry = (rule, model) => {
  if (rule.classes && ! rule.classes.some((entryClass) => model.classes.has(entryClass))) {
    return false;
  }

  if (rule.excludeClasses?.some((entryClass) => model.classes.has(entryClass))) {
    return false;
  }

  return true;
};

/**
 * Apply a rule globally, regardless of whether it uses a string or RegExp.
 *
 * @param {string} html The current journal HTML.
 * @param {Object} rule The replacement rule.
 *
 * @return {string} The transformed HTML.
 */
const applyRule = (html, rule) => {
  if ('string' === typeof rule.from) {
    return html.replaceAll(rule.from, rule.to);
  }

  const flags = rule.from.flags.includes('g') ? rule.from.flags : `${rule.from.flags}g`;
  return html.replace(new RegExp(rule.from.source, flags), rule.to);
};

/**
 * Apply the ordered text replacement rules.
 *
 * @param {Object} model The journal entry model.
 */
const replaceInEntry = (model) => {
  if (shouldSkip(model)) {
    return;
  }

  let html = model.html;
  for (const rule of replacements) {
    if (ruleMatchesEntry(rule, model)) {
      html = applyRule(html, rule);
    }
  }

  model.setHtml(html);
};

/**
 * Format King's Reward gold consistently.
 *
 * @param {Object} model The journal entry model.
 */
const updateKingsReward = (model) => {
  if (shouldSkip(model) || ! model.classes.has('captchasolved')) {
    return;
  }

  const regex = /i claimed a king's reward worth (\d+(,\d{3})*) gold\./i;
  const match = model.html.match(regex);
  if (! match || match.length < 2) {
    return;
  }

  const formattedGoldAmount = formatNumber(parseNumber(match[1]));
  model.setHtml(model.html.replace(regex, `I claimed a King's Reward worth <span class="mh-ui-gold">${formattedGoldAmount}</span> gold.`));
};

/**
 * Correct the game's "an" wording before consonants.
 *
 * @param {Object} model The journal entry model.
 */
const fixAnWording = (model) => {
  if (! shouldSkip(model)) {
    model.setHtml(model.html.replaceAll(/ and caught an ([b-df-hj-np-tv-z])/gi, ' and caught a $1'));
  }
};

/**
 * Initialize text replacements.
 */
export default async () => {
  addStyles(styles, 'better-journal-replacements');

  onJournalEntry(replaceInEntry, {
    id: 'better-journal-replacements',
    stage: 'text',
  });

  onJournalEntry(updateKingsReward, {
    id: 'better-journal-replacements-kings-reward',
    stage: 'text',
  });

  onJournalEntry(fixAnWording, {
    id: 'better-journal-replacements-fix-an',
    stage: 'text',
  });
};
