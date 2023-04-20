import { addUIStyles } from '../utils';
import styles from './styles.css';

const main = () => {
  const profilePic = document.querySelector('.mousehuntHud-userStatBar .mousehuntHud-profilePic');
  if (! profilePic) {
    return;
  }

  const copyIdButton = makeElement('div', ['mh-copy-id-button', 'mousehuntActionButton', 'tiny']);
  makeElement('span', 'mh-copy-id-button-text', 'Copy ID', copyIdButton);
  profilePic.parentNode.insertBefore(copyIdButton, profilePic.nextSibling);

  const successMessage = makeElement('div', 'mh-copy-id-success-message', 'Copied!');
  copyIdButton.parentNode.insertBefore(successMessage, copyIdButton.nextSibling);

  copyIdButton.addEventListener('click', () => {
    const Id = user.user_id;
    navigator.clipboard.writeText(Id);

    successMessage.style.opacity = 1;
    setTimeout(() => {
      successMessage.style.opacity = 0;
    }, 1000);
  });

  // When hovering over the profile pic, show the copy button and hide it if they're not hovering the profile pic or teh button.
  profilePic.addEventListener('mouseenter', () => {
    copyIdButton.style.display = 'block';
  });

  profilePic.addEventListener('mouseleave', () => {
    copyIdButton.style.display = 'none';
  });

  copyIdButton.addEventListener('mouseenter', () => {
    copyIdButton.style.display = 'block';
  });

  copyIdButton.addEventListener('mouseleave', () => {
    copyIdButton.style.display = 'none';
  });
};

export default function CopyId() {
  addUIStyles(styles);

  main();
}
