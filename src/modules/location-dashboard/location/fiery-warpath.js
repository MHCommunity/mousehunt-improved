import { getCurrentLocation } from '@/utils';

const getFieryWarpathText = (quests) => {
  if (! quests.QuestFieryWarpath) {
    return '';
  }

  const quest = {
    wave: quests?.QuestFieryWarpath?.wave || 0,
    streak: quests?.QuestFieryWarpath?.streak || 0,
    remaining: quests?.QuestFieryWarpath?.remaining || 0,
    percent: quests?.QuestFieryWarpath?.percent || 100,
  };

  let streakText = '';
  if (quest.streak !== 0) {
    streakText = `, ${quest.streak} streak`;
  }

  return `Wave ${quest.wave}: ${quest.percent}% remaining${streakText} `;
};

const setFieryWarpathData = () => {
  if ('desert_warpath' !== getCurrentLocation()) {
    return false;
  }

  let wave = 0;
  let streak = 'No Streak';
  let remaining = 0;
  let percent = 100;

  const waveEl = document.querySelector('.warpathHUD.showPortal');
  if (waveEl) {
    // get the classlist and find the one that starts with 'wave'
    const waveClass = Array.from(waveEl.classList).find((className) => className.startsWith('wave'));
    wave = parseInt(waveClass.replace('wave', '').replace('_', ''));
  }

  const streakEl = document.querySelector('.warpathHUD-streakBoundingBox');
  if (streakEl) {
    streak = parseInt(streakEl.innerText.replaceAll('\n', ' ').replace(' 0', '').trim());
  }

  const remaininEl = document.querySelectorAll('.warpathHUD-wave-mouse-population');
  if (remaininEl.length) {
    // sum all the values that have an innerText
    remaining = Array.from(remaininEl).reduce((sum, el) => {
      if (el.innerText) {
        sum += parseInt(el.innerText);
      }
      return sum;
    }, 0);

    // subtract 2 for the commander and guard.
    remaining = remaining - 2;
  }

  const percentEl = document.querySelector('.warpathHUD-moraleBar span');
  if (percentEl) {
    // get the style attribute and parse the width value.
    const style = percentEl.getAttribute('style');
    if (style) {
      percent = parseInt(style.replace('width:', '').replace('%;', ''));
    }
  }

  return {
    wave,
    streak,
    remaining,
    percent,
  };
};

export {
  getFieryWarpathText,
  setFieryWarpathData
};
