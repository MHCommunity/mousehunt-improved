import { addBodyClass, addStyles, doEvent, getSetting, onEvent, onModuleToggle, removeBodyClass, saveSetting } from '@utils';

import schemes from './schemes';

import lightStyles from './light.css';

const settingKey = 'dark-mode-palette.palette';
const schemeSettingKey = 'dark-mode-palette.scheme';
const styleId = 'mh-improved-dark-mode-palette';
const lightMenuClass = 'mh-dark-light-menu';
const lightPaletteClass = 'mh-palette-light';

/**
 * Shared accents for the alternate palettes: aqua links and selection, and status colors tuned for darker surfaces.
 */
const accents = {
  '--d-link': '#69cee6',
  '--d-blue': '#00a5c3',
  '--d-blue-dark': '#005161',
  '--d-blue-darker': '#0b3943',
  '--d-green': '#64bd50',
  '--d-green-dark': '#204817',
  '--d-red': '#da534f',
  '--d-red-light': '#f29a92',
  '--d-red-darker': '#572124',
  '--d-yellow': '#f0de99',
  '--d-yellow-darker': '#463c20',
  '--d-orange': '#f3ad66',
  '--d-purple': '#8b4a9a',
  '--d-purple-dark': '#47264f',
  '--d-tan': '#c49a62',
  '--d-teal': '#3cbf98',
};

/**
 * Shared accents for the light palettes: deep, text-weight status colors and pale tints for their backgrounds.
 */
const lightAccents = {
  ...accents,
  '--d-green': '#28643a',
  '--d-green-dark': '#d5e8d4',
  '--d-red': '#a13042',
  '--d-red-light': '#923348',
  '--d-red-darker': '#f1d6db',
  '--d-yellow': '#f0de99',
  '--d-yellow-darker': '#eee0b5',
  '--d-orange': '#934800',
  '--d-purple': '#744091',
  '--d-purple-dark': '#e5d7ef',
  '--d-tan': '#7a5523',
  '--d-teal': '#1d6b55',
};

/**
 * Raw palette overrides. Only the raw colors change; the role tokens in _root.css follow them.
 * `page` is the page color as an RGB triple, used for the dark --d-transparent-* overlays.
 * `darkMenu: false` keeps the game's light top menu bar instead of the dark one.
 * `light: true` marks a light palette: it keeps the light menu and undoes Dark Mode's dark-only images (light.css).
 */
