import { addStyles, makeElement, onRequest } from '@utils';

import styles from './styles.css';

const getSavedCards = () => {
  return JSON.parse(localStorage.getItem('mh-spooky-shuffle-cards')) || [];
};

const saveCard = (card, savedCards) => {
  savedCards[card.id] = card;
  localStorage.setItem('mh-spooky-shuffle-cards', JSON.stringify(savedCards));

  return savedCards;
};

const renderSavedCard = (card) => {
  if (! card) {
    return;
  }

  const cardElement = document.querySelector(`.halloweenMemoryGame-card-container[data-card-id="${card.id}"]`);
  if (! cardElement) {
    return;
  }

  cardElement.classList.remove('mh-spooky-shuffle-card-match');

  const cardFront = cardElement.querySelector('.halloweenMemoryGame-card-front');
  const flipper = cardElement.querySelector('.halloweenMemoryGame-card-flipper');
  if (! cardFront || ! flipper) {
    return;
  }

  cardFront.style.background = 'url(https://www.mousehuntgame.com/images/ui/events/spooky_shuffle/game/shuffle_cards.png) 0 100% no-repeat';
  cardFront.classList.add('mh-spooky-shuffle-card-front');
  if (! card.is_matched) {
    flipper.style.background = `url(${card.thumb}) 5px 0 no-repeat`;
  }

  makeElement('div', ['mh-spooky-shuffle-card-name', `mh-spooky-shuffle-card-name-${card.id}`], card.name, cardElement);
};

const cleanUpCompleteGame = () => {
  localStorage.removeItem('mh-spooky-shuffle-cards');
  const shownCards = document.querySelectorAll('.halloweenMemoryGame-card-flipper');
  if (shownCards) {
    shownCards.forEach((card) => {
      card.style.background = '';
    });
  }

  const cardFronts = document.querySelectorAll('.mh-spooky-shuffle-card-front');
  if (cardFronts) {
    cardFronts.forEach((card) => {
      card.style.background = '';
      card.classList.remove('mh-spooky-shuffle-card-front');
    });
  }
};

const processRequest = (req) => {
  if (! req || ! req.memory_game) {
    return;
  }

  if (req.memory_game.is_complete) {
    cleanUpCompleteGame();
    return;
  }

  // Clear out any existing card names.
  const cardNames = document.querySelectorAll('.mh-spooky-shuffle-card-name');
  if (cardNames.length) {
    cardNames.forEach((cardName) => {
      cardName.remove();
    });
  }

  // Get the saved cards.
  const savedCards = getSavedCards();

  // Merge in all the new cards.
  const revealedCards = req.memory_game.cards.filter((card) => card.is_revealed);
  if (revealedCards.length) {
    revealedCards.forEach((card) => {
      saveCard(card, savedCards);
    });
  }

  // Get the new card.
  const newCard = req.memory_game.cards.filter((card) => card.is_revealed && ! card.is_matched);

  // Render the saved cards.
  getSavedCards().forEach((card) => {
    renderSavedCard(card);
  });

  if (newCard.length) {
    // if the new card's name matches an already revealed card, then we have a match
    const matchingCard = savedCards.filter((card) => (card?.name === newCard[0].name) && (card.id !== newCard[0].id) && ! card.is_matched);
    if (matchingCard.length && matchingCard[0].id !== false) {
      const matchingCardEl = document.querySelector(`.halloweenMemoryGame-card-container[data-card-id="${matchingCard[0].id}"]`);
      if (matchingCardEl) {
        matchingCardEl.classList.add('mh-spooky-shuffle-card-match');
      }
    }
  }
};

export const spookyShuffleTracker = () => {
  addStyles(styles, 'spooky-shuffle-tracker');
  onRequest('events/spooky_shuffle.php', processRequest);
};
