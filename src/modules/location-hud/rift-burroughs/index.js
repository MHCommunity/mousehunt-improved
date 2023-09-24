import { addHudStyles } from '../../utils';
import styles from './styles.css';

const makeMiceList = (type, title, mice, currentType, appendTo) => {
  const wrapper = makeElement('div', ['mouse-type', type]);
  if (currentType === type) {
    wrapper.classList.add('active');
  }

  const mtitle = makeElement('a', 'mouse-type-title', title);
  mtitle.addEventListener('click', () => {
    let id = 1426; // magical string.
    if ('terra' === type) {
      id = 1551;
    } else if ('polluted' === type) {
      id = 1550;
    }

    hg.utils.TrapControl.setBait(id);
    hg.utils.TrapControl.go();
  });

  wrapper.appendChild(mtitle);

  const miceWrapper = makeElement('div', 'mouse-type-mice');

  mice.forEach((mouse) => {
    const mouseWrapper = makeElement('div', 'mouse-type-mouse');
    const mouseLink = makeElement('a', 'mouse-type-mouse-link');
    mouseLink.addEventListener('click', (e) => {
      hg.views.MouseView.show(mouse);
      e.preventDefault();
    });

    const mouseImage = makeElement('img', 'mouse-type-mouse-image');
    mouseImage.src = miceData[mouse].image;
    mouseLink.appendChild(mouseImage);

    makeElement('div', 'mouse-type-mouse-name', miceData[mouse].name, mouseLink);

    mouseWrapper.appendChild(mouseLink);
    miceWrapper.appendChild(mouseWrapper);
  });

  wrapper.appendChild(miceWrapper);
  appendTo.appendChild(wrapper);

  return wrapper;
};

