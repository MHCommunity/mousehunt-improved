/**
 * Set up as a module so that it can be toggled on and off.
 */
export default {
  id: 'error-reporting',
  name: 'Error Reporting',
  type: 'advanced',
  description: 'Send anonymous error reports to the developers.',
  default: true,
  order: 1000,
  load: () => {},
};
