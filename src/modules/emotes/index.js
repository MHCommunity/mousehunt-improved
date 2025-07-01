import { addStyles, onNavigation, onRender } from '@utils';

import emotes from './emotes.json';

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
    return `<img class="emote" src="${emotes[emote]}" alt=":${emote}:" title=":${emote}:" width="20" height="20">`;
  });

  return text;
};

/**
 * Initialize the module.
 */
const init = () => {
  addStyles('.emote { vertical-align: bottom; }', 'emotes');

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

export default {
  id: 'emotes',
  name: 'Emotes',
  type: 'feature',
  default: true,
  description: 'Replace Discord-style emotes on corkboards (e.g., :jerry:) with actual images in map and profile corkboard messages. <a href="https://github.com/MHCommunity/mousehunt-improved/blob/main/docs/emotes.md" target="_blank" rel="noreferrer">View the list of supported emotes</a>',
  load: init,
};
