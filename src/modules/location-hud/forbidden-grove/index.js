const updateClosingTime = () => {
  let timeLeftText = '';

  // Props Warden Slayer & Timers+ for the math and logic.
  const today = new Date();
  const rotationLength = 20;
  const rotationsExact = (((today.getTime() / 1000.0) - 1285704000) / 3600) / rotationLength;
  const rotationsInteger = Math.floor(rotationsExact);
  const partialrotation = (rotationsExact - rotationsInteger) * rotationLength;
  if (partialrotation < 16) {
    const closes = (16 - partialrotation).toFixed(3);
    const hours = Math.floor(closes);
    const minutes = Math.ceil((closes - Math.floor(closes)) * 60);

    timeLeftText = `${hours}h ${minutes}m remaining`;
  }

  const timeLeftEl = document.createElement('div');
  timeLeftEl.classList.add('forbiddenGroveHUD-grovebar-timeLeft');
  timeLeftEl.innerText = timeLeftText;

  return timeLeftEl;
};

const main = () => {
  if ('forbidden_grove' !== getCurrentLocation()) {
    return;
  }

  const hudBar = document.querySelector('.forbiddenGroveHUD-grovebar');
  if (! hudBar) {
    return;
  }

  const existing = document.querySelector('.forbiddenGroveHUD-grovebar-timeLeft');
  if (existing) {
    existing.remove();
  }

  const timeLeftEl = updateClosingTime();

  hudBar.appendChild(timeLeftEl);

  // add a timer to update the time left
  const timer = setInterval(updateClosingTime, 60 * 1000);
  onTravel(null, { callback: () => {
    clearInterval(timer);
  } });
};

export default main;
