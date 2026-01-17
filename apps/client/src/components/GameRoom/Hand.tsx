import { Card } from 'game-engine';
import CardView from '../CardView';

interface HandProps {
  hand: Card[];
  onPlayCard: (card: Card) => void;
  isMyTurn: boolean;
}

export default function Hand({ hand, onPlayCard, isMyTurn }: HandProps) {
  return (
    <div className={`
      fixed bottom-4 left-1/2 -translate-x-1/2 
      flex gap-2 p-4 bg-black/40 rounded-xl backdrop-blur-sm
      transition-opacity ${isMyTurn ? 'opacity-100 ring-2 ring-yellow-400' : 'opacity-80'}
    `}>
      {hand.map((card, idx) => (
        <CardView 
          key={`${card.suit}-${card.rank}-${idx}`} 
          card={card} 
          onClick={() => isMyTurn && onPlayCard(card)}
          className={isMyTurn ? 'hover:-translate-y-4' : 'cursor-not-allowed opacity-80'}
        />
      ))}
    </div>
  );
}
