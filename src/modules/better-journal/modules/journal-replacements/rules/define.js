/**
 * Convert concise rule definitions into named rule objects.
 *
 * @param {string} domain      The rule domain.
 * @param {Array}  definitions The rule definitions.
 *
 * @return {Array} Named replacement rules.
 */
const defineRules = (domain, definitions) => {
  return definitions.map((definition, index) => {
    const [from, to, options = {}] = definition;
    return {
      id: `${domain}-${index + 1}`,
      from,
      to,
      ...options,
    };
  });
};

export default defineRules;
