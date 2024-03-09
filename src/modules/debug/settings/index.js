/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'debug.all',
      title: 'Log module debug messages',
      default: false,
    },
    {
      id: 'debug.module-loading',
      title: 'Log module loading',
      default: false,
    },
    {
      id: 'debug.utils-data',
      title: 'Log data caching and retrieval',
      default: false,
    },
    {
      id: 'debug.update-migration',
      title: 'Log update migration',
      default: false,
    },
    {
      id: 'debug.dialog',
      title: 'Log IDs of opening and closing dialogs/popups',
      default: false,
    },
    {
      id: 'debug.navigation',
      title: 'Log page, tab, and subtab navigations',
      default: false,
    },
    {
      id: 'debug.request',
      title: 'Log remote requests and responses',
      default: false,
    },
    {
      id: 'debug.events',
      title: 'Log events',
      default: false,
    },
  ];
};
