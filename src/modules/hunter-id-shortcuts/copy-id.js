import { makeElement, makeMhButton, onDeactivation } from '@utils';

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

  /**
   * Copy the user ID to the clipboard.
   *
   * @param {Event} e The event object.
   */
  let hideTimer;
  const clickAction = (e) => {
    e.preventDefault();

    // Only say it was copied if it actually was, and restart the timer on repeat clicks.
    navigator.clipboard
      .writeText(String(user.user_id))
      .then(() => {
        successMessage.style.opacity = 1;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
          successMessage.style.opacity = 0;
        }, 1000);
      })
      .catch(() => {});
  };

  copyIdButton.addEventListener('click', clickAction);

  const originalOnclick = profilePic.getAttribute('onclick');

  if (hidebutton) {
    profilePic.setAttribute('onclick', '');
    profilePic.addEventListener('click', clickAction);
  } else {
    // When hovering over the profile pic, show the copy button and hide it if they're not hovering the profile pic or the button.
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
  }

  // Without the module's styles the button would always show, so remove it and restore the profile pic.
  onDeactivation('hunter-id-shortcuts', () => {
    copyIdButton.remove();
    successMessage.remove();
    profilePic.removeEventListener('click', clickAction);
    if (hidebutton && null !== originalOnclick) {
      profilePic.setAttribute('onclick', originalOnclick);
    }
  });
};
