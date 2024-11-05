import { makeElement } from './elements';

/**
 * Show a message in the horn dialog.
 *
 * Type can be: bait_empty unknown_error bait_disarmed recent_turn recent_linked_turn puzzle info error warning success.
 * Available colors: blue, cyan, cyan-alt, green, green-alt, grey, orange, orange-alt, pink, purple, red, red-alt, yellow.
 *
 * @param {Object}   options               Options for the message.
 * @param {string}   options.title         Title of the message. Keep it under 50 characters.
 * @param {string}   options.text          Text of the message. Keep it under 90 characters.
 * @param {string}   options.button        Text of the button.
 * @param {Function} options.action        Callback for the button.
 * @param {number}   options.dismiss       Time to dismiss the message.
 * @param {string}   options.type          Type of the message. Controls the type of message displayed.
 * @param {string}   options.color         Color of the message.
 * @param {string}   options.classname     Classname of the message.
 * @param {string}   options.image         URL of the image to display.
 * @param {string}   options.imageLink     URL for the image link.
 * @param {Function} options.imageCallback Callback for the image click.
 *
 * @example
 * ```js
 * showHornMessage({
 *  title: 'This is a reminder',
 *  text: 'Maybe it tells you to do something',
 *  button: 'Got it!',
 *  action: () => { doSomething(); },
 *  dismiss: 5000,
 *  color: 'pink',
 * });
 * ```
 */
const showHornMessage = (options) => {
  const huntersHornView = document.querySelector('.huntersHornView__messageContainer');
  if (! huntersHornView) {
    return;
  }

  const settings = {
    title: options.title || 'Hunters Horn',
    text: options.text || 'This is a message from the Hunters Horn',
    button: options.button || 'OK',
    action: options.action || (() => {}),
    dismiss: options.dismiss || null,
    type: options.type || (options.color ? 'bait_disarmed' : 'recent_linked_turn'),
    color: options.color || false,
    classname: options.classname || '',
    image: options.image || null,
    imageLink: options.imageLink || null,
    imageCallback: options.imageCallback || null,
  };

  if ('info' === settings.type) {
    type = 'bait_disarmed';
  } else if ('error' === settings.type) {
    settings.type = 'bait_disarmed';
    settings.color = 'red';
  } else if ('warning' === settings.type) {
    settings.type = 'bait_disarmed';
    settings.color = 'yellow';
  } else if ('success' === settings.type) {
    type = 'bait_disarmed';
    settings.color = 'green';
  }

  // do the other effects
  const backdrop = document.querySelector('.huntersHornView__backdrop');
  if (backdrop) {
    backdrop.classList.add('huntersHornView__backdrop--active');
  }

  const gameInfo = document.querySelector('.mousehuntHud-gameInfo');
  if (gameInfo) {
    gameInfo.classList.add('blur');
  }

  const fragment = document.createDocumentFragment();

  const messageWrapper = makeElement('div', ['huntersHornView__message huntersHornView__message--active', settings.classname]);
  const message = makeElement('div', [
    'huntersHornMessageView',
    'huntersHornMessageView--shadow',
    `huntersHornMessageView--${settings.type}`,
    settings.color ? `huntersHornMessageView--color-${settings.color}` : ''
  ]);

  makeElement('div', 'huntersHornMessageView__title', settings.title, message);
  const content = makeElement('div', 'huntersHornMessageView__content');

  if (settings.image) {
    if ('recent_turn' === settings.type || 'recent_linked_turn' === settings.type) {
      const imgWrapper = makeElement('div', 'huntersHornMessageView__friend');
      const img = makeElement('a', 'huntersHornMessageView__friendProfilePic');
      if (settings.imageLink) {
        img.href = settings.imageLink;
      } else if (settings.imageCallback) {
        img.addEventListener('click', settings.imageCallback);
      } else {
        img.href = '#';
      }

      img.style.backgroundImage = `url(${settings.image})`;

      imgWrapper.append(img);
      content.append(imgWrapper);
    } else {
      content.classList.add('huntersHornMessageView__content--image');
      content.setAttribute('style', `--bg-image: url(${settings.image})`);
    }
  }

  makeElement('div', 'huntersHornMessageView__text', settings.text, content);
  const buttonSpacer = makeElement('div', 'huntersHornMessageView__buttonSpacer');
  const button = makeElement('button', 'huntersHornMessageView__action');
  const buttonLabel = makeElement('div', 'huntersHornMessageView__actionLabel');
  makeElement('span', 'huntersHornMessageView__actionText', settings.button, buttonLabel);

  button.append(buttonLabel);

  button.addEventListener('click', () => {
    if (settings.action) {
      settings.action();
    }

    messageWrapper.innerHTML = '';
    backdrop.classList.remove('huntersHornView__backdrop--active');
    gameInfo.classList.remove('blur');
  });

  buttonSpacer.append(button);
  content.append(buttonSpacer);

  message.append(content);

  if (settings.dismiss) {
    const countdown = makeElement('button', ['huntersHornMessageView__countdown']);
    makeElement('div', 'huntersHornMessageView__countdownButtonImage', '', countdown);

    const svgMarkup = `<svg class="huntersHornMessageView__countdownSVG">
        <circle r="46%" cx="50%" cy="50%" class="huntersHornMessageView__countdownCircleTrack"></circle>
        <circle r="46%" cx="50%" cy="50%" class="huntersHornMessageView__countdownCircle" style="animation-duration: ${settings.dismiss}ms;"></circle>
    </svg>`;
    countdown.innerHTML += svgMarkup;

    countdown.addEventListener('click', () => {
      countdown.classList.add('huntersHornMessageView__countdown--complete');
      messageWrapper.innerHTML = '';
      backdrop.classList.remove('huntersHornView__backdrop--active');
      gameInfo.classList.remove('blur');
    });

    message.append(countdown);
  }

  messageWrapper.append(message);

  // remove any existing messages
  const existingMessages = huntersHornView.querySelector('.huntersHornView__message');
  if (existingMessages) {
    existingMessages.remove();
  }

  fragment.append(messageWrapper);

  huntersHornView.append(fragment);

  if (settings.dismiss) {
    setTimeout(() => {
      const countdown = messageWrapper.querySelector('.huntersHornMessageView__countdown');
      if (countdown) {
        countdown.classList.add('huntersHornMessageView__countdown--complete');
      }
      messageWrapper.innerHTML = '';
      backdrop.classList.remove('huntersHornView__backdrop--active');
      gameInfo.classList.remove('blur');
    }, settings.dismiss);
  }
};

export {
  showHornMessage
};
