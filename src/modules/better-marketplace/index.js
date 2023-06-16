import { addUIStyles } from '../utils';
import styles from './styles.css';

const optsToRemove = [
  // Events Stuff
  3306, // Bonefort Cheese
  2733, // Glazed Pecan Pecorino Cheese
  3188, // Speedy Coggy Colby
  397, // Candy Corn Cheese
  398, // Ghoulgonzola Cheese
  2526, // Let It Snow Charm
  2780, // Factory Repair Charm
  1590, // Winter Builder Charm
  1591, // Winter Hoarder Charm
  1592, // Winter Miser Charm
  3373, // 100 Pack of Lunar Lantern Candles
  3374, // 100 Pack of Red Lunar Lantern Candles
  3375, // 10 Pack of Lunar Lantern Candles
  3376, // 10 Pack of Red Lunar Lantern Candles
  3377, // 30 Pack of Lunar Lantern Candles
  3378, // 30 Pack of Red Lunar Lantern Candles
  3209, // Eggscellent Gift Basket
  3210, // Eggstravagant Supply Kit
  2793, // Eggsweeper Starter Pack
  3132, // Glazed Gift Basket
  3133, // Glazed Snow Golem Supply Box
  3134, // Glazed Snow Golem Supply Kit
  3508, // Winter Taiga Gift Basket
  3509, // Winter Taiga Large Supply Kit
  3510, // Winter Taiga Small Supply Kit
  3337, // Jingling Glazed Gift Basket
  3338, // Jingling Glazed Supply Box
  3339, // Jingling Glazed Supply Kit
  1564, // Spooky Shuffle Pack
  1608, // Throwable Snowball Booster Pack
  3482, // Alchemist's Supply Box
  3483, // Apothecary's Supply Kit
  3284, // Brewmaster's Supply Kit
  3283, // Brewer's Apprentice Kit

  // Baskets and kits
  687, // 2011 Pumpkin Treat Basket
  956, // 2012 Pumpkin Treat Basket
  1213, // 2013 Pumpkin Treat Basket
  1556, // 2014 Pumpkin Treat Basket
  1931, // 2015 Pumpkin Treat Basket
  2191, // 2016 Pumpkin Treat Basket
  807, // Party Giftbox
  809, // Party-in-a-Box
  1104, // Birthday Party Pack
  1105, // Super MechaParty Box
  1299, // 2014 Party Pack
  1926, // 2015 Halloween Skin Pack
  1628, // 2015 Party Pack
  2190, // 2016 Halloween Skin Pack
  2005, // 2016 Party Pack
  2447, // 2017 Halloween Skin Pack
  2254, // 2017 Party Pack
  2534, // 2018 Party Pack
  2760, // 2019 Birthday Gift Basket
  2761, // 2019 Birthday Supply Kit
  1847, // Adventure Gift Basket
  1459, // Airship Supply Kit
  1393, // Forgotten Art of Dance Skin Pack
  1986, // Asiago Gift Basket
  904, // Athlete's Kit
  2192, // Battery Gift Basket
  1655, // Be Mine Big Box
  3158, // Be Mine Bouquet
  1927, // Spooky Shuffle Bonanza Box
  1432, // Bonus Egg Hunting Kit
  1257, // Bucket of Snowball Bocconcini
  1171, // Claw Shot Chest
  432, // Cornucopia Gift Basket
  1083, // Cozy Cruise Gift Basket
  1084, // Cruise Commander Crate
  1678, // Cupcake Combo Kit
  1396, // Cupcake Party Tower
  1397, // Cupcake Party Tray
  1460, // Dirigible Kit
  788, // Dragon Festival Celebration Kit
  832, // Spring Gift Basket 2012
  852, // Marshmallow Gift Basket
  833, // Egg Hunting Kit
  1146, // Spring Gift Basket
  2594, // Egg Hunter Supply Kit
  1698, // Eggstra Charge Charm Kit
  2679, // Ethereal Treasure Hunting Kit
  2033, // Extra Sweet Gift Basket
  2034, // Extra Sweet Combo Kit
  2540, // Extreme Regal Supply Kit
  1258, // Festive Bundle
  723, // Feta Gift Basket
  2230, // Festive Skin Pack 2016
  2489, // Festive Skin Pack 2017
  1593, // Festive Skin Pack #2
  1260, // Festive Skin Pack #1
  765, // Festive Tournament Supply Kit
  2195, // Flashlight Treasure Kit
  1261, // Fort Builder's Lunchbox
  1262, // Fort Builder's Construction Kit
  2274, // Lovely Valentine Bouquet
  3285, // Gloomy Gift Basket
  2178, // Competitor's Kit
  2179, // Games Gift Basket
  2535, // Golem Builder Party Pack
  1848, // Grand Adventure Kit
  2707, // Great Winter Hunt 2018 Gift Basket
  2708, // Great Winter Hunt 2018 Large Supply Kit
  2709, // Winter Hunt Supply Kit
  2710, // Great Winter Hunt Treasure Hunting Kit
  2231, // Great Winter Hunt Gift Basket
  2232, // Great Winter Hunt Supply Kit
  1559, // Halloween Charm Bag
  401, // Halloween Basket
  689, // Jumbo Halloween Goodie Bag
  1560, // Halloween Pillowcase
  1214, // Haunted Treasure Hunting Kit
  1215, // Ultimate Spooky Supply Bundle
  499, // Heart of the Rabbit Gift Basket
  1352, // Horse Festival Celebration Kit
  2451, // Ghastly Gift Basket
  2452, // Spooky Supply Kit
  1594, // Ice Fortress Hobbyist Case
  1595, // Ice Fortress Craftsman Crate
  1601, // Ice Fortress Pro Pack
  1596, // Ice Fortress Starter Kit
  3484, // Insidious Gift Basket
  2233, // Large Great Winter Hunt Supply Kit
  3392, // Large Speedy Repair Supply Kit
  2681, // Spooky Supply Ghostship
  2941, // XL Winter Supply Kit
  634, // Library Supply Kit
  2025, // Labyrinth Puzzle Box Recovery Kit
  1691, // Lucky Clover Kit
  619, // Lucky Hunting Kit
  2052, // Lucky Rainbow Kit
  1353, // Lunar Athletic Pack
  1526, // MEGA Tournament Supply Kit
  624, // Mega Tribal Kit
  504, // Birthday Gift Basket
  2011, // Monkey Festival Jumbo Kit
  1060, // New Year's Party Ball
  1743, // Nightshade Farming Kit
  2074, // Oil Showers Kit
  2075, // Poison Flowers Kit
  387, // 2010 Pumpkin Treat Basket
  1248, // Regal Gift Basket
  3248, // Rift Dirigible Kit
  2122, // Ronza's Diving Supply Ship
  3415, // Ronza's Floating Islands Supply Ship
  3249, // 2021 Ronza's Floating Islands Supply Ship
  2641, // Ronza's Fort Rox Supply Ship
  2123, // Ronza's Fungal Supply Ship
  2124, // Ronza's Gauntlet Supply Ship
  2125, // Ronza's Labyrinth Supply Ship
  2126, // Ronza's Living Garden Supply Ship
  2642, // Ronza's Moussu Picchu Supply Ship
  2643, // Ronza's Queso Canyon Supply Ship
  2385, // 2017 Ronza's Rift Supply Ship
  3018, // Ronza's Rift Supply Ship
  2127, // 2016 Ronza's Rift Supply Ship
  2128, // Ronza's Tribal Supply Ship
  2185, // Royal Week 5 Challenge Supply Kit
  2186, // Royal Week 1 Challenge Supply Kit
  2187, // Royal Week 4 Challenge Supply Kit
  2188, // Royal Week 2 Challenge Supply Kit
  2189, // Royal Week 3 Challenge Supply Kit
  1661, // Sheep Festival Jumbo Kit
  2494, // Snow Golem Gift Basket
  2495, // Snow Golem Supply Box
  2496, // Stuffed Snow Golem Stocking
  2497, // Snow Golem Treasure Hunting Kit
  3179, // Speedy Repair Gift Basket
  3180, // Speedy Repair Supply Kit
  2202, // Spooky Shuffle Ticket Box
  1565, // Spooky Skin Pack #2
  1221, // Spooky Skin Pack
  705, // 2011 Spooky Supply Kit
  588, // Spring Gift Basket 2011
  2804, // Spring Hunt Gift Basket
  2805, // Eggfinder Supply Kit
  2280, // Sprinkly Sprinkling Kit
  2281, // Sprinkly Sweet Gift Basket
  2282, // Sprinkly Sweet Combo Kit
  2035, // Sprinkling Kit
  1400, // Sugar Rush in a Box
  2985, // SUPER|brie+ Factory Gift Basket
  2986, // SUPER|brie+ Factory Supply Kit
  1271, // Super Festive Bundle
  1952, // Super Sudsy Cleanup Kit
  1632, // Tactical Zombie Gear
  2565, // 10th Birthday Gift Basket
  2566, // 10th Birthday Duffle Bag
  2567, // Gilded Time Traveler's Scroll Case
  1993, // Tobogganer's Big Box
  905, // Training Gift Basket
  1843, // Trawler Gift Basket
  3123, // Treasure Hunting Gift Set
  1272, // Ultimate Festive Bundle
  1994, // Ultimate Festive Kit
  805, // &lt3 Gift Basket
  1609, // Winter Builder Charm Kit
  1610, // Winter Hoarder Charm Kit
  1611, // Winter Miser Charm Kit
  731, // Winter Survival Kit
  430, // Wishing Well Basket
  2544, // Year of the Dog Gift Basket
  2545, // Year of the Dog Large Supply Kit
  2546, // Year of the Dog Supply Kit
  789, // Dragon Festival Gift Basket
  1358, // Year of the Horse Gift Basket
  2012, // Year of the Monkey Gift Basket
  3161, // Year of the Ox Gift Basket
  3162, // Year of the Ox Large Supply Kit
  3163, // Year of the Ox Supply Kit
  2749, // Year of the Pig Gift Basket
  2750, // Year of the Pig Large Supply Kit
  2751, // Year of the Pig Supply Kit
  3536, // Year of the Rabbit Gift Basket
  3537, // Year of the Rabbit Large Supply Kit
  3538, // Year of the Rabbit Supply Kit
  2967, // Year of the Rat Gift Basket
  2968, // Year of the Rat Large Supply Kit
  2969, // Year of the Rat Supply Kit
  2264, // Year of the Rooster Gift Basket
  2265, // Year of the Rooster Supply Kit
  1662, // Year of the Sheep Gift Basket
  3379, // Year of the Tiger Gift Basket
  3380, // Year of the Tiger Large Supply Kit
  3381, // Year of the Tiger Supply Kit
  592, // Zombie Invasion Survival Kit

  // Stupid gift baskets, but are currently available
  1170, // Bounty Trail Kit
  2325, // Bristle Woods Rift Gift Basket
  2326, // Bristle Woods Rift Supply Kit
  2354, // Bristle Woods Rift Treasure Hunting Kit
  1532, // Burroughs Blackhole Box
  1533, // Burroughs Rift Crate
  546, // Catacombs Survival Kit
  958, // Cursed City Charm Pack
  880, // Drilling Gift Set
  622, // Derr Tribal Kit
  1496, // Diving Kit
  1188, // Daredevil Canyon Train Pack
  623, // Elub Tribal Kit
  1189, // Entire Train Car
  961, // Essence Collector Kit
  434, // Festive Gift Basket
  2212, // Fort Rox Gift Basket
  2213, // Fort Rox Supply Kit
  2293, // Fort Rox Treasure Hunting Kit
  2076, // Furoma Rift Crafting Kit
  2077, // Furoma Rift Enerchi Pack
  2078, // Furoma Rift Gift Bento Box
  1883, // Glowing Gruyere Gift Basket
  1717, // Glowing Gruyere Kit
  1415, // Gnawnia Rift Gift Basket
  1416, // Gnawnia Rift Survival Kit
  1317, // Hazmat Cleanup Kit
  1193, // Heavy Train Trunk
  881, // Iceberg Invasion Kit
  436, // Jumbo Festive Gift Basket
  2079, // Jumbo Furoma Rift Crafting Kit
  1884, // Labyrinth Exploration Kit
  1924, // Labyrinth Treasure Hunting Kit
  631, // Library Gift Basket
  964, // Living Garden Charm Pack
  965, // Lost City Charm Pack
  2365, // Magical Cleanup Kit
  1534, // Magical Mist Basket
  468, // Massive Festive Gift Basket
  2430, // Moussu Picchu Gift Basket
  2431, // Moussu Picchu Supply Kit
  2478, // Moussu Picchu Treasure Hunting Kit
  593, // Muridae Gift Basket
  594, // Muridae Mega Kit
  595, // Muridae Supply Kit
  625, // Nerg Tribal Kit
  1718, // Nightshade Basket
  1719, // Nightshade Kit
  1499, // Ocean Crafting Kit
  2847, // Queso Canyon Grand Tour Treasure Hunting Kit
  2824, // Queso Geyser Gift Basket
  2825, // Queso Geyser Starter Pack
  2826, // Queso Geyser Supply Kit
  1191, // Raider River Train Pack
  2115, // Rift Treasure Hunting Basket
  967, // Sand Crypts Charm Pack
  968, // Sand Dunes Charm Pack
  1173, // Sheriff's Satchel
  857, // Shoreline Supplies
  1500, // Submersible Supplies
  2366, // Sudsy Gift Basket
  1501, // Sunken Gift Basket
  1192, // Supply Depot Train Pack
  775, // Tournament Supply Kit
  920, // Treasure Hunting Kit
  969, // Twisted Essence Collector Kit
  970, // Twisted Garden Charm Pack
  1720, // Underground Exploration Kit
  2687, // Vampire Hunting Kit
  516, // Warpath Survival Kit
  2420, // Warpath Treasure Hunting Kit
  1633, // Whisker Rift Domination Box
  1634, // Whisker Rift Hunting Kit
  1635, // Whisker Wicker Gift Basket
  2610, // Wild Gift Basket
  2611, // Wild Supply Kit
  1636, // Woodsy Charm Bag

  // things with no activity
  2558, // 2018 Gilded Birthday Scroll Case
  3037, // Floating Supply Kit
  3036, // Floating Large Supply Kit
  1971, // Jumbo Regal Gift Basket
  1761, // Jumbo Treasure Hunting Kit
  1474, // Airship Charm

  // Things you probably don't
  440, // Clockapult of Winter Past Blueprint
  417, // Grungy DeathBot Blueprint
  416, // Fluffy DeathBot Blueprint
  418, // Ninja Ambush Blueprint
  474, // Tiki Base Blueprints
];

