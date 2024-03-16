import { addStyles } from '@utils';

import * as imported from './styles/**/*.css'; // eslint-disable-line import/no-unresolved
const styles = imported;

export default async () => {
  addStyles(styles, 'better-journal-styles');
};