const palettes = {
  // The earlier Dark Mode tuning preserves its lavender links.
  original: {
    page: '38 43 51',
    colors: {
      '--d-alt': '#383e49',
      '--d-bg': '#434651',
      '--d-action': '#5e646f',
      '--d-text-muted': '#a7adb9',
      '--d-link': '#bf93ff',
    },
  },
  // Cool neutral greys use the shared aqua accents.
  neutral: {
    page: '31 34 36',
    colors: {
      '--d': '#1f2224',
      '--d-alt': '#2e3134',
      '--d-bg': '#3e4145',
      '--d-action': '#54585d',
      '--d-border': '#0c0d0f',
      '--d-text': '#d1d5d8',
      '--d-text-muted': '#b0b5b9',
      '--d-white': '#e9ebee',
      '--d-text-dark': '#2c2e31',
      ...accents,
    },
  },
  // A deeper neutral variant lowers the surface ladder.
  'neutral-dark': {
    page: '27 29 32',
    colors: {
      '--d': '#1b1d20',
      '--d-alt': '#292c2f',
      '--d-bg': '#393c40',
      '--d-action': '#4f5357',
      '--d-border': '#0a0b0d',
      '--d-text': '#d5d8db',
      '--d-text-muted': '#adb1b6',
      '--d-white': '#eceff1',
      '--d-text-dark': '#2c2e31',
      ...accents,
      '--d-red-light': '#ed8c84',
    },
  },
  // Warm neutral browns use the shared aqua accents.
  warm: {
    page: '32 28 24',
    colors: {
      '--d': '#201c18',
      '--d-alt': '#2f2b25',
      '--d-bg': '#403b34',
      '--d-action': '#58514a',
      '--d-border': '#0d0b08',
      '--d-text': '#dcd6cf',
      '--d-text-muted': '#b6b0a8',
      '--d-white': '#f2eee9',
      '--d-text-dark': '#312d28',
      ...accents,
      '--d-red-light': '#ed8c84',
    },
  },
  // Quiet naval blues with cool silver text and periwinkle links.
  'deep-navy': {
    page: '21 30 44',
    colors: {
      '--d': '#151e2c',
      '--d-alt': '#222f42',
      '--d-bg': '#304058',
      '--d-action': '#41546e',
      '--d-border': '#09111d',
      '--d-text': '#d9e3f0',
      '--d-text-muted': '#b9c9dd',
      '--d-white': '#f2f6ff',
      '--d-text-dark': '#202938',
      ...accents,
      '--d-link': '#b8caff',
      '--d-blue': '#789dff',
      '--d-blue-dark': '#263f70',
      '--d-blue-darker': '#1c2e50',
    },
  },
  // Green-grey slate echoes the teal frames of the game popups.
  'sea-slate': {
    page: '26 36 37',
    colors: {
      '--d': '#1a2425',
      '--d-alt': '#273537',
      '--d-bg': '#35464a',
      '--d-action': '#465b60',
      '--d-border': '#0b1415',
      '--d-text': '#d7e6e5',
      '--d-text-muted': '#c0d2d0',
      '--d-white': '#f0faf8',
      '--d-text-dark': '#233231',
      ...accents,
      '--d-link': '#9fddd0',
      '--d-blue': '#58bda8',
      '--d-blue-dark': '#24534c',
      '--d-blue-darker': '#193c37',
    },
  },
  // Neutral graphite keeps the surfaces free of a color cast.
  graphite: {
    page: '32 32 32',
    colors: {
      '--d': '#202020',
      '--d-alt': '#2d2d2d',
      '--d-bg': '#3b3b3b',
      '--d-action': '#4d4d4d',
      '--d-border': '#101010',
      '--d-text': '#dddddd',
      '--d-text-muted': '#bebebe',
      '--d-white': '#f4f4f4',
      '--d-text-dark': '#292929',
      ...accents,
      '--d-link': '#b9c8f0',
      '--d-blue': '#899ed6',
      '--d-blue-dark': '#38466b',
      '--d-blue-darker': '#29334d',
    },
  },
  // Velvety plum surfaces meet soft lilac links and berry selections.
  aubergine: {
    page: '37 27 41',
    colors: {
      '--d': '#251b29',
      '--d-alt': '#34283a',
      '--d-bg': '#45354c',
      '--d-action': '#584560',
      '--d-border': '#120d16',
      '--d-text': '#eaddea',
      '--d-text-muted': '#ceb9cf',
      '--d-white': '#fff2ff',
      '--d-text-dark': '#342337',
      ...accents,
      '--d-link': '#e5b9f3',
      '--d-blue': '#bd83d2',
      '--d-blue-dark': '#613267',
      '--d-blue-darker': '#432449',
      '--d-purple': '#bd83d2',
      '--d-purple-dark': '#47264f',
    },
  },
  // Shaded woodland greens pair with lichen-colored links.
  mosswood: {
    page: '27 36 27',
    colors: {
      '--d': '#1b241b',
      '--d-alt': '#293329',
      '--d-bg': '#384337',
      '--d-action': '#495645',
      '--d-border': '#0c130c',
      '--d-text': '#e0e7d6',
      '--d-text-muted': '#c4cfb5',
      '--d-white': '#f6fbea',
      '--d-text-dark': '#283126',
      ...accents,
      '--d-link': '#d0df9e',
      '--d-blue': '#a1bf66',
      '--d-blue-dark': '#40552a',
      '--d-blue-darker': '#2d3c20',
      '--d-green': '#a1bf66',
      '--d-green-dark': '#2c4725',
    },
  },
  // Deep ocean teal carries seafoam links and turquoise edges.
  'midnight-lagoon': {
    page: '16 38 41',
    colors: {
      '--d': '#102629',
      '--d-alt': '#1d363b',
      '--d-bg': '#2a484e',
      '--d-action': '#395c63',
      '--d-border': '#061719',
      '--d-text': '#d3eeee',
      '--d-text-muted': '#b5d5d6',
      '--d-white': '#efffff',
      '--d-text-dark': '#1c3437',
      ...accents,
      '--d-link': '#9ee6df',
      '--d-blue': '#46c6ba',
      '--d-blue-dark': '#185b59',
      '--d-blue-darker': '#123f40',
      '--d-green': '#78c9a4',
    },
  },
  // Smoky brown surfaces glow with copper links and ember selections.
  'hearth-embers': {
    page: '41 29 25',
    colors: {
      '--d': '#291d19',
      '--d-alt': '#3a2b24',
      '--d-bg': '#4d3a30',
      '--d-action': '#614b3e',
      '--d-border': '#160d09',
      '--d-text': '#f0e1d1',
      '--d-text-muted': '#d5bfa8',
      '--d-white': '#fff4e7',
      '--d-text-dark': '#39271d',
      ...accents,
      '--d-link': '#ffc08b',
      '--d-blue': '#df9454',
      '--d-blue-dark': '#70412c',
      '--d-blue-darker': '#4c2c21',
      '--d-orange': '#ffc08b',
      '--d-yellow': '#f4dda7',
    },
  },
  // Desaturated sepia suggests old parchment read by candlelight.
  'candlelit-parchment': {
    page: '40 37 30',
    colors: {
      '--d': '#28251e',
      '--d-alt': '#39352a',
      '--d-bg': '#4b4537',
      '--d-action': '#5c5545',
      '--d-border': '#14120b',
      '--d-text': '#ece5cf',
      '--d-text-muted': '#d6cbb0',
      '--d-white': '#fff7df',
      '--d-text-dark': '#373024',
      ...accents,
      '--d-link': '#e8d294',
      '--d-blue': '#bfa66a',
      '--d-blue-dark': '#62522c',
      '--d-blue-darker': '#443b24',
      '--d-yellow': '#eee0af',
      '--d-orange': '#e4b77e',
    },
  },
  // Ink-purple surfaces contain neon cyan links and hot-pink focus edges.
  'neon-arcade': {
    page: '22 15 36',
    colors: {
      '--d': '#160f24',
      '--d-alt': '#241b36',
      '--d-bg': '#342746',
      '--d-action': '#47365c',
      '--d-border': '#080410',
      '--d-text': '#ede0ff',
      '--d-text-muted': '#cdb9e6',
      '--d-white': '#fff3ff',
      '--d-text-dark': '#271334',
      ...accents,
      '--d-link': '#70f1ed',
      '--d-blue': '#f06dd2',
      '--d-blue-dark': '#5b285c',
      '--d-blue-darker': '#3d1b40',
      '--d-purple': '#e298ee',
      '--d-orange': '#ffb671',
    },
  },
  // Charcoal lavender and dusty rose soften a gothic midnight base.
  'pastel-goth': {
    page: '33 29 40',
    colors: {
      '--d': '#211d28',
      '--d-alt': '#302b39',
      '--d-bg': '#41394b',
      '--d-action': '#534960',
      '--d-border': '#100d16',
      '--d-text': '#e8dfef',
      '--d-text-muted': '#cbbdd7',
      '--d-white': '#fff3ff',
      '--d-text-dark': '#34273d',
      ...accents,
      '--d-link': '#f2bbd9',
      '--d-blue': '#c795d8',
      '--d-blue-dark': '#594067',
      '--d-blue-darker': '#3d2d48',
      '--d-purple': '#c795d8',
      '--d-red-light': '#f2adc3',
    },
  },
  // Obsidian burgundy meets molten-gold links and crimson selections.
  dragonfire: {
    page: '41 21 27',
    colors: {
      '--d': '#29151b',
      '--d-alt': '#3d232b',
      '--d-bg': '#51323b',
      '--d-action': '#66434c',
      '--d-border': '#15070c',
      '--d-text': '#f4e3da',
      '--d-text-muted': '#ddc0b6',
      '--d-white': '#fff5e8',
      '--d-text-dark': '#39212a',
      ...accents,
      '--d-link': '#ffd27e',
      '--d-blue': '#f0a24e',
      '--d-blue-dark': '#762d3f',
      '--d-blue-darker': '#511f2e',
      '--d-red': '#ef747b',
      '--d-red-light': '#ffb1aa',
      '--d-orange': '#ffb86e',
    },
  },
  // Rift violet surfaces shimmer with spectral lavender links.
  'rift-resonance': {
    page: '30 25 51',
    colors: {
      '--d': '#1e1933',
      '--d-alt': '#2b2647',
      '--d-bg': '#3b345c',
      '--d-action': '#4e4672',
      '--d-border': '#0d091b',
      '--d-text': '#e7e2fa',
      '--d-text-muted': '#c9bfeb',
      '--d-white': '#faf5ff',
      '--d-text-dark': '#2e2545',
      ...accents,
      '--d-link': '#d1baff',
      '--d-blue': '#a68aff',
      '--d-blue-dark': '#513478',
      '--d-blue-darker': '#362550',
      '--d-purple': '#b894ee',
      '--d-purple-dark': '#493065',
    },
  },
  // Twilight meadow greens recall Gnawnia with wheat-colored links.
  'gnawnia-dusk': {
    page: '32 37 27',
    colors: {
      '--d': '#20251b',
      '--d-alt': '#2f3627',
      '--d-bg': '#404934',
      '--d-action': '#525d43',
      '--d-border': '#0f140b',
      '--d-text': '#e6ecd7',
      '--d-text-muted': '#ccd5b6',
      '--d-white': '#faffea',
      '--d-text-dark': '#303923',
      ...accents,
      '--d-link': '#e0dd9c',
      '--d-blue': '#b4c77b',
      '--d-blue-dark': '#455b2b',
      '--d-blue-darker': '#303f21',
      '--d-green': '#b4c77b',
      '--d-yellow': '#eee3a6',
    },
  },
  // Soot and oxidized copper evoke the workshops of Burroughs.
  'burroughs-copper': {
    page: '38 32 30',
    colors: {
      '--d': '#26201e',
      '--d-alt': '#37302b',
      '--d-bg': '#4a4039',
      '--d-action': '#5d5146',
      '--d-border': '#130e0a',
      '--d-text': '#ece2d6',
      '--d-text-muted': '#d6c6b5',
      '--d-white': '#fff5e8',
      '--d-text-dark': '#352b23',
      ...accents,
      '--d-link': '#f5c397',
      '--d-blue': '#cf986a',
      '--d-blue-dark': '#66462d',
      '--d-blue-darker': '#463223',
      '--d-orange': '#efb37e',
      '--d-green': '#89c7b1',
    },
  },
  // Halloween plum shadows frame pumpkin links and witchy green edges.
  'haunted-harvest': {
    page: '34 27 37',
    colors: {
      '--d': '#221b25',
      '--d-alt': '#322938',
      '--d-bg': '#44384a',
      '--d-action': '#584960',
      '--d-border': '#100a14',
      '--d-text': '#eee2ef',
      '--d-text-muted': '#d2c0d4',
      '--d-white': '#fff4ff',
      '--d-text-dark': '#342336',
      ...accents,
      '--d-link': '#ffc28b',
      '--d-blue': '#a7d477',
      '--d-blue-dark': '#51422b',
      '--d-blue-darker': '#393020',
      '--d-orange': '#ffc28b',
      '--d-green': '#a7d477',
      '--d-purple': '#c397e0',
    },
  },
  // Evergreen winter surfaces use cranberry selections and candle-gold links.
  'winter-hearth': {
    page: '24 37 35',
    colors: {
      '--d': '#182523',
      '--d-alt': '#263633',
      '--d-bg': '#364944',
      '--d-action': '#475d56',
      '--d-border': '#091310',
      '--d-text': '#e3eee5',
      '--d-text-muted': '#c0d4c8',
      '--d-white': '#f6fff7',
      '--d-text-dark': '#24342b',
      ...accents,
      '--d-link': '#f4dba2',
      '--d-blue': '#df929b',
      '--d-blue-dark': '#663440',
      '--d-blue-darker': '#44262e',
      '--d-green': '#86c9a0',
      '--d-red-light': '#efadb4',
      '--d-yellow': '#f4dba2',
    },
  },
  // Dusky blue-green surfaces carry cherry-blossom links and mint edges.
  'spring-twilight': {
    page: '28 37 43',
    colors: {
      '--d': '#1c252b',
      '--d-alt': '#2b363f',
      '--d-bg': '#3a4853',
      '--d-action': '#4b5c68',
      '--d-border': '#0c141a',
      '--d-text': '#e6edf2',
      '--d-text-muted': '#c6d3de',
      '--d-white': '#f8fcff',
      '--d-text-dark': '#2b3540',
      ...accents,
      '--d-link': '#ffd0e5',
      '--d-blue': '#8acdb6',
      '--d-blue-dark': '#475365',
      '--d-blue-darker': '#303b4d',
      '--d-purple': '#d5a6db',
      '--d-green': '#8acdb6',
    },
  },
  // A pure-black page and restrained blue accents minimize ambient glow.
  'oled-ink': {
    page: '0 0 0',
    colors: {
      '--d': '#000000',
      '--d-alt': '#101318',
      '--d-bg': '#1d222a',
      '--d-action': '#303843',
      '--d-border': '#4e5969',
      '--d-text': '#dbe3ef',
      '--d-text-muted': '#b2bfd0',
      '--d-white': '#f1f6ff',
      '--d-text-dark': '#202a38',
      ...accents,
      '--d-link': '#afc9ff',
      '--d-blue': '#6e9fed',
      '--d-blue-dark': '#203857',
      '--d-blue-darker': '#122238',
    },
  },
  // Monochrome high contrast uses silver edges and an obvious grey selection.
  'silver-signal': {
    page: '8 8 8',
    colors: {
      '--d': '#080808',
      '--d-alt': '#161616',
      '--d-bg': '#242424',
      '--d-action': '#343434',
      '--d-border': '#8b8b8b',
      '--d-text': '#f5f5f5',
      '--d-text-muted': '#dedede',
      '--d-white': '#ffffff',
      '--d-text-dark': '#242424',
      ...accents,
      '--d-link': '#ededed',
      '--d-blue': '#bdbdbd',
      '--d-blue-dark': '#454545',
      '--d-blue-darker': '#2b2b2b',
      '--d-green': '#a8dda2',
      '--d-red-light': '#ffc0b9',
    },
  },
  // Near-black warm greys and subdued ivory links keep the UI minimal.
  'carbon-paper': {
    page: '18 17 15',
    colors: {
      '--d': '#12110f',
      '--d-alt': '#201f1c',
      '--d-bg': '#302e29',
      '--d-action': '#434038',
      '--d-border': '#080705',
      '--d-text': '#e2dfd5',
      '--d-text-muted': '#c3beb0',
      '--d-white': '#faf6e9',
      '--d-text-dark': '#29261f',
      ...accents,
      '--d-link': '#d6cfb2',
      '--d-blue': '#b7ab84',
      '--d-blue-dark': '#4d4632',
      '--d-blue-darker': '#342f23',
      '--d-yellow': '#e5dab0',
    },
  },
  // A light lavender experiment uses plum text and pale lilac selections.
  'cloud-candy': {
    light: true,
    page: '231 226 238',
    colors: {
      '--d': '#e7e2ee',
      '--d-alt': '#eee9f5',
      '--d-bg': '#f6f2fc',
      '--d-action': '#ffffff',
      '--d-border': '#ad9cbd',
      '--d-text': '#362b47',
      '--d-text-muted': '#645471',
      '--d-white': '#281d38',
      '--d-text-dark': '#362b47',
      ...lightAccents,
      '--d-link': '#613588',
      '--d-blue': '#8652af',
      '--d-blue-dark': '#ded0ef',
      '--d-blue-darker': '#e8dff4',
    },
  },
  // A sunny light experiment mixes lemon cream with dark olive text.
  'lemon-sorbet': {
    light: true,
    page: '238 232 201',
    colors: {
      '--d': '#eee8c9',
      '--d-alt': '#f4efd8',
      '--d-bg': '#faf7e7',
      '--d-action': '#fffdf3',
      '--d-border': '#afa276',
      '--d-text': '#393522',
      '--d-text-muted': '#686047',
      '--d-white': '#282314',
      '--d-text-dark': '#393522',
      ...lightAccents,
      '--d-link': '#615100',
      '--d-blue': '#887000',
      '--d-blue-dark': '#e1d49b',
      '--d-blue-darker': '#eee3bc',
    },
  },
  // A light Gnawnia homage pairs meadow mist with forest-green text.
  'gnawnia-morning': {
    light: true,
    page: '223 233 216',
    colors: {
      '--d': '#dfe9d8',
      '--d-alt': '#e8f0e2',
      '--d-bg': '#f2f7ed',
      '--d-action': '#fcfff8',
      '--d-border': '#9daf92',
      '--d-text': '#283b29',
      '--d-text-muted': '#53674f',
      '--d-white': '#1c2e1d',
      '--d-text-dark': '#283b29',
      ...lightAccents,
      '--d-link': '#2f6139',
      '--d-blue': '#4b8052',
      '--d-blue-dark': '#cbdcbe',
      '--d-blue-darker': '#deead4',
    },
  },
  // A bright coastal experiment sets deep teal text on blue-white porcelain.
  'seaside-porcelain': {
    light: true,
    page: '220 233 239',
    colors: {
      '--d': '#dce9ef',
      '--d-alt': '#e6f0f5',
      '--d-bg': '#f0f8fc',
      '--d-action': '#ffffff',
      '--d-border': '#94aebb',
      '--d-text': '#233c49',
      '--d-text-muted': '#506978',
      '--d-white': '#172e3a',
      '--d-text-dark': '#233c49',
      ...lightAccents,
      '--d-link': '#176176',
      '--d-blue': '#287f94',
      '--d-blue-dark': '#c5dfe8',
      '--d-blue-darker': '#d7eaf2',
    },
  },
  // A light rose experiment uses wine-colored text and blush selections.
  'rose-quartz': {
    light: true,
    page: '239 223 223',
    colors: {
      '--d': '#efdfdf',
      '--d-alt': '#f5e8e9',
      '--d-bg': '#fcf2f3',
      '--d-action': '#ffffff',
      '--d-border': '#ba989f',
      '--d-text': '#482d37',
      '--d-text-muted': '#755560',
      '--d-white': '#341e29',
      '--d-text-dark': '#482d37',
      ...lightAccents,
      '--d-link': '#883859',
      '--d-blue': '#af587b',
      '--d-blue-dark': '#e8cbd5',
      '--d-blue-darker': '#f1dce4',
    },
  },
  // A warm parchment page close to the classic game look, with brown ink text.
  parchment: {
    light: true,
    page: '238 229 214',
    colors: {
      '--d': '#eee5d6',
      '--d-alt': '#f5ede2',
      '--d-bg': '#fbf6ee',
      '--d-action': '#fffdfa',
      '--d-border': '#b0a38c',
      '--d-text': '#3a2e1b',
      '--d-text-muted': '#685c47',
      '--d-white': '#2a200d',
      '--d-text-dark': '#3a2e1b',
      ...lightAccents,
      '--d-link': '#753b07',
      '--d-blue': '#94582a',
      '--d-blue-dark': '#e7cfbf',
      '--d-blue-darker': '#f1dfd4',
    },
  },
  // Pairs with the Birthday background: frosting blue with a party-pink accent.
  'birthday-frosting': {
    light: true,
    page: '219 232 244',
    colors: {
      '--d': '#dbe8f4',
      '--d-alt': '#e5f0f9',
      '--d-bg': '#f0f8ff',
      '--d-action': '#fbfeff',
      '--d-border': '#93a7ba',
      '--d-text': '#213241',
      '--d-text-muted': '#4d6070',
      '--d-white': '#132331',
      '--d-text-dark': '#213241',
      ...lightAccents,
      '--d-link': '#7e2757',
      '--d-blue': '#9e4573',
      '--d-blue-dark': '#edc9d8',
      '--d-blue-darker': '#f5dbe6',
    },
  },
  // Pairs with the Great Winter Hunt background: snowy blue-white with a pine accent.
  'winter-hunt-snow': {
    light: true,
    page: '219 233 240',
    colors: {
      '--d': '#dbe9f0',
      '--d-alt': '#e6f0f6',
      '--d-bg': '#f1f8fc',
      '--d-action': '#fbfeff',
      '--d-border': '#94a8b3',
      '--d-text': '#21333c',
      '--d-text-muted': '#4e616b',
      '--d-white': '#13242d',
      '--d-text-dark': '#21333c',
      ...lightAccents,
      '--d-link': '#005c4a',
      '--d-blue': '#1b7a66',
      '--d-blue-dark': '#c0dbd3',
      '--d-blue-darker': '#d4e8e2',
    },
  },
  // Pairs with the Halloween background: pumpkin cream with a candy-purple accent.
  'halloween-pumpkin': {
    light: true,
    page: '245 226 212',
    colors: {
      '--d': '#f5e2d4',
      '--d-alt': '#faebe0',
      '--d-bg': '#fff5ed',
      '--d-action': '#fffcf9',
      '--d-border': '#bb9e88',
      '--d-text': '#412b18',
      '--d-text-muted': '#715844',
      '--d-white': '#311c09',
      '--d-text-dark': '#412b18',
      ...lightAccents,
      '--d-link': '#5e3685',
      '--d-blue': '#7b52a4',
      '--d-blue-dark': '#dbcded',
      '--d-blue-darker': '#e8def5',
    },
  },
  // Pairs with the King’s Giveaway background: royal lilac with a gold-brown accent.
  'kings-giveaway-velvet': {
    light: true,
    page: '231 227 247',
    colors: {
      '--d': '#e7e3f7',
      '--d-alt': '#efecfb',
      '--d-bg': '#f7f5ff',
      '--d-action': '#fefdff',
      '--d-border': '#a6a0bd',
      '--d-text': '#322c43',
      '--d-text-muted': '#5f5973',
      '--d-white': '#231d34',
      '--d-text-dark': '#322c43',
      ...lightAccents,
      '--d-link': '#6c4300',
      '--d-blue': '#8a5f18',
      '--d-blue-dark': '#e2d2bb',
      '--d-blue-darker': '#ede1d1',
    },
  },
  // Pairs with the Lunar New Year background: lantern red on warm paper.
  'lunar-lantern': {
    light: true,
    page: '248 224 221',
    colors: {
      '--d': '#f8e0dd',
      '--d-alt': '#fceae8',
      '--d-bg': '#fff3f2',
      '--d-action': '#fffcfb',
      '--d-border': '#be9b97',
      '--d-text': '#432825',
      '--d-text-muted': '#745552',
      '--d-white': '#331917',
      '--d-text-dark': '#432825',
      ...lightAccents,
      '--d-link': '#8d1a1e',
      '--d-blue': '#af3c3a',
      '--d-blue-dark': '#f5c8c3',
      '--d-blue-darker': '#fbdad6',
    },
  },
  // Pairs with the Spring Egg Hunt background: fresh grass with a robin-egg accent.
  'spring-meadow': {
    light: true,
    page: '223 235 217',
    colors: {
      '--d': '#dfebd9',
      '--d-alt': '#e9f2e4',
      '--d-bg': '#f3f9ef',
      '--d-action': '#fcfefa',
      '--d-border': '#9aab91',
      '--d-text': '#27351f',
      '--d-text-muted': '#53634b',
      '--d-white': '#192611',
      '--d-text-dark': '#27351f',
      ...lightAccents,
      '--d-link': '#00596f',
      '--d-blue': '#00778d',
      '--d-blue-dark': '#bbdbe3',
      '--d-blue-darker': '#d1e8ed',
    },
  },
  // Pairs with the Valentine’s background: blush pink with a cherry accent.
  'valentines-blush': {
    light: true,
    page: '246 224 226',
    colors: {
      '--d': '#f6e0e2',
      '--d-alt': '#fbeaeb',
      '--d-bg': '#fff3f5',
      '--d-action': '#fffcfc',
      '--d-border': '#bb9b9f',
      '--d-text': '#41282c',
      '--d-text-muted': '#725559',
      '--d-white': '#311a1d',
      '--d-text-dark': '#41282c',
      ...lightAccents,
      '--d-link': '#8c1832',
      '--d-blue': '#ae3b4c',
      '--d-blue-dark': '#f5c7c9',
      '--d-blue-darker': '#fbd9db',
    },
  },
  // Pairs with the Mint Surf background: sea-glass mint with an ocean-blue accent.
  'mint-surf': {
    light: true,
    page: '215 236 228',
    colors: {
      '--d': '#d7ece4',
      '--d-alt': '#e3f3ec',
      '--d-bg': '#effaf5',
      '--d-action': '#fafffd',
      '--d-border': '#8dada1',
      '--d-text': '#1b372d',
      '--d-text-muted': '#48655a',
      '--d-white': '#0b281f',
      '--d-text-dark': '#1b372d',
      ...lightAccents,
      '--d-link': '#00567d',
      '--d-blue': '#00739c',
      '--d-blue-dark': '#bbdae9',
      '--d-blue-darker': '#d1e7f2',
    },
  },
  // Pairs with the Canary Shine background: buttercup yellow with a marigold accent.
  'canary-shine': {
    light: true,
    page: '240 231 194',
    colors: {
      '--d': '#f0e7c2',
      '--d-alt': '#f6efd3',
      '--d-bg': '#fcf7e3',
      '--d-action': '#fffef5',
      '--d-border': '#b4a56c',
      '--d-text': '#3d2f00',
      '--d-text-muted': '#6b5d25',
      '--d-white': '#2d2000',
      '--d-text-dark': '#3d2f00',
      ...lightAccents,
      '--d-link': '#7a3800',
      '--d-blue': '#9a5505',
      '--d-blue-dark': '#eaceb9',
      '--d-blue-darker': '#f3dfd0',
    },
  },
  // Pairs with the Glacial Gleam background: icy slate with a steel-teal accent.
  'glacial-gleam': {
    light: true,
    page: '219 233 237',
    colors: {
      '--d': '#dbe9ed',
      '--d-alt': '#e6f1f3',
      '--d-bg': '#f1f8fa',
      '--d-action': '#fbfeff',
      '--d-border': '#94a9ae',
      '--d-text': '#223438',
      '--d-text-muted': '#4e6166',
      '--d-white': '#132529',
      '--d-text-dark': '#223438',
      ...lightAccents,
      '--d-link': '#005768',
      '--d-blue': '#237486',
      '--d-blue-dark': '#c1d9e0',
      '--d-blue-darker': '#d5e7eb',
    },
  },
  // Pairs with the Skyline Whisper background: clear sky with a cobalt accent.
  'skyline-whisper': {
    light: true,
    page: '218 233 244',
    colors: {
      '--d': '#dae9f4',
      '--d-alt': '#e5f0f9',
      '--d-bg': '#f0f8fe',
      '--d-action': '#fbfeff',
      '--d-border': '#92a8b9',
      '--d-text': '#1f3340',
      '--d-text-muted': '#4c6170',
      '--d-white': '#112431',
      '--d-text-dark': '#1f3340',
      ...lightAccents,
      '--d-link': '#184998',
      '--d-blue': '#3566b8',
      '--d-blue-dark': '#c2d5f5',
      '--d-blue-darker': '#d6e4fb',
    },
  },
  // Pairs with the Flamingo Fling background: flamingo pink with a magenta accent.
  'flamingo-fling': {
    light: true,
    page: '245 223 233',
    colors: {
      '--d': '#f5dfe9',
      '--d-alt': '#fae9f0',
      '--d-bg': '#fff3f8',
      '--d-action': '#fffcfe',
      '--d-border': '#ba9aa8',
      '--d-text': '#412733',
      '--d-text-muted': '#705461',
      '--d-white': '#311924',
      '--d-text-dark': '#412733',
      ...lightAccents,
      '--d-link': '#871459',
      '--d-blue': '#a83876',
      '--d-blue-dark': '#f2c6d9',
      '--d-blue-darker': '#f9d9e7',
    },
  },
  // Pairs with the Orange Coral background: peach with a coral accent.
  'orange-coral': {
    light: true,
    page: '247 225 217',
    colors: {
      '--d': '#f7e1d9',
      '--d-alt': '#fbeae4',
      '--d-bg': '#fff4f0',
      '--d-action': '#fffcfa',
      '--d-border': '#bd9c91',
      '--d-text': '#432920',
      '--d-text-muted': '#73564c',
      '--d-white': '#331a12',
      '--d-text-dark': '#432920',
      ...lightAccents,
      '--d-link': '#892218',
      '--d-blue': '#ab4235',
      '--d-blue-dark': '#f3c9c1',
      '--d-blue-darker': '#fadbd5',
    },
  },
  // Pairs with the Lavender Lustre background: soft lavender with a violet accent.
  'lavender-lustre': {
    light: true,
    page: '233 227 246',
    colors: {
      '--d': '#e9e3f6',
      '--d-alt': '#f0ecfb',
      '--d-bg': '#f8f5ff',
      '--d-action': '#fefdff',
      '--d-border': '#a89fbc',
      '--d-text': '#332b43',
      '--d-text-muted': '#615872',
      '--d-white': '#251d33',
      '--d-text-dark': '#332b43',
      ...lightAccents,
      '--d-link': '#553494',
      '--d-blue': '#7152b5',
      '--d-blue-dark': '#d6cef4',
      '--d-blue-darker': '#e4dffa',
    },
  },
};

