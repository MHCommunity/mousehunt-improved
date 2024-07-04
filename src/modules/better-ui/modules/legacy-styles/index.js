import { addStyles, isLegacyHUD } from '@utils';

import styles from './styles.css';

export default async () => {
  if (isLegacyHUD()) {
    addStyles(styles, 'better-ui-legacy');
  }
};
