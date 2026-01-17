"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortHand = exports.shuffleDeck = exports.createDeck = exports.RANKS = exports.SUITS = void 0;
exports.SUITS = ['H', 'D', 'C', 'S'];
exports.RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const createDeck = () => {
    const deck = [];
    for (const suit of exports.SUITS) {
        for (const rank of exports.RANKS) {
            deck.push({ suit, rank });
        }
    }
    return deck;
};
exports.createDeck = createDeck;
// Fischer-Yates Shuffle
const shuffleDeck = (deck) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};
exports.shuffleDeck = shuffleDeck;
const sortHand = (hand) => {
    // Sort by Suit then Rank
    return [...hand].sort((a, b) => {
        if (a.suit !== b.suit) {
            return exports.SUITS.indexOf(a.suit) - exports.SUITS.indexOf(b.suit);
        }
        // High rank first? or Low first? Usually Low to High (2 -> A) or High to Low (A -> 2)
        // Let's do Low (2) to High (A) as per RANKS array order.
        // Actually in game hand, usually A is high.
        // RANKS is ['2'...'A']. So index 0 is 2.
        return exports.RANKS.indexOf(a.rank) - exports.RANKS.indexOf(b.rank);
    });
};
exports.sortHand = sortHand;
