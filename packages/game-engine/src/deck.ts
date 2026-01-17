import { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

// Fischer-Yates Shuffle
export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const sortHand = (hand: Card[]): Card[] => {
  // Sort by Suit then Rank
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    }
    // High rank first? or Low first? Usually Low to High (2 -> A) or High to Low (A -> 2)
    // Let's do Low (2) to High (A) as per RANKS array order.
    // Actually in game hand, usually A is high.
    // RANKS is ['2'...'A']. So index 0 is 2.
    return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
  });
};
