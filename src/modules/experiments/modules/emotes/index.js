import { addStyles, onRender } from '@utils';

export default () => {
  addStyles('.emote { vertical-align: bottom; }', 'emote-styles');

  onRender({
    group: 'MessageBoardView',
    layout: 'layout',
    after: true,
    callback: (data, results) => {
      results = results.replaceAll(':jerry:', '<img src="https://i.mouse.rip/emotes/jerry.png" alt=":jerry:" width="20" height="20" class="emote" />');
      return results;
    }
  });
};
