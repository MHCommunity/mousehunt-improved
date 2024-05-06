import { addStyles, getSetting, getUserTitle, makeElement } from '@utils';

import settings from './settings';

import generalStyles from './styles.css';
import menuStyles from './menu.css';
import statsStyles from './stats.css';
import tweaksStyles from './tweaks.css';

const getMapText = () => {
  if (user?.quests?.QuestRelicHunter?.maps?.length) {
    return user.quests.QuestRelicHunter.label.replace('Treasure Map', '').trim();
  }

  const amount = user?.quests?.QuestRelicHunter?.num_invites || 0;
  if (amount > 1) {
    return `${amount} invites`;
  } else if (amount === 1) {
    return `${amount} invite`;
  }
  return 'Start new';
};

const getEquippedStat = (type, label, id, name, quantity) => {
  return `<li class="mousehuntHud-userStat ${type}" data-item-id="${id}" data-itemId="${id}">
    <span class="hudstatlabel">${label}:</span>
    <span id="hud_${type}" class="hudstatvalue">
      <a href="#" class="label" onclick="hg.utils.PageUtil.setPage('Inventory', {tab:'traps', sub_tab:'${type}'}); return false;">
        ${name}
      </a>
    </span>
    ${quantity ? `<span class="hud_baitQuantity value">${quantity}</span>` : ''}
  </li>`;
};

const getStat = (type, label, value) => {
  return `<li>
    <span class="hudstatlabel">${label}:</span>
    <span class="hud_${type} hudstatvalue">${value}</span>
  </li>`;
};

const getLegacyHudHtml = () => {
  return `<div id="#legacy-hud" class="headsup">
    <div class="shieldped">
      <div class="titleicon">
        <a href="#" onclick="hg.utils.PageUtil.setPage('Title'); return false;">
          <img src="${user?.title_icon}" width="12" height="14" border="0" class="hud_titleIcon">
        </a>
      </div>
    </div>
    <div id="hud_statList1" class="hudstatlist">
      <ul>
        <li>
          <span class="hudstatlabel">Location:</span>
          <a href="#" class="hudstatvalue hud_location" onclick="hg.utils.PageUtil.setPage('Travel'); return false;">
            ${user?.environment_name}
          </a>
        </li>
        <li>
          <span class="hudstatlabel">Title:</span>
          <span class="hud_title">
            <a href="#" class="hudstatvalue" onclick="hg.utils.PageUtil.setPage('Title'); return false;">
              ${user?.title_name}
            </a>
          </span> (<span class="hud_titlePercentage">${user?.title_percent}%</span>)
        </li>
        <li>
          <div class="mousehuntHud-titleProgressBar">
            <span class="dot"></span>
            <div class="wrapper">
              <span class="bar" style="width: ${user?.title_percent}%"></span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div id="cheeseped" class="cheeseped">
      <a href="#" class="baiticon" target="_parent" onclick="hg.utils.PageUtil.setPage('Inventory', {tab:'cheese'}); return false;">
        <img id="hud_baitIcon" src="${user?.bait_thumb}" border="0">
      </a>
    </div>
    <div class="hudstatlist legacyFix">
      <ul>
        ${getEquippedStat('base', 'Base', user?.base_item_id, user?.base_name)}
        ${getEquippedStat('weapon', 'Weapon', user?.weapon_item_id, user?.weapon_name)}
        ${getEquippedStat('trinket', 'Charm', user?.trinket_item_id, user?.trinket_name)}
      </ul>
    </div>
    <div class="hudstatlist legacyFix">
      <ul>
        ${getStat('gold', 'Gold', user?.gold.toLocaleString())}
        ${getStat('points', 'Points', user?.points.toLocaleString())}
        ${getEquippedStat('bait', 'Bait', user?.bait_item_id, user?.bait_name, user?.bait_quantity)}
      </ul>
    </div>
    <div class="hudstatlist">
      <ul>
        <li>
          <span class="hudstatlabel">Team:</span>
          <span id="hud_team">
            <a href="https://www.mousehuntgame.com/team.php?team_id=${user?.team.id}" class="hud_team_name hudstatvalue" onclick="app.pages.TeamPage.showUserTeamPage(); return false;">
              ${user?.team.name}
            </a>
            <div class="corkboardUpdate ${user?.team.new_chat ? 'active' : ''}"></div>
          </span>
        </li>
        <a class="mousehuntHud-userStat treasureMap ${user?.quests?.QuestRelicHunter?.maps?.length ? 'active' : 'empty'}" onclick="hg.controllers.TreasureMapController.show();return false;" href="#">
          <div class="icon" style="${user?.quests?.QuestRelicHunter?.maps?.length ? `background-image: url(${user?.quests?.QuestRelicHunter?.image})` : ''}">
            <div class="notification ${user?.quests?.QuestRelicHunter?.notifications?.length ? 'active' : ''}">${user?.quests?.QuestRelicHunter?.notifications}</div>
            <div class="corkboardUpdate ${user?.quests?.QuestRelicHunter?.new_chat ? 'active' : ''}"></div>
            <div class="miceWarning ${user?.quests?.QuestRelicHunter?.mice_warning ? 'active' : ''}"></div>
          </div>
          <span class="label">Treasure Maps</span>
          <span class="value">${getMapText()}</span>
        </a>
      </ul>
    </div>
    <div class="marblebevel"></div>
  </div>`;
};

