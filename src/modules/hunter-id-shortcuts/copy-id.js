import { makeElement, makeMhButton, onDeactivation } from '@utils';

/**
 * Copy text with a hidden textarea, for when the Clipboard API is unavailable or refuses.
 *
 * @param {string} text The text to copy.
 *
 * @return {boolean} Whether the text was copied.
 */
const fallbackCopy = (text) => {
  const textarea = makeElement('textarea', 'mh-copy-id-fallback');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = 0;
  document.body.append(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }

  textarea.remove();
  return copied;
};

/**
 * Add a way to copy your Hunter ID from your profile picture in the HUD.
 *
 * @param {string} mode 'button' to show a Copy ID button on hover, or 'profile-picture' to copy when the picture is clicked.
 */
export default (mode) => {
  const profilePic = document.querySelector('.mousehuntHud-userStatBar .mousehuntHud-profilePic');
  if (!profilePic) {
    return;
  }

  const hidebutton = 'profile-picture' === mode;

  const copyIdButton = makeMhButton({
    text: 'Copy ID',
    className: ['mh-copy-id-button', hidebutton ? 'hidden' : ''],
  });

  profilePic.parentNode.insertBefore(copyIdButton, profilePic.nextSibling);

  const successMessage = makeElement('div', 'mh-copy-id-success-message', 'Copied!');
  successMessage.style.opacity = 0;
  copyIdButton.parentNode.insertBefore(successMessage, copyIdButton.nextSibling);

  let hideTimer;
  const showMessage = (text) => {
    successMessage.textContent = text;
    successMessage.style.opacity = 1;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      successMessage.style.opacity = 0;
    }, 1000);
  };

  /**
   * Copy the user ID to the clipboard.
   *
   * @param {Event} e The event object.
   */
  const clickAction = (e) => {
    e.preventDefault();

    const id = String(user.user_id);
    const onFailure = () => {
      showMessage(fallbackCopy(id) ? 'Copied!' : 'Copy failed');
    };

    if (!navigator.clipboard?.writeText) {
      onFailure();
      return;
    }

    navigator.clipboard
      .writeText(id)
      .then(() => showMessage('Copied!'))
      .catch(onFailure);
  };

  copyIdButton.addEventListener('click', clickAction);

  // Show the button while hovering the profile pic or the button, with a short delay before hiding so the
  // mouse can cross any gap between them.
  let hoverTimer;
  const showButton = () => {
    clearTimeout(hoverTimer);
    copyIdButton.style.display = 'block';
  };

  const hideButton = () => {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      copyIdButton.style.display = 'none';
    }, 300);
  };

  const originalOnclick = profilePic.getAttribute('onclick');

  if (hidebutton) {
    profilePic.setAttribute('onclick', '');
    profilePic.addEventListener('click', clickAction);
  } else {
    profilePic.addEventListener('mouseenter', showButton);
    profilePic.addEventListener('mouseleave', hideButton);
    copyIdButton.addEventListener('mouseenter', showButton);
    copyIdButton.addEventListener('mouseleave', hideButton);
  }

  // Without the module's styles the button would always show, so remove it and restore the profile pic.
  onDeactivation('hunter-id-shortcuts', () => {
    copyIdButton.remove();
    successMessage.remove();
    profilePic.removeEventListener('click', clickAction);
    profilePic.removeEventListener('mouseenter', showButton);
    profilePic.removeEventListener('mouseleave', hideButton);
    if (hidebutton && null !== originalOnclick) {
      profilePic.setAttribute('onclick', originalOnclick);
    }
  });
};
