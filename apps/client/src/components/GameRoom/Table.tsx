import { Card } from 'game-engine';
import CardView from '../CardView';

interface TableProps {
  playedCards: { playerId: string; card: Card }[];
}

export default function Table({ playedCards }: TableProps) {
  // We can visualize 4 slots for players.
  // But for now, just centering them is fine, maybe slightly offset?
  // Let's keep it simple: A felt circle with cards.

  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full border-[12px] border-amber-900/50 bg-[#0f3b23] shadow-inner flex items-center justify-center">
      {/* Felt Texture Pattern (Optional CSS) */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none rounded-full" />
      
      {/* Logo/Watermark */}
      {playedCards.length === 0 && (
          <div className="text-white/10 font-black text-3xl tracking-widest pointer-events-none select-none -rotate-12 font-serif">
              ROYAL TENS
          </div>
      )}

      {/* Cards */}
      {playedCards.map((pc, idx) => (
        <div 
            key={idx} 
            className="absolute transition-all duration-500"
            style={{ 
                // Simple positioning based on index isn't enough cause we don't know "who" sat where relative to us.
                // But typically: 0=Me, 1=Right, 2=Top, 3=Left.
                // However, playedCards is random order of play.
                // Ideally, we map by playerId relative to "myself".
                // For MVP, just scatter or stacking is okay, but let's try a slight offset fan.
                transform: `rotate(${idx * 10 - (playedCards.length-1)*5}deg) translateY(-20px)`,
                zIndex: idx
            }}
        >
           <CardView card={pc.card} className="shadow-2xl" />
        </div>
      ))}
    </div>
  ); 
}