/**
 * Build the CSS for a palette.
 *
 * @param {Object} palette The palette.
 *
 * @return {string} The CSS.
 */
const getPaletteCss = (palette) => {
  const overlays = [30, 40, 50, 70, 90].map((alpha) => [`--d-transparent-${alpha}`, `rgb(${palette.page} / ${alpha}%)`]);
  const declarations = [...Object.entries(palette.colors), ...overlays].map(([name, value]) => `${name}: ${value};`).join('');

  // The doubled :root outranks the defaults in _root.css without needing !important.
  return `:root:root{${declarations}}`;
};

/**
 * Apply the selected palette, or remove the override for the current palette.
 *
 * @param {string} [value] The palette to apply. Defaults to the saved setting.
 */
const applyPalette = (value = getSetting(`${settingKey}-0`, 'current')) => {
  let style = document.querySelector(`#${styleId}`);
  const palette = palettes[value];

  if (palette?.light || false === palette?.darkMenu) {
    addBodyClass(lightMenuClass, true);
  } else {
    removeBodyClass(lightMenuClass);
  }

  if (palette?.light) {
    addBodyClass(lightPaletteClass, true);
  } else {
    removeBodyClass(lightPaletteClass);
  }

  if (!palette) {
    style?.remove();
    return;
  }

  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.append(style);
  }

  style.textContent = getPaletteCss(palette);
};