const replaceMenuBar = () => {
  const body = document.querySelector('body');
  if (! body) {
    return;
  }

  const mpLink = document.querySelector('.mousehuntHud-marketPlace');
  if (mpLink) {
    const existingOldCampButton = document.querySelector('.mh-legacy-mode-camp-button');
    if (! existingOldCampButton) {
      const oldCampButton = makeElement('a', ['mousehuntHud-campButton', 'mh-legacy-mode-camp-button']);
      oldCampButton.href = 'https://www.mousehuntgame.com/';
      oldCampButton.onclick = () => {
        hg.utils.PageUtil.setPage('Camp');
        return false;
      };

      mpLink.parentNode.insertBefore(oldCampButton, mpLink.nextSibling);
    }
  }

  const menu = document.querySelector('.mousehuntHud-menu');
  if (menu) {
    menu.classList.remove('default');
    menu.classList.add('legacy');
  }

  const timer = document.querySelector('.huntersHornView__timer');
  if (timer) {
    timer.classList.remove('huntersHornView__timer--default');
    timer.classList.add('huntersHornView__timer--legacy');
  }

  const kingdomMenu = document.querySelector('.mousehuntHud-menu .kingdom');
  const friendsMenu = document.querySelector('.mousehuntHud-menu .friends');
  if (kingdomMenu && friendsMenu) {
    const existing = document.querySelector('.mh-legacy-mode-teams');
    if (! existing) {
      const teams = friendsMenu.cloneNode(true);
      teams.classList.remove('friends');
      teams.classList.add('team', 'mh-legacy-mode-teams');

      kingdomMenu.parentNode.insertBefore(teams, kingdomMenu.nextSibling);
    }

    const existingLore = document.querySelector('.mh-legacy-mode-lore');
    if (! existingLore) {
      const lore = kingdomMenu.cloneNode(true);
      lore.classList.remove('kingdom');
      lore.classList.add('scoreboards', 'mh-legacy-mode-lore');

      kingdomMenu.parentNode.insertBefore(lore, kingdomMenu.nextSibling);
    }
  }
};

const replaceStatsBar = () => {
  const hudStats = document.querySelector('.headsUpDisplayView-stats');
  if (hudStats) {
    const existingLegacyHud = document.querySelector('.mh-legacy-mode-hud');
    if (! existingLegacyHud) {
      const legacyHud = makeElement('div', ['headsup', 'mh-legacy-mode-hud'], getLegacyHudHtml());

      hudStats.parentNode.insertBefore(legacyHud, hudStats.nextSibling);
    }
  }

  const oldStats = document.querySelector('.mousehuntHud-userStatBar');
  if (oldStats) {
    oldStats.remove();
  }
};

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

/**
 * Initialize the module.
 */
const init = async () => {
  const stylesToAdd = [];

  const loadMenu = getSetting('legacy-hud.menu', false);
  const loadStats = getSetting('legacy-hud.stats', false);
  const loadBoth = loadMenu === loadStats;

  if (loadMenu || loadBoth) {
    stylesToAdd.push(menuStyles);
    replaceMenuBar();
  }

  if (loadStats || loadBoth) {
    stylesToAdd.push(statsStyles);
    replaceStatsBar();
  }

  if (loadStats || loadMenu || loadBoth) {
    stylesToAdd.push(generalStyles);
  }

  if (getSetting('legacy-hud.tweaks', true)) {
    stylesToAdd.push(tweaksStyles, `.headsup .shieldped { background-image: url(${getUserShield()}); }`);
  }

  addStyles(stylesToAdd, 'legacy-hud');
};

export default {
  id: 'legacy-hud',
  name: 'Legacy HUD & Legacy HUD Tweaks',
  type: 'feature',
  default: false,
  description: 'Enable the legacy HUD or tweaks to it.',
  load: init,
  settings,
};