const miceData = {
  rift_amplified_brown: {
    name: 'Amplified Brown Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/9547c50891ce66c00188a0ce278cd9e0.gif?cv=2'
  },
  rift_amplified_grey: {
    name: 'Amplified Grey Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/b6a9a248439e08367139cba601583781.gif?cv=2'
  },
  rift_amplified_white: {
    name: 'Amplified White Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/877fd4f1831f1ffd76e6ab9334e96efc.gif?cv=2'
  },
  rift_automated_sentry: {
    name: 'Automated Sentry Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/d57b33cdbb0d14bb138fe91c166325fa.gif?cv=2'
  },
  rift_cybernetic_specialist: {
    name: 'Cybernetic Specialist Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/5a0d95f2211444717f29f74959b89366.gif?cv=2'
  },
  rift_doktor: {
    name: 'Doktor Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/a44277c1d72f76fb507df2a7a4938542.gif?cv=2'
  },
  rift_evil_scientist: {
    name: 'Evil Scientist Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/fc4030fcea4bb7e0118aa4d46705f37e.gif?cv=2'
  },
  rift_portable_generator: {
    name: 'Portable Generator Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/f0437620c8c86379e6f8fefb9e82d2c3.gif?cv=2'
  },
  rift_bio_engineer: {
    name: 'Rift Bio Engineer',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/1d91dc3220b096af75ca0423a77ccc83.gif?cv=2'
  },
  rift_surgeon_bot: {
    name: 'Surgeon Bot Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/6678f8a7003093b081c941a3d571abb8.gif?cv=2'
  },
  rift_count_vampire: {
    name: 'Count Vampire Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/851f1d4c760d0f263a38d0fa28bbf2fa.gif?cv=2'
  },
  rift_phase_zombie: {
    name: 'Phase Zombie',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/c9675fb32b01e91d43f5ebbbf3bf8f02.gif?cv=2'
  },
  rift_prototype: {
    name: 'Prototype Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/8be0e48b2fa241e65312726433612871.gif?cv=2'
  },
  rift_robat: {
    name: 'Robat Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/fa345c83ff784adfbe79230f279be2c6.gif?cv=2'
  },
  rift_tech_ravenous_zombie: {
    name: 'Tech Ravenous Zombie',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/6249796e35d572687db2aa4a4e391335.gif?cv=2'
  },
  rift_clump: {
    name: 'Clump Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/a901fe9feea2e04ca1da1a3769dd7f77.gif?cv=2'
  },
  rift_cyber_miner: {
    name: 'Cyber Miner Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/b3768e070c9b40fdfbfef4f39025acc3.gif?cv=2'
  },
  rift_itty_bitty_burroughs: {
    name: 'Itty Bitty Rifty Burroughs Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/723735735fcbc38d75c5d980b454dc4e.gif?cv=2'
  },
  rift_pneumatic_dirt_displacement: {
    name: 'Pneumatic Dirt Displacement Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/70bc4cb7409df8be9e1942e27b75c05f.gif?cv=2'
  },
  rift_rifterranian: {
    name: 'Rifterranian Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/7abd07fac15972db28231f80fd03c075.gif?cv=2'
  },
  rift_mecha_tail: {
    name: 'Mecha Tail Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/e329e623c6ff501d03c7077b8ecfabf9.gif?cv=2'
  },
  rift_spore: {
    name: 'Radioactive Ooze Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/f037c2df0d654caaadfe4c8a58a13431.gif?cv=2'
  },
  rift_toxikinetic: {
    name: 'Toxikinetic Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/bae7062027162025735a5ccbcaf58e5f.gif?cv=2'
  },
  rift_lycan: {
    name: 'Lycanoid',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/18c987fe4ec5ee678114cb748dedfb6d.gif?cv=2'
  },
  rift_revenant: {
    name: 'Revenant Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/a0060e929e11030025f6609a5cb81c51.gif?cv=2'
  },
  rift_zombot_unipire: {
    name: 'Zombot Unipire the Third',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/95be1a40ec7cf3868fb9041bf43658a8.gif?cv=2'
  },
  rift_boulder_biter: {
    name: 'Boulder Biter Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/7da77ad10f719afce4f17453cb964f40.gif?cv=2'
  },
  rift_lambent: {
    name: 'Lambent Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/b301f96263690c2a3dc02a4625aa1c9b.gif?cv=2'
  },
  rift_master_exploder: {
    name: 'Master Exploder Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/6d04a2ec4e21296272e080df7033a29a.gif?cv=2'
  },
  rift_rancid_bog_beast: {
    name: 'Rancid Bog Beast Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/5a7f8551ed42a6344e7948b18687e97d.gif?cv=2'
  },
  rift_radioactive_gold: {
    name: 'Super Mega Mecha Ultra RoboGold Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/022763eaba9d7f6fdbd5cddb3813d6b8.gif?cv=2'
  },
  rift_toxic_avenger: {
    name: 'Toxic Avenger Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/74891cb924851366d67a3632ed56fa6b.gif?cv=2'
  },
  rift_monstrous_abomination: {
    name: 'Monstrous Abomination Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/12dc2f226fd5e26144deb154d293e6db.gif?cv=2'
  },
  rift_big_bad_burroughs: {
    name: 'Big Bad Behemoth Burroughs Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/dfb15f35c1fe4bb07e2b276071a7c439.gif?cv=2'
  },
  rift_assassin_beast: {
    name: 'Assassin Beast Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/ddb77d3c8cad610f4270f6d1b401602c.gif?cv=2'
  },
  rift_menace: {
    name: 'Menace of the Rift Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/a286833ada1c4718096e30db734514a2.gif?cv=2'
  },
  rift_plutonium_tentacle: {
    name: 'Plutonium Tentacle Mouse',
    image: 'https://www.mousehuntgame.com/images/mice/thumb/97c996e63dab24de6ed6a089f318012e.gif?cv=2'
  }
};