const modifySearch = (opts) => {
  let searchInputDOM = $('.marketplaceView-header-search');
  searchInputDOM.select2('destroy');

  for (const opt of opts) {
    if (! opt.value || opt.value === '' || optsToRemove.includes(parseInt(opt.value))) {
      opt.remove();
    }
  }

  // add one blank one to the start
  const blankOpt = document.createElement('option');
  blankOpt.value = '';
  blankOpt.text = '';
  blankOpt.disabled = true;
  blankOpt.selected = true;
  blankOpt.hidden = true;
  searchInputDOM.prepend(blankOpt);

  searchInputDOM = $('.marketplaceView-header-search');
  searchInputDOM.select2({
    formatResult: hg.views.MarketplaceView.formatSelect2Result,
    formatSelection: hg.views.MarketplaceView.formatSelect2Result,
    dropdownAutoWidth: false,
    placeholder: 'Search for items...',
    minimumInputLength: 0,
    dropdownCssClass: 'marketplaceView-header-search-dropdown',
    width: 'resolve',
  }).on('change', function () {
    if (! searchInputDOM.prop('disabled') && searchInputDOM.val()) {
      hg.views.MarketplaceView.showItem(searchInputDOM.val(), 'view', false, false, true);
    }
  });
};

const waitForSearchReady = (attempts = 0) => {
  const opts = document.querySelectorAll('.marketplaceView-header-search option');
  let timeoutPending = false;

  // if there are no options, try again
  if (opts.length === 0) {
    if (attempts < 10) {
      timeoutPending = setTimeout(() => waitForSearchReady(attempts + 1), 300);
    }
    return;
  }

  // if we have a timeout pending, clear it
  if (timeoutPending) {
    clearTimeout(timeoutPending);
  }

  // wait another 300ms to make sure it's ready
  setTimeout(() => modifySearch(opts), 300);
};

const autocloseClaim = (resp) => {
  if (! (resp && resp.success)) {
    return;
  }

  const journalEntry = resp?.journal_markup[0]?.render_data?.css_class;
  if (! journalEntry || journalEntry === '') {
    return;
  }

  if (journalEntry.includes('marketplace_claim_listing') || journalEntry.includes('marketplace_complete_listing')) {
    setTimeout(() => hg.views.MarketplaceView.hideDialog(), 250);
  }
};

export default function marketplace() {
  addUIStyles(styles);
  onOverlayChange({ marketplace: { show: waitForSearchReady } });
  onAjaxRequest(autocloseClaim, 'managers/ajax/users/marketplace.php');
}
