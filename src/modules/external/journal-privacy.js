export default () => {
  const applyClassToNames = () => {
    const entries = document.querySelectorAll('#journalContainer .entry.relicHunter_start .journaltext');
    if (! entries) {
      return;
    }

    entries.forEach((entry) => {
      if (! entry || ! entry.textContent) {
        return;
      }

      // if entry matches a name, add class
      const match = entry.textContent.match(/(.*)( has joined the | has left the | used Rare Map Dust |, the map owner, has )/);
      if (match && match[ 1 ]) {
        // Wrap the match in a span.
        const span = document.createElement('span');
        span.classList.add('mh-journal-privacy-name');
        span.textContent = match[ 1 ];

        // Replace the match with the span.
        entry.innerHTML = entry.innerHTML.replace(match[ 1 ], span.outerHTML);
      }
    });
  };

  addStyles(`#journalContainer .entry:not(.badge) a[href*="profile.php"],
  #journalContainer .entry.socialGift .journaltext a,
  #journalContainer .relicHunter_complete>.journalbody>.journaltext>b:nth-child(6),
  #journalContainer .wanted_poster-complete>.journalbody>.journaltext>b:nth-child(8),
  #journalContainer .journal__hunter-name,
  .mh-journal-privacy-name {
    display: inline-block;
    width: 50px;
    height: 12px;
    overflow: hidden;
    color: transparent;
  }

  #journalContainer .entry:not(.badge) a[href*="profile.php"]:hover,
  #journalContainer .entry:not(.badge) a[href*="profile.php"]:focus,
  #journalContainer .entry.socialGift .journaltext a:hover,
  #journalContainer .entry.socialGift .journaltext a:focus,
  #journalContainer .relicHunter_complete>.journalbody>.journaltext>b:nth-child(6):hover,
  #journalContainer .relicHunter_complete>.journalbody>.journaltext>b:nth-child(6):focus,
  #journalContainer .wanted_poster-complete>.journalbody>.journaltext>b:nth-child(8):hover,
  #journalContainer .wanted_poster-complete>.journalbody>.journaltext>b:nth-child(8):focus #journalContainer .journal__hunter-name:hover,
  #journalContainer .journal__hunter-name:focus,
  .mh-journal-privacy-name:hover,
  .mh-journal-privacy-name:focus {
    display: inline;
    color: #3b5998;
  }
  `);

  onAjaxRequest(() => {
    applyClassToNames();
  }, 'managers/ajax/pages/journal.php');
};
