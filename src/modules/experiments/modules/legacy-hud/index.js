import { addStyles } from '@utils';

import styles from './styles.css';

const getMapText = () => {
  if (user.quests.QuestRelicHunter.maps.length) {
    return user.quests.QuestRelicHunter.label.replace('Treasure Map', '').trim();
  }

  const amount = user.quests.QuestRelicHunter.num_invites;
  if (amount > 1) {
    return `${amount} invites`;
  } else if (amount === 1) {
    return `${amount} invite`;
  }
  return 'Start new';
};

const getEquippedStat = (type, label, id, name, quantity) => {
  return `<li class="mousehuntHud-userStat ${type}" data-item-id="${id}">
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
          <img src="${user.title_icon}" width="12" height="14" border="0" class="hud_titleIcon">
        </a>
      </div>
    </div>
    <div id="hud_statList1" class="hudstatlist">
      <ul>
        <li>
          <span class="hudstatlabel">Location:</span>
          <a href="#" class="hudstatvalue hud_location" onclick="hg.utils.PageUtil.setPage('Travel'); return false;">
            ${user.environment_name}
          </a>
        </li>
        <li>
          <span class="hudstatlabel">Title:</span>
          <span class="hud_title">
            <a href="#" class="hudstatvalue" onclick="hg.utils.PageUtil.setPage('Title'); return false;">
              ${user.title_name}
            </a>
          </span> (<span class="hud_titlePercentage">${user.title_percent}</span>%)
        </li>
        <li>
          <div class="mousehuntHud-titleProgressBar">
            <span class="dot"></span>
            <div class="wrapper">
              <span class="bar" style="width: ${user.title_percent}%;"></span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div id="cheeseped" class="cheeseped">
      <a href="#" class="baiticon" target="_parent" onclick="hg.utils.PageUtil.setPage('Inventory', {tab:'cheese'}); return false;">
        <img id="hud_baitIcon" src="${user.bait_thumb}" border="0" title="${user.bait_name} ${user.bait_quantity.toLocaleString()}">
      </a>
    </div>
    <div class="hudstatlist legacyFix">
      <ul>
        ${getEquippedStat('base', 'Base', user.base_item_id, user.base_name)}
        ${getEquippedStat('weapon', 'Weapon', user.weapon_item_id, user.weapon_name)}
        ${getEquippedStat('trinket', 'Charm', user.trinket_item_id, user.trinket_name)}
      </ul>
    </div>
    <div class="hudstatlist legacyFix">
      <ul>
        ${getStat('gold', 'Gold', user.gold.toLocaleString())}
        ${getStat('points', 'Points', user.points.toLocaleString())}
        ${getEquippedStat('bait', 'Bait', user.bait_item_id, user.bait_name, user.bait_quantity.toLocaleString())}
      </ul>
    </div>
    <div class="hudstatlist">
      <ul>
        <li>
          <span class="hudstatlabel">Team:</span>
          <span id="hud_team">
            <a href="https://www.mousehuntgame.com/team.php?team_id=${user.team.id}" class="hud_team_name hudstatvalue" onclick="app.pages.TeamPage.showUserTeamPage(); return false;">
              ${user.team.name}
            </a>
            <div class="corkboardUpdate ${user.team.new_chat ? 'active' : ''}"></div>
          </span>
        </li>
        <a class="mousehuntHud-userStat treasureMap ${user.quests.QuestRelicHunter.maps.length ? 'active' : 'empty'}" onclick="hg.controllers.TreasureMapController.show();return false;" href="#">
          <div class="icon" style="${user.quests.QuestRelicHunter.maps.length ? `background-image: url(${user.quests.QuestRelicHunter.image})` : ''}">
            <div class="notification ${user.quests.QuestRelicHunter.notifications.length ? 'active' : ''}">${user.quests.QuestRelicHunter.notifications}</div>
            <div class="corkboardUpdate ${user.quests.QuestRelicHunter.new_chat ? 'active' : ''}"></div>
            <div class="miceWarning ${user.quests.QuestRelicHunter.mice_warning ? 'active' : ''}"></div>
          </div>
          <span class="label">Treasure Maps</span>
          <span class="value">${getMapText()}</span>
        </a>
      </ul>
    </div>
    <div class="marblebevel"></div>
  </div>`;
};

