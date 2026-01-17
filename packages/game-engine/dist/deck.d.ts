import { Card, Rank, Suit } from './types';
export declare const SUITS: Suit[];
export declare const RANKS: Rank[];
export declare const createDeck: () => Card[];
export declare const shuffleDeck: (deck: Card[]) => Card[];
export declare const sortHand: (hand: Card[]) => Card[];
