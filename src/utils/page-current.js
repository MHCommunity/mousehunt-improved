/**
 * Get the current page slug.
 *
 * @return {string|null} The page slug or null if not found.
 */
const getCurrentPage = () => {
  if (! hg?.utils?.PageUtil?.getCurrentPage) {
    return null;
  }

  const page = hg.utils.PageUtil.getCurrentPage();
  if (! page) {
    const query = hg?.utils?.PageUtil?.getQueryParams() || {};
    if (query?.switch_to && 'mobile' === query.switch_to) {
      return 'camp';
    }

    return null;
  }

  return page.toLowerCase();
};

export {
  getCurrentPage
};
