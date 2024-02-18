import { addStyles, onEvent } from '@utils';
import styles from './styles.css';

/**
 * Format a journal entry as a list.
 *
 * @param {Object}  args       The entry arguments.
 * @param {Element} args.entry The journal entry.
 * @param {Element} args.text  The journal entry text.
 */
const formatAsList = async (args) => {
  const { entry, text } = args;

  const processed = entry.getAttribute('data-better-journal-processed');
  if (processed) {
    return;
  }

  const classes = new Set(entry.classList);
  if (! (
    classes.has('bonuscatchsuccess') ||
    classes.has('catchsuccess') ||
    classes.has('catchsuccessloot') ||
    classes.has('luckycatchsuccess')
  )) {
    return;
  }

  entry.setAttribute('data-better-journal-processed', 'true');

  // split on ' dropped ' to get the items as the second element
  const items = text.innerHTML.split(' that dropped ');
  if (items.length < 2) {
    return;
  }

  const splitItems = items[1].split(/, | and /);
  const itemList = splitItems.map((item) => item.trim()).filter(Boolean);

  const list = document.createElement('ul');
  list.classList.add('better-journal-list');

  itemList.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = item.trim();
    list.append(listItem);
  });

  text.innerHTML = `${items[0]} that dropped:`;
  text.append(list);
};

/**
 * Initialize the module.
 */
export default async () => {
  addStyles(styles, 'beta-features-journal-list');

  onEvent('better-journal-update', formatAsList);
};
