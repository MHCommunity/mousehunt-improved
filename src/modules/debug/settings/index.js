/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
export default async () => {
  return [
    {
      id: 'debug.utils-data',
      title: 'Log data caching and retrieval'
    },
    {
      id: 'debug.events',
      title: 'Log events'
    },
    {
      id: 'debug.all-events',
      title: 'Log all events'
    },
    {
      id: 'debug.dialog',
      title: 'Log IDs of opening and closing dialogs/popups'
    },
    {
      id: 'debug.all',
      title: 'Log module debug messages'
    },
    {
      id: 'debug.module-loading',
      title: 'Log module loading'
    },
    {
      id: 'debug.navigation',
      title: 'Log page, tab, and subtab navigation'
    },
    {
      id: 'debug.request',
      title: 'Log remote requests and responses'
    },
    {
      id: 'debug.sentry',
      title: 'Set Sentry to debug mode'
    },
    {
      id: 'debug.hover-popups',
      title: 'Don\'t close hover popups on mouseout'
    },
    {
      id: 'debug.disable-cache',
      title: 'Disable caching of data and settings',
    }
  ];
};
