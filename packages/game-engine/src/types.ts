export type Suit = 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  hand: Card[];
  capturedTenCount: number; // Score
  teamId?: number; // 0 or 1 (if 2v2) or just individual
}

export type GameStatus = 
  | 'WAITING' 
  | 'DEALING_5' 
  | 'TRUMP_SELECTION' 
  | 'DEALING_8' 
  | 'PLAYING' 
  | 'FINISHED';

export interface GameState {
  roomId: string;
  players: Player[];
  deck: Card[];
  trumpSuit: Suit | null;
  currentTurnIndex: number; 
  dealerIndex: number;
  bidderIndex: number; // Who chooses trump
  playedCards: { playerId: string; card: Card }[]; // Current trick
  status: GameStatus;
  scores: Record<string, number>; // playerId -> score
}

export interface Room {
  id: string;
  state: GameState;
  hostId: string;
}
