import { addStyles, makeElement, makeElementDraggable } from '@utils';
import styles from '../styles/memory-game.css';

let hasInitialized = false;

/**
 * Launch an in-page memory matching game.
 *
 * @param {Object} options         Configuration options.
 * @param {Array}  options.items   Array of item objects to use for cards.
 * @param {string} [options.title] Title displayed on the game overlay.
 * @param {string} [options.mode]  Difficulty mode (`easy`, `hard`, `extreme`, `nope`).
 */
const startMemoryGame = ({ items = [], title = 'Memory Matching Game', mode = 'easy' }) => {
  if (! hasInitialized) {
    addStyles(styles, 'mh-improved-memory-game');
    hasInitialized = true;
  }

  if (! items.length) {
    return;
  }

  let cardCount = 8; // Default to easy mode
  switch (mode) {
  case 'hard':
    cardCount = 4 * 4; break;
  case 'extreme':
    cardCount = 4 * 6; break;
  case 'nope':
    cardCount = 70; break;
  }

  const createGameOverlay = () => {
    return makeElement('div', ['mh-improved-memory-game', `mh-improved-memory-game-${mode}`],
      `<div class="mh-improved-memory-game-header">
        <h1>${title}</h1>
        <svg class="mh-improved-memory-close" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 6L6 18M6 6l12 12"></path>
        </svg>
      </div>
      <div class="mh-improved-memory-grid"></div>
      <div class="mh-improved-memory-message">
        Find all matching pairs!
      </div>`
    );
  };

  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let hintClickCount = 0;

  const resetGame = () => {
    let itemsToUse = items;
    if (itemsToUse.length > cardCount) {
      itemsToUse = itemsToUse.sort(() => Math.random() - 0.5).slice(0, cardCount);
    }

    // Shuffle cards and reset game state
    const cards = [...itemsToUse, ...itemsToUse].sort(() => Math.random() - 0.5);
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    hintClickCount = 0; // Reset hint counter

    // Clear and repopulate the grid
    grid.innerHTML = '';
    cards.forEach((item, index) => {
      const card = makeElement('div', 'mh-improved-memory-card',
        `<div class="mh-improved-card-front">?</div>
        <div class="mh-improved-card-back">
          <img src="${item.image || item.images.upscaled || item.images.best}" alt="${item.name}" title="${item.name}" />
          <span class="mh-improved-card-name">${item.name}</span>
        </div>`
      );

      card.setAttribute('data-index', index);
      card.setAttribute('data-symbol', item.id);

      card.addEventListener('click', () => flipCard(card));
      grid.append(card);
    });

    // Reset message
    const message = gameOverlay.querySelector('.mh-improved-memory-message');
    message.innerHTML = 'Find all matching pairs!';
    gameOverlay.classList.remove('victory');
  };

  // Create or reuse the game overlay
  let gameOverlay = document.querySelector('.mh-improved-memory-game');
  if (! gameOverlay) {
    gameOverlay = createGameOverlay();
    document.body.append(gameOverlay);
    makeElementDraggable(
      `.mh-improved-memory-game-${mode}`,
      '.mh-improved-memory-game-header',
      mode === 'nope' ? 95 : 200,
      mode === 'nope' ? 20 : 100
    );
  }

  const grid = gameOverlay.querySelector('.mh-improved-memory-grid');
  const message = gameOverlay.querySelector('.mh-improved-memory-message');

  // Add hint click listener to message
  message.addEventListener('click', () => {
    if (gameOverlay.classList.contains('victory')) {
      return; // Don't give hints when game is won
    }

    hintClickCount++;
    if (hintClickCount >= 3) {
      giveHint();
      hintClickCount = 0; // Reset counter after giving hint
    }
  });

  resetGame();

  const giveHint = () => {
    if (flippedCards.length >= 2 || matchedPairs === cardCount) {
      return;
    }

    // Find all unmatched cards
    const unmatchedCards = [...grid.querySelectorAll('.mh-improved-memory-card:not(.matched)')];

    if (unmatchedCards.length === 0) {
      return;
    }

    // If one card is flipped, find its match
    if (flippedCards.length === 1) {
      const symbol = flippedCards[0].dataset.symbol;
      const matchingCard = grid.querySelector(`.mh-improved-memory-card[data-symbol="${symbol}"]:not(.flipped):not(.matched)`);
      if (matchingCard) {
        matchingCard.classList.add('hint');
        setTimeout(() => matchingCard.classList.remove('hint'), 1000);
        return;
      }
    }

    // Otherwise, highlight a random pair
    const symbols = new Set();
    const availableCards = [];

    unmatchedCards.forEach((card) => {
      const symbol = card.dataset.symbol;
      if (! symbols.has(symbol)) {
        symbols.add(symbol);
        const pair = unmatchedCards.filter((c) => c.dataset.symbol === symbol);
        if (pair.length === 2) {
          availableCards.push(pair);
        }
      }
    });

    if (availableCards.length > 0) {
      const randomPair = availableCards[Math.floor(Math.random() * availableCards.length)];
      randomPair.forEach((card) => {
        card.classList.add('hint');
      });

      setTimeout(() => {
        randomPair.forEach((card) => {
          card.classList.remove('hint');
        });
      }, 1000);
    }
  };

  const flipCard = (card) => {
    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
      return;
    }
    if (flippedCards.length >= 2) {
      return;
    }

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves++;
      setTimeout(checkMatch, 800);
    }
  };

  const checkMatch = () => {
    const [card1, card2] = flippedCards;

    if (card1.dataset.symbol === card2.dataset.symbol) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      matchedPairs++;

      if (matchedPairs === cardCount) {
        setTimeout(() => {
          const messageEl = gameOverlay.querySelector('.mh-improved-memory-message');
          gameOverlay.classList.add('victory');
          message.innerHTML = `
            <span class="mh-improved-message-text">
              🎉 Completed in ${moves} moves.
            </span>
            <a class="mh-improved-memory-play-again" href="#">Play Again</a>`;

          const playAgain = messageEl.querySelector('.mh-improved-memory-play-again');
          if (playAgain) {
            playAgain.addEventListener('click', (e) => {
              e.preventDefault();
              resetGame();
            });
          }
        }, 500);
      }
    } else {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
    }

    flippedCards = [];
  };

  gameOverlay.querySelector('.mh-improved-memory-close').addEventListener('click', () => {
    gameOverlay.remove();
  });
};

export { startMemoryGame };
