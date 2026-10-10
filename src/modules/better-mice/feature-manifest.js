import hoverMice from './modules/hover-mice';
import kingsCrowns from './modules/kings-crowns';
import mousePage from './modules/mouse-page';
import sidebar from './modules/sidebar';
import { prizeInfo } from './modules/prize-info';

const featureManifest = [
  { id: 'mouse-page', load: mousePage },
  { id: 'kings-crowns', load: kingsCrowns },
  { id: 'prize-info', load: prizeInfo },
  { id: 'hover-mice', setting: 'better-mice.show-mouse-hover', default: true, load: hoverMice },
  { id: 'sidebar', setting: 'better-mice.show-sidebar', default: true, load: sidebar },
];

export default featureManifest;
