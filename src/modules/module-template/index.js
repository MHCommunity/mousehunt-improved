import { addUIStyles } from '../../utils';
import styles from './styles.css';

const main = () => {
  console.log('Do something here.');
};

export default function moduleTemplate() {
  addUIStyles(styles);

  main();
}
