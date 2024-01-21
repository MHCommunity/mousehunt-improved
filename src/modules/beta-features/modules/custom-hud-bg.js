import { addStyles } from '@utils';
/**
 * Inject styles for the custom HUD background.
 *
 * @param {string} color The color to use for the background.
 */
export default (color) => {
  addStyles(`body .mousehuntHud-marbleDrawer {
    background: url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif?asset_cache_version=2) -46px 0 no-repeat,url(https://www.mousehuntgame.com/images/ui/hud/mousehuntHudPedestal.gif?asset_cache_version=2) 731px 0 no-repeat,url(https://i.mouse.rip/mh-improved/marble-shadow.png) 6px 0 no-repeat,url(https://i.mouse.rip/marble-bg-${color}.png) repeat-y top center;
  }`);
};
