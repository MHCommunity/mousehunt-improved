import { addUIStyles } from '../../utils';
import styles from './styles.css';

const updateClosingTime = () => {
  const closingPercent = user?.quests?.QuestForbiddenGrove?.grove?.progress || 0;
  const timeLeft = 16 * (closingPercent / 100);

  // convert the decimal hours to hours and minutes
  const hours = Math.floor(timeLeft);
  const minutes = Math.round((timeLeft - hours) * 60);

  const timeLeftText = `Approx. ${hours}h ${minutes}m remaining`;

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
  onTravel(null, () => {
    clearInterval(timer);
  });
};

export default function forbiddenGrove() {
  addUIStyles(styles);

  run(main);
}
