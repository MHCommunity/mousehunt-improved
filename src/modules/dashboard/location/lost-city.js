export default (quests) => {
  if (! quests.QuestLostCity) {
    return '';
  }

  if (! quests.QuestLostCity?.minigame?.is_cursed) {
    return 'Not cursed';
  }

  const curses = quests.QuestLostCity?.minigame?.curses;
  const cursesText = curses.map((curse) => curse.name).join(', ').replace(/,([^,]*)$/, '$1');

  return `Cursed with ${cursesText}`;
};

const lostCity = {
  type: 'lost_city',
  is_normal: true,
  loot_drops: {
    dewthief_petal_crafting_item: {
      active: false,
      type: 'dewthief_petal_crafting_item',
      name: 'Dewthief Petal',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/d5047edfbde1a609528cdef5096c5e96.gif?cv=2',
      quantity: 585
    },
    dreamfluff_herbs_crafting_item: {
      active: true,
      type: 'dreamfluff_herbs_crafting_item',
      name: 'Dreamfluff Herbs',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/9c7dc802589329532603f2247a710e59.gif?cv=2',
      quantity: 345
    },
    duskshade_petal_crafting_item: {
      active: false,
      type: 'duskshade_petal_crafting_item',
      name: 'Duskshade Petal',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/5873b1eeef94bdb5ac2a204cc52b0726.gif?cv=2',
      quantity: 346
    },
    graveblossom_petal_crafting_item: {
      active: false,
      type: 'graveblossom_petal_crafting_item',
      name: 'Graveblossom Petal',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/186ecf8960bdd05a88cbc2d042377453.gif?cv=2',
      quantity: 531
    },
    plumepearl_herbs_crafting_item: {
      active: false,
      type: 'plumepearl_herbs_crafting_item',
      name: 'Plumepearl Herbs',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/7b53e4c852ec4ef3a76ece38ea2ff381.gif?cv=2',
      quantity: 341
    },
    lunaria_petal_crafting_item: {
      active: false,
      type: 'lunaria_petal_crafting_item',
      name: 'Lunaria Petal',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/db0ff065b2cd8752ada3d532b243ca5a.gif?cv=2',
      quantity: 17
    }
  },
  recipes_known: 20,
  recipes_total: 20,
  essences: [
    {
      name: 'Aleth Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/e8fd189884e5d517deca23e5f183b1cf.gif?cv=2',
      quantity: 2,
      type: 'essence_a_crafting_item'
    },
    {
      name: 'Ber Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/de22f6f71864f5c0ec367c011e09acd9.gif?cv=2',
      quantity: 89,
      type: 'essence_b_crafting_item'
    },
    {
      name: 'Cynd Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/949047e60efc1a6929de3c4b1b25c9ac.gif?cv=2',
      quantity: 11,
      type: 'essence_c_crafting_item'
    },
    {
      name: 'Dol Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/98f36a0017b846d51d33618685906743.gif?cv=2',
      quantity: 2,
      type: 'essence_d_crafting_item'
    },
    {
      name: 'Est Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/1be2e3ec51d13779c133545470a2bd42.gif?cv=2',
      quantity: 13,
      type: 'essence_e_crafting_item'
    },
    {
      name: 'Fel Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/7174d3c904067a9ae8a5944ed0470224.gif?cv=2',
      quantity: 14,
      type: 'essence_f_crafting_item'
    },
    {
      name: 'Gur Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/a200e64b998fe4255529a2f3a76a57df.gif?cv=2',
      quantity: 19,
      type: 'essence_g_crafting_item'
    },
    {
      name: 'Hix Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/9bd87c451740f1f3fc7f2f132fcc8d23.gif?cv=2',
      quantity: 0,
      type: 'essence_h_crafting_item'
    },
    {
      name: 'Icuri Essence',
      thumb: 'https://www.mousehuntgame.com/images/items/crafting_items/thumbnails/9093c480c099d45901d869ded0541d17.gif?cv=2',
      quantity: 1,
      type: 'essence_i_crafting_item'
    }
  ],
  valid_bait: true,
  minigame: {
    type: 'curse',
    is_cursed: true,
    curses: [
      {
        name: 'Lost Curse',
        type: 'lost',
        charm: {
          name: 'Searcher Charm',
          thumb: 'https://www.mousehuntgame.com/images/items/trinkets/de885be4dc35fe2509ea8a9cd5f0a22a.gif?cv=2',
          quantity: 33,
          equipped: false
        },
        active: true
      }
    ]
  }
};

// console.log('lostCity', lostCity); // eslint-disable-line no-console
