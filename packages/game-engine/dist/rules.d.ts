import { Card, Suit } from './types';
export declare const compareCards: (card1: Card, card2: Card, trumpSuit: Suit | null, leadSuit: Suit) => number;
export declare const resolveTrick: (cards: Card[], trumpSuit: Suit | null) => number;
export declare const calculateTrickPoints: (cards: Card[]) => number;
export declare const isValidMove: (hand: Card[], cardToPlay: Card, leadSuit: Suit | null) => boolean;
