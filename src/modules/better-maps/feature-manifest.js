import { isSidebarHidden } from '@utils';

import catchDates from './modules/catch-dates';
import draggableHighlight from './modules/draggable-highlight';
import sidebar from './modules/sidebar';

const featureManifest = [
  // Only add map goals to the sidebar when there's a sidebar to add them to.
  { id: 'sidebar', setting: 'better-maps.show-sidebar-goals', default: true, condition: () => !isSidebarHidden(), load: sidebar },
  { id: 'catch-dates', setting: 'better-maps.catch-dates', default: false, load: catchDates },
  { id: 'draggable-highlight', setting: 'better-maps.draggable-highlight', default: false, load: draggableHighlight },
];

export default featureManifest;