const makeOldMenu = () => {
  const body = document.querySelector('body');
  if (! body) {
    return;
  }

  const mpLink = document.querySelector('.mousehuntHud-marketPlace');
  if (mpLink) {
    if (isLegacy) {
      const oldCampButton = document.querySelector('#mh-legacy-mode-camp-button');
      if (oldCampButton) {
        oldCampButton.classList.add('mh-legacy-mode-remove');
      }
    } else {
      const existingOldCampButton = document.querySelector('#mh-legacy-mode-camp-button');
      if (existingOldCampButton) {
        existingOldCampButton.classList.remove('mh-legacy-mode-remove');
      } else {
        const oldCampButton = document.createElement('a');
        oldCampButton.id = 'mh-legacy-mode-camp-button';
        oldCampButton.href = 'https://www.mousehuntgame.com/';
        oldCampButton.classList.add('mousehuntHud-campButton', 'mh-legacy-mode-add');
        oldCampButton.onclick = function () {
          hg.utils.PageUtil.setPage('Camp');
          return false;
        };

        mpLink.parentNode.insertBefore(oldCampButton, mpLink.nextSibling);
      }
    }
  }

  const menu = document.querySelector('.mousehuntHud-menu');
  if (menu) {
    if (isLegacy) {
      menu.classList.remove('legacy');
      menu.classList.add('default');
    } else {
      menu.classList.remove('default');
      menu.classList.add('legacy');
    }
  }

  const timer = document.querySelector('.huntersHornView__timer');
  if (timer) {
    if (isLegacy) {
      timer.classList.remove('huntersHornView__timer--legacy');
      timer.classList.add('huntersHornView__timer--default');
    } else {
      timer.classList.remove('huntersHornView__timer--default');
      timer.classList.add('huntersHornView__timer--legacy');
    }
  }

  const kingdomMenu = document.querySelector('.mousehuntHud-menu .kingdom');
  const friendsMenu = document.querySelector('.mousehuntHud-menu .friends');
  if (kingdomMenu && friendsMenu) {
    if (isLegacy) {
      const teams = document.querySelector('#mh-legacy-mode-teams');
      if (teams) {
        teams.classList.add('mh-legacy-mode-remove');
      }

      const lore = document.querySelector('#mh-legacy-mode-lore');
      if (lore) {
        lore.classList.add('mh-legacy-mode-remove');
      }

      kingdomMenu.classList.add('hasChildren');
    } else {
      const existing = document.querySelector('#mh-legacy-mode-teams');
      if (existing) {
        existing.classList.remove('mh-legacy-mode-remove');
      } else {
        const teams = friendsMenu.cloneNode(true);
        teams.id = 'mh-legacy-mode-teams';
        teams.classList.remove('friends');
        teams.classList.add('team', 'mh-legacy-mode-add');

        kingdomMenu.parentNode.insertBefore(teams, kingdomMenu.nextSibling);
      }

      const existingLore = document.querySelector('#mh-legacy-mode-lore');
      if (existingLore) {
        existingLore.classList.remove('mh-legacy-mode-remove');
      } else {
        const lore = kingdomMenu.cloneNode(true);
        lore.id = 'mh-legacy-mode-lore';
        lore.classList.remove('kingdom');
        lore.classList.add('scoreboards', 'mh-legacy-mode-add');

        kingdomMenu.parentNode.insertBefore(lore, kingdomMenu.nextSibling);
      }
    }
  }

  const hudStats = document.querySelector('.headsUpDisplayView-stats');
  if (hudStats) {
    if (isLegacy) {
      const legacyHud = document.querySelector('#mh-legacy-mode-hud');
      if (legacyHud) {
        legacyHud.remove();
      }
    } else {
      const legacyHud = document.createElement('div');
      legacyHud.id = 'mh-legacy-mode-hud';
      legacyHud.classList.add('headsup');
      legacyHud.innerHTML = getLegacyHudHtml();

      hudStats.parentNode.insertBefore(legacyHud, hudStats.nextSibling);
    }
  }

  if (isLegacy) {
    const oldHud = document.querySelector('#legacy-hud');
    if (oldHud) {
      oldHud.remove();
    }
  }

  body.classList.toggle('mh-legacy-mode');
  isLegacy = ! isLegacy;
};

let isLegacy = false;
export default async () => {
  addStyles(styles, 'experiment-legacy-hud');

  makeOldMenu();
};
