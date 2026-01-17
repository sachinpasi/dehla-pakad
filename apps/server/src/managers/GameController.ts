import { Room, GameState, Suit, Card, shuffleDeck, createDeck, resolveTrick, calculateTrickPoints, isValidMove, sortHand } from 'game-engine';

export class GameController {
  
  startGame(room: Room) {
    if (room.state.players.length !== 4) {
      throw new Error('Need 4 players to start');
    }
    room.state.status = 'DEALING_5';
    room.state.deck = shuffleDeck(createDeck());
    
    // Deal 5 cards to each
    for (const player of room.state.players) {
      player.hand = sortHand(room.state.deck.splice(0, 5));
      player.capturedTenCount = 0;
    }
    
    // Determine bidder (next to dealer). For first game, random or fixed?
    // Let's say dealer is index 0 initially (host).
    // Bidder is (dealer + 1) % 4.
    room.state.bidderIndex = (room.state.dealerIndex + 1) % 4;
    room.state.status = 'TRUMP_SELECTION';
    room.state.currentTurnIndex = room.state.bidderIndex; // Bidder acts first? Rules say bidder chooses trump.
  }

  setTrump(room: Room, suit: Suit) {
    if (room.state.status !== 'TRUMP_SELECTION') {
      throw new Error('Not in trump selection phase');
    }
    room.state.trumpSuit = suit;
    
    // Deal remaining 8 cards
    room.state.status = 'DEALING_8';
    
    // Distribute rest
    // 8 cards * 4 players = 32.
    // Deck should have 52 - 20 = 32 left.
    for (const player of room.state.players) {
      player.hand.push(...room.state.deck.splice(0, 8));
      player.hand = sortHand(player.hand);
    }
    
    room.state.status = 'PLAYING';
    // Turn remains with the person who chose trump? Or the person next to dealer led?
    // Usually Eldest hand (next to dealer) leads.
    room.state.currentTurnIndex = (room.state.dealerIndex + 1) % 4;
  }

  playCard(room: Room, playerId: string, card: Card): { trickCompleted: boolean, winnerId?: string } {
    if (room.state.status !== 'PLAYING') throw new Error('Game not active');
    
    const currentPlayer = room.state.players[room.state.currentTurnIndex];
    if (currentPlayer.id !== playerId) throw new Error('Not your turn');

    // Validate Move
    const leadCard = room.state.playedCards.length > 0 ? room.state.playedCards[0].card : null;
    const leadSuit = leadCard ? leadCard.suit : null;

    if (!isValidMove(currentPlayer.hand, card, leadSuit)) {
      throw new Error('Invalid move');
    }

    // Remove card from hand
    const cardIdx = currentPlayer.hand.findIndex(c => c.suit === card.suit && c.rank === card.rank);
    if (cardIdx === -1) throw new Error('Card not in hand');
    currentPlayer.hand.splice(cardIdx, 1);

    // Add to table
    room.state.playedCards.push({ playerId, card });

    // Advance turn
    room.state.currentTurnIndex = (room.state.currentTurnIndex + 1) % 4;

    // Check if trick complete
    if (room.state.playedCards.length === 4) {
        return this.resolveTrickEnd(room);
    }

    return { trickCompleted: false };
  }

  private resolveTrickEnd(room: Room) {
    const cards = room.state.playedCards.map(p => p.card);
    const winningCardIdx = resolveTrick(cards, room.state.trumpSuit);
    const winnerPlayerId = room.state.playedCards[winningCardIdx].playerId;

    // Calculate points (10s)
    const points = calculateTrickPoints(cards);
    
    // Update winner stats
    const winner = room.state.players.find(p => p.id === winnerPlayerId)!;
    winner.capturedTenCount += points;
    room.state.scores[winnerPlayerId] = winner.capturedTenCount;

    // Clear table logic (delayed?)
    // In server logic, we just clear and set turn. Client handles delay animation.
    room.state.playedCards = []; // Or keep history?
    
    // Set next turn to winner
    const winnerIndex = room.state.players.findIndex(p => p.id === winnerPlayerId);
    room.state.currentTurnIndex = winnerIndex;

    // Check game end
    const cardsRemaining = room.state.players[0].hand.length;
    if (cardsRemaining === 0) {
      room.state.status = 'FINISHED';
    }

    return { trickCompleted: true, winnerId: winnerPlayerId };
  }
}

export const gameController = new GameController();
