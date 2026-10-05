/**
 * The game renders the member name links on the team page with an empty onclick
 * handler, so clicking a name does nothing. Open the profile the same way the
 * member's image link does.
 */
export default () => {
  document.addEventListener('click', (event) => {
    const nameLink = event.target.closest('.teamPage-member-name a');
    if (!nameLink) {
      return;
    }

    const imageLink = nameLink.closest('.teamPage-memberRow-identity')?.querySelector('a.teamPage-member-image');
    if (!imageLink || !imageLink.getAttribute('onclick')?.includes('showHunterProfile')) {
      return;
    }

    event.preventDefault();
    imageLink.click();
  });
};
