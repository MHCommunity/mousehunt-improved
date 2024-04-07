import { addStyles, getUserTitle } from '@utils';

import styles from './styles.css';

const getUserShield = () => {
  const titleImgs = {
    novice: '84bc1109b5cd7aa8c24d195bc8207c38.png',
    recruit: '3f1e44bbaa7138da4c326819e9f3f0a8.png',
    apprentice: '6f4673dd2d9d1e98b4569667d702a775.png',
    initiate: 'e96387f7261b95c0eeab9291e4e594e1.png',
    journeyman: 'ad6875955f541159133c6d3798519f81.png',
    master: '35ee6056a09037fb13a9195881875045.png',
    grandmaster: '0da3761747914f497c16dc2051ba132d.png',
    legendary: 'fca35751046f4bcc972716ca484b6d61.png',
    hero: '0567284d6e12aaaed35ca5912007e070.png',
    knight: '398dca9a8c7703de969769491622ca32.png',
    lord: '9a6acd429a9a3a4849ed13901288b0b8.png',
    baron: 'ea9c0ec2e6d3d81c14e61f5ce924d0e1.png',
    count: 'dd11711a25b80db90e0306193f2e8d78.png',
    duke: 'eb46ac1e8197b13299ab860f07d963db.png',
    grandduke: '87937fa96bbb3b2dd3225df883002642.png',
    archduke: '043efe31de4f0f2e0ddca590fe829032.png',
    viceroy: 'e2e79f6f9201a4d4e7a89684fbb5356f.png',
    elder: '0f3cf224bf98457f6b5bad91ab1c7bd2.png',
    sage: 'cb49e43c5e4460da7c09fe28ca4f44ce.png',
    fabled: '5daba92a8d609834aa8b789f37544e08.png',
  };

  const title = getUserTitle();

  return titleImgs[title] || titleImgs.novice;
};

export default async () => {
  addStyles([
    styles,
    `.headsup .shieldped { background-image: url(${getUserShield()}); }`
  ], 'experiment-legacy-hud-tweaks');
};
