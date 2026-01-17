import { Card, Rank, Suit } from './types';
import { RANKS } from './deck';

const getRankValue = (rank: Rank): number => {
  return RANKS.indexOf(rank);
};

export const compareCards = (
  card1: Card,
  card2: Card,
  trumpSuit: Suit | null,
  leadSuit: Suit
): number => {
  // Returns > 0 if card1 wins, < 0 if card2 wins
  const isC1Trump = card1.suit === trumpSuit;
  const isC2Trump = card2.suit === trumpSuit;

  if (isC1Trump && !isC2Trump) return 1;
  if (!isC1Trump && isC2Trump) return -1;

  if (isC1Trump && isC2Trump) {
    return getRankValue(card1.rank) - getRankValue(card2.rank);
  }

  // Neither is trump (or both not trump logic handled above? no)
  // If neither is trump:
  const isC1Lead = card1.suit === leadSuit;
  const isC2Lead = card2.suit === leadSuit;

  if (isC1Lead && !isC2Lead) return 1;
  if (!isC1Lead && isC2Lead) return -1;

  if (isC1Lead && isC2Lead) {
    return getRankValue(card1.rank) - getRankValue(card2.rank);
  }

  // Neither is trump nor lead? (e.g. discarding off-suit)
  // Usually the lead card wins against off-suit unless off-suit is trump.
  // Logic above handles lead vs non-lead.
  // If both are garbage (shouldn't happen for resolving winner against lead, 
  // but if comparing two garbage cards):
  return getRankValue(card1.rank) - getRankValue(card2.rank);
};

export const resolveTrick = (cards: Card[], trumpSuit: Suit | null): number => {
  // Returns index of the winning card
  if (cards.length === 0) return -1;
  
  const leadSuit = cards[0].suit;
  let winnerIndex = 0;

  for (let i = 1; i < cards.length; i++) {
    const result = compareCards(cards[winnerIndex], cards[i], trumpSuit, leadSuit);
    if (result < 0) {
      winnerIndex = i;
    }
  }
  return winnerIndex;
};

export const calculateTrickPoints = (cards: Card[]): number => {
  return cards.filter(c => c.rank === '10').length;
};

export const isValidMove = (
  hand: Card[],
  cardToPlay: Card,
  leadSuit: Suit | null
): boolean => {
  // If no lead suit (first player), any card is valid
  if (!leadSuit) return true;

  // If card matches lead suit, valid
  if (cardToPlay.suit === leadSuit) return true;

  // If card does NOT match lead suit, player must not have lead suit in hand
  const hasLeadSuit = hand.some(c => c.suit === leadSuit);
  if (hasLeadSuit) return false;

  // Otherwise, valid (can trump or discard)
  return true;
};