/**
 * Turn on Dark Mode, so picking a palette is all it takes to switch the color scheme.
 */
const enableDarkMode = () => {
  if (getSetting('native-dark-mode', false)) {
    return;
  }

  saveSetting('native-dark-mode', true);

  // Dark Mode is a live module, so this turns it on without a reload.
  doEvent('mh-improved-settings-changed', {
    key: 'native-dark-mode',
    value: true,
    tab: 'mousehunt-improved-settings',
    type: 'toggle',
  });

  // Keep the toggle on the settings page in step, if it's showing.
  document.querySelector('#mousehunt-improved-settings-native-dark-mode .mousehuntSettingSlider')?.classList.add('active');
};

/**
 * Save a picker setting, apply it, and show it on the settings page if it's open.
 *
 * @param {string} key   The setting key, without the slot suffix.
 * @param {string} value The new value.
 */
const saveSchemeSetting = (key, value) => {
  saveSetting(`${key}-0`, value);
  doEvent('mh-improved-settings-changed', { key: `${key}-0`, value, tab: 'mousehunt-improved-settings', type: 'multi-select' });

  const row = document.querySelector(`#mousehunt-improved-settings-${key.replaceAll('.', '-')}`);
  const picker = row?.querySelector('.mhui-item-picker');
  if (picker) {
    picker.showValue?.(value);
    return;
  }

  // Setting a select's value directly doesn't fire its change event, so it isn't saved twice.
  const select = row?.querySelector('select');
  if (select) {
    select.value = value;
  }
};

