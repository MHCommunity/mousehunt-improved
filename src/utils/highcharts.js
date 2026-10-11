/**
 * Load Highcharts the first time a chart is shown.
 *
 * esbuild keeps dynamically imported modules in the bundle but doesn't run them until the
 * import is reached, so pages without a chart skip Highcharts' setup entirely.
 *
 * @param {Object}  [options]       The options.
 * @param {boolean} [options.stock] Whether to also load the Highcharts Stock module.
 *
 * @return {Promise<Object>} The Highcharts namespace.
 */
const loadHighcharts = async ({ stock = false } = {}) => {
  const { default: Highcharts } = await import('highcharts');

  if (stock) {
    await import('highcharts/modules/stock');
  }

  return Highcharts;
};

export { loadHighcharts };
