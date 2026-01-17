import { Card } from 'game-engine';
import CardView from '../CardView';

interface TableProps {
  playedCards: { playerId: string; card: Card }[];
}

export default function Table({ playedCards }: TableProps) {
  return (
    <div className="flex items-center justify-center gap-4 h-64 border-2 border-white/10 rounded-full bg-green-900/50 p-8">
      {playedCards.length === 0 && <p className="text-white/30 text-sm">Waiting for cards...</p>}
      {playedCards.map((pc, idx) => (
        <div key={idx} className="flex flex-col items-center animate-fade-in-up">
           <CardView card={pc.card} />
           {/* <span className="text-xs text-white mt-2">{pc.playerId.slice(0, 4)}</span> */}
        </div>
      ))}
    </div>
  ); 
}
