import { Card, Suit } from 'game-engine';

const getSuitColor = (suit: Suit) => {
  return (suit === 'H' || suit === 'D') ? 'text-red-500' : 'text-black';
};

const getSuitIcon = (suit: Suit) => {
  switch(suit) {
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
    case 'S': return '♠';
  }
};

export default function CardView({ card, onClick, className = '' }: { card: Card, onClick?: () => void, className?: string }) {
  return (
    <div 
      onClick={onClick}
      className={`
        w-16 h-24 bg-white rounded-lg shadow-md border border-gray-300 
        flex flex-col items-center justify-center cursor-pointer 
        hover:-translate-y-2 transition select-none
        ${className}
      `}
    >
      <div className={`text-2xl ${getSuitColor(card.suit)}`}>
        {getSuitIcon(card.suit)}
      </div>
      <div className={`font-bold ${getSuitColor(card.suit)}`}>
        {card.rank}
      </div>
    </div>
  );
}
