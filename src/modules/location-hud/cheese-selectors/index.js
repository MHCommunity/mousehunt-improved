/**
 * Adds a cheese selector a a location that usually doesn't have a HUD.
 *
 * @param {string} location     Name of the location.
 * @param {Array}  cheesesToUse Array of cheese types to use.
 */
const makeCheeseSelector = async (location, cheesesToUse) => {
  // let hud = document.querySelector('.mousehuntHud-tabs');
  const hud = document.querySelector('#hudLocationContent');
  if (! hud) {
    return;
  }

  if (hud.classList.contains('mh-ui-cheese-selector')) {
    return;
  }

  hud.classList.add('mh-ui-cheese-selector', `mh-ui-cheese-selector-${location}`);

  const existingCheeseSelector = hud.querySelector('.mh-ui-cheese-selector-wrapper');
  if (existingCheeseSelector) {
    existingCheeseSelector.remove();
  }

  const wrapper = document.createElement('div');
  wrapper.classList.add('townOfGnawniaHUD', 'allBountiesComplete', 'mh-ui-cheese-selector-wrapper');

  const cheesesContainer = document.createElement('div');
  cheesesContainer.classList.add('townOfGnawniaHUD-baitContainer');

  const cheeses = await getUserItems(cheesesToUse);

  cheeses.forEach((cheese) => {
    const cheeseContainer = document.createElement('div');
    cheeseContainer.classList.add('townOfGnawniaHUD-bait', `mh-ui-cheese-selector-${cheese.type}`);

    const cheeseImage = document.createElement('div');
    cheeseImage.classList.add('townOfGnawniaHUD-bait-image');
    const thumbnail = cheese.thumbnail_transparent || cheese.thumbnail;
    cheeseImage.style.backgroundImage = `url(${thumbnail})`;

    const cheeseName = document.createElement('div');
    cheeseName.classList.add('townOfGnawniaHUD-bait-name', 'quantity');
    cheeseName.innerText = cheese.name.replace(' Cheese', '');

    const cheeseQuantity = document.createElement('div');
    cheeseQuantity.classList.add('townOfGnawniaHUD-bait-quantity', 'quantity');
    cheeseQuantity.innerText = cheese.quantity;

    const tooltipArrow = document.createElement('div');
    tooltipArrow.classList.add('mousehuntTooltip-arrow');

    cheeseContainer.appendChild(cheeseImage);
    cheeseContainer.appendChild(cheeseName);
    cheeseContainer.appendChild(cheeseQuantity);

    cheeseContainer.setAttribute('data-item-type', cheese.type);
    cheeseContainer.setAttribute('data-item-classification', 'bait');
    cheeseContainer.addEventListener('click', (e) => {
      e.preventDefault();
      hg.utils.TrapControl.toggleItem(e.target);
    });

    cheesesContainer.appendChild(cheeseContainer);
  });

  wrapper.appendChild(cheesesContainer);
  hud.appendChild(wrapper);
};

const main = async () => {
  const defaultCheeses = [
    'cheddar_cheese',
    'brie_cheese',
    'gouda_cheese',
    'super_brie_cheese',
  ];

  const locationCheeses = {
    // Gnawnia
    meadow: [],
    // Valour
    kings_arms: [
      'gilded_cheese',
    ],
    tournament_hall: [
      'runny_cheese',
    ],
    kings_gauntlet: [
      'super_brie_cheese',
      'gauntlet_cheese_2',
      'gauntlet_cheese_3',
      'gauntlet_cheese_4',
      'gauntlet_cheese_5',
      'gauntlet_cheese_6',
      'gauntlet_cheese_7',
      'gauntlet_cheese_8',
    ],
    // Whisker Woods
    calm_clearing: [
      'cherry_cheese',
    ],
    great_gnarled_tree: [
      'gnarled_cheese',
    ],
    lagoon: [
      'gnarled_cheese',
      'wicked_gnarly_cheese',
    ],
    // Burroughs
    bazaar: [
      'gilded_cheese',
    ],
    town_of_digby: [
      'limelight_cheese',
    ],
    // Furoma
    training_grounds: [],
    dojo: [
      'maki_cheese',
    ],
    meditation_room: [
      'combat_cheese',
      'glutter_cheese',
      'susheese_cheese',
    ],
    pinnacle_chamber: [
      'maki_cheese',
      'onyx_gorgonzola_cheese'
    ],
    // Bristle Woods
    catacombs: [
      'ancient_cheese',
      'undead_emmental_cheese',
      'string_undead_emmental_cheese',
      'radioactive_blue_cheese',
      'super_radioactive_blue_cheese',
      'magical_radioactive_blue_cheese',
      'moon_cheese',
      'crescent_cheese',
    ],
    forbidden_grove: [
      'ancient_cheese',
      'radioactive_blue_cheese',
      'magical_radioactive_blue_cheese',
      'moon_cheese',
      'crescent_cheese',
    ],
    // TODO: Acolyte Realm
    // Tribal Isles
    cape_clawed: [
      'shell_cheese',
      'gumbo_cheese',
      'crunchy_cheese',
    ],
    elub_shore: [
      'shell_cheese',
    ],
    nerg_plains: [
      'gumbo_cheese',
    ],
    derr_dunes: [
      'crunchy_cheese',
    ],
    jungle_of_dread: [
      'vanilla_stilton_cheese',
      'vengeful_vanilla_stilton_cheese',
      'spicy_havarti_cheese',
      'pungent_havarti_cheese',
      'creamy_havarti_cheese',
      'magical_havarti_cheese',
      'crunchy_havarti_cheese',
      'sweet_havarti_cheese',
    ],
    dracano: [
      'inferno_havarti_cheese',
    ],
    balacks_cove: [
      'vanilla_stilton_cheese',
      'vengeful_vanilla_stilton_cheese',
    ],
    // Rodentia
    ss_huntington_ii: [
      'galleon_gouda_cheese',
    ],
    slushy_shoreline: [
      'toxic_super_brie_cheese',
    ],
  };

  const location = getCurrentLocation();
  if (! locationCheeses[location]) {
    return;
  }

  // Append cheeses to make the array 4 items long.
  const cheesesToUse = locationCheeses[location];
  while (cheesesToUse.length < 4) {
    // add it in reverse so we don't mess up the order.
    cheesesToUse.unshift(defaultCheeses.pop());
  }

  await makeCheeseSelector(location, cheesesToUse);
};

export default main;
