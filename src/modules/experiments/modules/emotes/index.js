import { addStyles, onNavigation, onRender } from '@utils';

import emotes from '@data/emotes.json';

/**
 * Replace emotes with images in the text.
 *
 * @param {string} text The text to replace emotes in.
 *
 * @return {string} The text with emotes replaced with images.
 */
const replaceInText = (text) => {
  const regex = new RegExp(`:(${Object.keys(emotes).join('|')}):`, 'g');
  text = text.replace(regex, (match, emote) => {
    // If it's only an emote in the text, make it bigger.
    const size = text === `:${emote}:` ? 60 : 20;

    return `<img class="emote" src="${emotes[emote]}" alt="${emote}" title="${emote}" width="${size}" height="${size}">`;
  });

  return text;
};

export default () => {
  addStyles('.emote { vertical-align: bottom; }', 'emote-styles');

  onRender({
    group: 'MessageBoardView',
    layout: 'layout',
    after: true,
    callback: (data, results) => {
      return replaceInText(results);
    }
  });

  onNavigation(() => {
    const messages = document.querySelectorAll('.messageBoardView-message-body');
    messages.forEach((message) => {
      message.innerHTML = replaceInText(message.innerHTML);
    });
  }, {
    page: 'hunterprofile',
  });
};
