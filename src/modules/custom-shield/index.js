import { addUIStyles, getMhuiSetting } from '../utils';
import styles from './styles.css';

const addClass = (el, shieldClass) => {
  const classToAdd = shieldClass.replace('.', ' ');

  classToAdd.split(' ').forEach((className) => {
    el.classList.add(className);
  });
};

const changeShield = () => {
  const shield = getMhuiSetting('custom-shield-0', 'default');
  if ('default' === shield) {
    return;
  }

  const shieldEl = document.querySelector('.mousehuntHud-shield');
  if (! shieldEl) {
    return;
  }

  // remove all the classes from the shield exceptfor .mousehuntHud-shield and .golden.
  shieldEl.classList.forEach((className) => {
    if (className !== 'mousehuntHud-shield' && className !== 'golden') {
      shieldEl.classList.remove(className);
    }
  });

  addClass(shieldEl, `${shield}-shield`);

  if ('title' === shield) {
    shieldEl.style.backgroundImage = `url(${titleBadge()})`;
  }
};

const titleBadge = () => {
  let title = user.title_name || 'novice';
  title = title.toLowerCase();

  title.replace('lady', 'lord');
  title.replace('wo', '');
  title.replace('ess', '');
  title.replace('duch', 'duke');

  const titleImages = {
    novice: 'https://www.mousehuntgame.com/images/titles/84bc1109b5cd7aa8c24d195bc8207c38.png?cv=2',
    apprentice: 'https://www.mousehuntgame.com/images/titles/3f1e44bbaa7138da4c326819e9f3f0a8.png?cv=2',
    initiate: 'https://www.mousehuntgame.com/images/titles/6f4673dd2d9d1e98b4569667d702a775.png?cv=2',
    journeyman: 'https://www.mousehuntgame.com/images/titles/e96387f7261b95c0eeab9291e4e594e1.png?cv=2',
    master: 'https://www.mousehuntgame.com/images/titles/ad6875955f541159133c6d3798519f81.png?cv=2',
    grandmaster: 'https://www.mousehuntgame.com/images/titles/35ee6056a09037fb13a9195881875045.png?cv=2',
    legendary: 'https://www.mousehuntgame.com/images/titles/0da3761747914f497c16dc2051ba132d.png?cv=2',
    hero: 'https://www.mousehuntgame.com/images/titles/fca35751046f4bcc972716ca484b6d61.png?cv=2',
    knight: 'https://www.mousehuntgame.com/images/titles/398dca9a8c7703de969769491622ca32.png?cv=2',
    lord: 'https://www.mousehuntgame.com/images/titles/9a6acd429a9a3a4849ed13901288b0b8.png?cv=2',
    baron: 'https://www.mousehuntgame.com/images/titles/ea9c0ec2e6d3d81c14e61f5ce924d0e1.png?cv=2',
    count: 'https://www.mousehuntgame.com/images/titles/dd11711a25b80db90e0306193f2e8d78.png?cv=2',
    duke: 'https://www.mousehuntgame.com/images/titles/eb46ac1e8197b13299ab860f07d963db.png?cv=2',
    grandduke: 'https://www.mousehuntgame.com/images/titles/87937fa96bbb3b2dd3225df883002642.png?cv=2',
    archduke: 'https://www.mousehuntgame.com/images/titles/043efe31de4f0f2e0ddca590fe829032.png?cv=2',
    viceroy: 'https://www.mousehuntgame.com/images/titles/e2e79f6f9201a4d4e7a89684fbb5356f.png?cv=2',
    elder: 'https://www.mousehuntgame.com/images/titles/0f3cf224bf98457f6b5bad91ab1c7bd2.png?cv=2',
    sage: 'https://www.mousehuntgame.com/images/titles/cb49e43c5e4460da7c09fe28ca4f44ce.png?cv=2',
    fabled: 'https://www.mousehuntgame.com/images/titles/5daba92a8d609834aa8b789f37544e08.png?cv=2',
  };

  return titleImages[title];
};

const changeShieldColor = () => {
  const color = localStorage.getItem('custom-shield-color');
  if (! color) {
    return;
  }

  const classes = [
    'a.mousehuntHud-shield.golden'
  ];

  const matchTimer = localStorage.getItem('custom-shield-timer');
  if (matchTimer) {
    classes.push('.huntersHornView__timer--default');
  }

  addUIStyles(` ${classes.join(', ')}{ filter: hue-rotate(${color}deg); }`);
};

export default () => {
  addUIStyles(styles);

  changeShield();

  changeShieldColor();
};
