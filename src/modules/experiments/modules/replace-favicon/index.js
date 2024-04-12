import { onTurn } from '@utils';

const replace = () => {
  const favicon = document.querySelector('link[rel="SHORTCUT ICON"]'); // idk why it's all caps on the site, but it is.
  if (favicon) {
    favicon.href = 'https://www.mousehuntgame.com/images/ui/elements/golden_shield_page_shield_320.png';
  }
};

export default async () => {
  replace();
  onTurn(replace, 2500);
};
