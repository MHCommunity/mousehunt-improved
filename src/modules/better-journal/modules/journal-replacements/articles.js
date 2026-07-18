// Mouse names whose pronunciation doesn't match their first letter, checked against the
// full mice list: "One-Mouse Band" starts with a "w" sound, "RR-8" is read letter-by-letter.
const exceptions = [
  { pattern: /^One\b/, article: 'a' },
  { pattern: /^RR\b/, article: 'an' },
];

/**
 * Get the article a word should take based on how it's pronounced.
 *
 * @param {string} word The word following the article.
 *
 * @return {string} Either 'a' or 'an'.
 */
const articleFor = (word) => {
  const exception = exceptions.find((rule) => rule.pattern.test(word));
  if (exception) {
    return exception.article;
  }

  return /^[aeiou]/i.test(word) ? 'an' : 'a';
};

export { articleFor };