const mouseList = {
  tier_0: {
    string: [
      'rift_amplified_brown',
      'rift_amplified_grey',
      'rift_amplified_white',
      'rift_automated_sentry',
      'rift_cybernetic_specialist',
      'rift_doktor',
      'rift_evil_scientist',
      'rift_portable_generator',
      'rift_bio_engineer',
      'rift_surgeon_bot',
    ],
    terra: [],
    polluted: [],
  },
  tier_1: {
    string: [
      'rift_count_vampire',
      'rift_phase_zombie',
      'rift_prototype',
      'rift_robat',
      'rift_tech_ravenous_zombie',
    ],
    terra: [
      'rift_clump',
      'rift_cyber_miner',
      'rift_itty_bitty_burroughs',
      'rift_pneumatic_dirt_displacement',
      'rift_rifterranian',
    ],
    polluted: [
      'rift_mecha_tail',
      'rift_spore',
      'rift_toxikinetic',
    ],
  },
  tier_2: {
    string: [
      'rift_count_vampire',
      'rift_lycan',
      'rift_phase_zombie',
      'rift_prototype',
      'rift_revenant',
      'rift_robat',
      'rift_tech_ravenous_zombie',
      'rift_zombot_unipire',
    ],
    terra: [
      'rift_boulder_biter',
      'rift_clump',
      'rift_cyber_miner',
      'rift_itty_bitty_burroughs',
      'rift_lambent',
      'rift_master_exploder',
      'rift_pneumatic_dirt_displacement',
      'rift_rifterranian',
    ],
    polluted: [
      'rift_mecha_tail',
      'rift_spore',
      'rift_rancid_bog_beast',
      'rift_radioactive_gold',
      'rift_toxic_avenger',
      'rift_toxikinetic',
    ],
  },
  tier_3: {
    string: [
      'rift_monstrous_abomination',
    ],
    terra: [
      'rift_big_bad_burroughs',
    ],
    polluted: [
      'rift_assassin_beast',
      'rift_menace',
      'rift_plutonium_tentacle',
      'rift_rancid_bog_beast',
      'rift_radioactive_gold',
      'rift_toxic_avenger',
    ],
  }
};

const hud = () => {
  if (! user?.quests?.QuestRiftBurroughs) {
    return;
  }

  const quest = user.quests.QuestRiftBurroughs;

  const armedBait = quest?.armed_bait || 'disarmed';
  const mistLevel = quest?.mist_released || 0;
  const mistTier = quest?.mist_tier || 'tier_0';

  const hudEl = document.querySelector('#hudLocationContent .riftBurroughsHud');
  if (! hudEl) {
    return;
  }

  let color = 'yellow';
  if (mistLevel >= 7) {
    color = 'green';
  } if (mistLevel >= 19) {
    color = 'red';
  }

  const existing = document.querySelector('.brift-ui');
  if (existing) {
    existing.remove();
  }

  const wrapper = makeElement('div', ['brift-ui']);

  const mist = makeElement('div', ['mist-display', `state-${color}`], `${mistLevel} / 20 `);

  mist.addEventListener('click', (e) => {
    hg.views.HeadsUpDisplayRiftBurroughsView.toggleMist(e.target);
  });

  wrapper.appendChild(mist);

  const availableMice = mouseList[mistTier];

  const mouseWrapper = makeElement('div', 'mouse-list');

  let currentType = null;
  switch (armedBait) {
  case 'brie_string_cheese':
  case 'marble_string_cheese':
  case 'magical_string_cheese':
    currentType = 'string';
    break;
  case 'polluted_parmesan_cheese':
    currentType = 'polluted';
    break;
  case 'terre_ricotta_cheese':
    currentType = 'terra';
    break;
  }

  makeMiceList('string', 'Magical String', availableMice.string, currentType, mouseWrapper);
  makeMiceList('terra', 'Terra Ricotta', availableMice.terra, currentType, mouseWrapper);
  makeMiceList('polluted', 'Polluted Parm.', availableMice.polluted, currentType, mouseWrapper);

  wrapper.appendChild(mouseWrapper);

  hudEl.appendChild(wrapper);
};

const main = () => {
  addHudStyles('rift-burroughs', styles);
  hud();
};

export default main;