/**
 * Apply a full color scheme: the palette plus the matching background, shield, horn, and HUD.
 *
 * Each piece is saved as that module's own setting, so it can still be changed on its own afterward.
 *
 * @param {string} id The scheme ID.
 */
const applyScheme = (id) => {
  const scheme = schemes[id];
  if (!scheme) {
    return;
  }

  saveSchemeSetting(settingKey, scheme.palette);

  for (const [module, value] of Object.entries(scheme.settings)) {
    saveSchemeSetting(module, value);
  }
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles(lightStyles, 'dark-mode-palette');
  applyPalette();

  onEvent('mh-improved-settings-changed', ({ key, value }) => {
    if (`${settingKey}-0` === key) {
      enableDarkMode();
      applyPalette(value);
    } else if (`${schemeSettingKey}-0` === key) {
      applyScheme(value);
    }
  });

  onModuleToggle('dark-mode-palette', {
    enable: () => applyPalette(),
    disable: () => {
      document.querySelector(`#${styleId}`)?.remove();
      removeBodyClass(lightMenuClass);
      removeBodyClass(lightPaletteClass);
    },
  });
};

/**
 * Add settings for the module.
 *
 * @return {Array} The settings for the module.
 */
const settings = async () => {
  const options = [
    {
      name: 'Dark',
      value: 'group',
      options: [
        { name: 'Current', value: 'current' },
        { name: 'Original (before tuning)', value: 'original' },
        { name: 'Neutral', value: 'neutral' },
        { name: 'Neutral, darker', value: 'neutral-dark' },
        { name: 'Warm', value: 'warm' },
        { name: 'Deep navy', value: 'deep-navy' },
        { name: 'Sea slate', value: 'sea-slate' },
        { name: 'Graphite', value: 'graphite' },
        { name: 'Aubergine', value: 'aubergine' },
        { name: 'Mosswood', value: 'mosswood' },
        { name: 'Midnight lagoon', value: 'midnight-lagoon' },
        { name: 'Hearth embers', value: 'hearth-embers' },
        { name: 'Candlelit parchment', value: 'candlelit-parchment' },
        { name: 'Neon arcade', value: 'neon-arcade' },
        { name: 'Pastel goth', value: 'pastel-goth' },
        { name: 'Dragonfire', value: 'dragonfire' },
        { name: 'Rift resonance', value: 'rift-resonance' },
        { name: 'Gnawnia dusk', value: 'gnawnia-dusk' },
        { name: 'Burroughs copper', value: 'burroughs-copper' },
        { name: 'Haunted harvest', value: 'haunted-harvest' },
        { name: 'Winter hearth', value: 'winter-hearth' },
        { name: 'Spring twilight', value: 'spring-twilight' },
        { name: 'OLED ink', value: 'oled-ink' },
        { name: 'Silver signal', value: 'silver-signal' },
        { name: 'Carbon paper', value: 'carbon-paper' },
      ],
    },
    {
      name: 'Light',
      value: 'group',
      options: [
        { name: 'Birthday frosting', value: 'birthday-frosting' },
        { name: 'Canary shine', value: 'canary-shine' },
        { name: 'Cloud candy', value: 'cloud-candy' },
        { name: 'Flamingo fling', value: 'flamingo-fling' },
        { name: 'Glacial gleam', value: 'glacial-gleam' },
        { name: 'Gnawnia morning', value: 'gnawnia-morning' },
        { name: 'Halloween pumpkin', value: 'halloween-pumpkin' },
        { name: "King's giveaway velvet", value: 'kings-giveaway-velvet' },
        { name: 'Lavender lustre', value: 'lavender-lustre' },
        { name: 'Lemon sorbet', value: 'lemon-sorbet' },
        { name: 'Lunar lantern', value: 'lunar-lantern' },
        { name: 'Mint surf', value: 'mint-surf' },
        { name: 'Orange coral', value: 'orange-coral' },
        { name: 'Parchment', value: 'parchment' },
        { name: 'Rose quartz', value: 'rose-quartz' },
        { name: 'Seaside porcelain', value: 'seaside-porcelain' },
        { name: 'Skyline whisper', value: 'skyline-whisper' },
        { name: 'Spring meadow', value: 'spring-meadow' },
        { name: "Valentine's blush", value: 'valentines-blush' },
        { name: 'Winter hunt snow', value: 'winter-hunt-snow' },
      ],
    },
  ];

  const schemeOptions = [{ name: 'None', value: 'none' }, ...Object.entries(schemes).map(([value, scheme]) => ({ name: scheme.name, value }))];

  return [
    {
      id: settingKey,
      title: 'Color scheme',
      live: true,
      default: [{ name: 'Current', value: 'current' }],
      settings: {
        type: 'multi-select',
        number: 1,
        options,
      },
    },
    {
      id: schemeSettingKey,
      title: 'Theme preset',
      description: 'Apply matching interface colors, page and camp backgrounds, shield, horn, and HUD.',
      live: true,
      default: [schemeOptions[0]],
      settings: {
        type: 'multi-select',
        number: 1,
        options: schemeOptions,
      },
    },
  ];
};

export default {
  id: 'dark-mode-palette',
  name: 'Dark Mode Color Schemes',
  description: 'Choose a dark or light appearance. Selecting a color scheme turns on Dark Mode.',
  type: 'personalization',
  badge: 'Experimental',
  default: false,
  liveToggle: true,
  load: init,
  settings,
};
