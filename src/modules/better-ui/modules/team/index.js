import { getData, makeElement, onNavigation, onRequest, replaceInTemplate } from '@utils';

const journalsWithTournamentCheck =
  '{{#in_active_tournament}}{{#journals}}<div class="teamPage-journal teamjournal journalRow">{{{entry}}}</div>{{/journals}}{{^journals}}<div class="teamPage-memberJournal-empty">No recent activity.</div>{{/journals}}{{/in_active_tournament}}{{^in_active_tournament}}<div class="teamPage-memberJournal-empty">Not currently in an active tournament.</div>{{/in_active_tournament}}';
const journalsAlways =
  '{{#journals}}<div class="teamPage-journal teamjournal journalRow">{{{entry}}}</div>{{/journals}}{{^journals}}<div class="teamPage-memberJournal-empty">No recent activity.</div>{{/journals}}';

const trapSetupText =
  '<b>Base:</b><i>{{base_name}}</i><br /><b>Weapon:</b><i>{{weapon_name}}</i><br /><b>Cheese:</b><i>{{bait_name}}</i><br /><b>Charm:</b><i>{{trinket_name}}</i>';
const trapSetupVisual =
  '<div class="treasureMapView-allyCell trap"><div class="treasureMapView-componentContainer"><div class="treasureMapView-componentThumb" style="{{#base_thumb}}background-image: url({{base_thumb}});{{/base_thumb}}" title="{{base_name}}"></div><div class="treasureMapView-componentThumb" style="{{#weapon_thumb}}background-image: url({{weapon_thumb}});{{/weapon_thumb}}" title="{{weapon_name}}"></div><div class="treasureMapView-componentThumb" style="{{#bait_thumb}}background-image: url({{bait_thumb}});{{/bait_thumb}}" title="{{bait_name}}"></div><div class="treasureMapView-componentThumb" style="{{#trinket_thumb}}background-image: url({{trinket_thumb}});{{/trinket_thumb}}" title="{{trinket_name}}"></div></div></div>';

let itemImageByName = null;

/**
 * Build a lookup of item name to thumbnail image from the item data.
 *
 * @return {Promise<Map<string, string>>} The name-to-thumbnail lookup.
 */
const getItemImageLookup = async () => {
  if (itemImageByName) {
    return itemImageByName;
  }

  const items = await getData('items');
  itemImageByName = new Map();

  if (Array.isArray(items)) {
    for (const item of items) {
      if (item?.name && item?.images?.thumbnail) {
        itemImageByName.set(item.name, item.images.thumbnail);
      }
    }
  }

  return itemImageByName;
};

/**
 * Replace any text trap setups on the team page with thumbnails looked up by item name.
 *
 * The game's member data doesn't include the trap thumb URLs the template guards on,
 * so build the same visual as the map hunters tab from our own item data.
 */
const showTrapSetupVisuals = async () => {
  const setups = [...document.querySelectorAll('.teamPage-memberJournal-trapSetup')].filter((setup) => !setup.querySelector('.treasureMapView-componentContainer'));
  if (!setups.length) {
    return;
  }

  const lookup = await getItemImageLookup();
  if (!lookup.size) {
    return;
  }

  setups.forEach((setup) => {
    const names = [...setup.querySelectorAll('i')].map((el) => el.textContent.trim());
    if (!names.some(Boolean)) {
      return;
    }

    const container = makeElement('div', 'treasureMapView-componentContainer');
    names.forEach((name) => {
      const thumb = makeElement('div', 'treasureMapView-componentThumb');
      thumb.title = name;

      const image = lookup.get(name);
      if (image) {
        thumb.style.backgroundImage = `url(${image})`;
      }

      container.append(thumb);
    });

    const cell = makeElement('div', ['treasureMapView-allyCell', 'trap']);
    cell.append(container);
    setup.replaceChildren(cell);
  });
};

/**
 * Re-render the team page when it was drawn before the template swap applied.
 *
 * On a direct page load, the game renders PageTeam before this module swaps the
 * template, so the journals-outside-tournaments change misses the initial render.
 * The swapped template never emits the tournament notice, so this can't loop.
 */
const refreshStaleTeamPage = () => {
  const isStale = [...document.querySelectorAll('.teamPage-memberJournal-empty')].some((el) => el.textContent.includes('Not currently in an active tournament'));
  if (isStale) {
    hg?.utils?.PageUtil?.setPage?.('Team');
  }
};

/**
 * Rewrite the team page template: show member journals even when the team isn't in an
 * active tournament, and show each member's trap setup visually (like the hunters tab
 * on maps) instead of as a text list.
 */
export default () => {
  replaceInTemplate('PageTeam', [
    [journalsWithTournamentCheck, journalsAlways],
    [
      `<div class="teamPage-memberJournal-trapSetup">${trapSetupText}</div>`,
      `<div class="teamPage-memberJournal-trapSetup">{{#base_thumb}}${trapSetupVisual}{{/base_thumb}}{{^base_thumb}}${trapSetupText}{{/base_thumb}}</div>`,
    ],
  ]);

  onNavigation(
    () => {
      refreshStaleTeamPage();
      showTrapSetupVisuals();
    },
    {
      page: 'team',
    }
  );

  // The page re-renders in the game's own response handler, so retry a few times.
  onRequest('pages/team.php', () => {
    showTrapSetupVisuals();
    setTimeout(showTrapSetupVisuals, 500);
    setTimeout(showTrapSetupVisuals, 1500);
  });
};
