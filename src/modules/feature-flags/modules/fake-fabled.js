import { addStyles } from '@utils';

export default async () => {
  addStyles(`.mousehuntHud-userStat.title .mousehuntHud-userStat-maxTitle { display: block; }
.mousehuntHud-userStat.title .value,
.mousehuntHud-userStat.title .mousehuntHud-titleProgressBar { display: none; }`, 'fake-fabled');
};
