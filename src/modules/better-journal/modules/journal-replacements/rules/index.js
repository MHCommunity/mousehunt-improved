import cleanup from './cleanup';
import events from './events';
import hunt from './hunt';
import maps from './maps';
import other from './other';

export default [...hunt, ...maps, ...other, ...events, ...cleanup];
