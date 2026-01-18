import { Card } from 'game-engine';
import CardView from '../CardView';
import { motion } from 'framer-motion';

interface HandProps {
  hand: Card[];
  onPlayCard: (card: Card) => void;
  isMyTurn: boolean;
}

export default function Hand({ hand, onPlayCard, isMyTurn }: HandProps) {
  // Sort hand? Logic should be in parent or hook. Assuming passed hand is sorted.

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 flex justify-center items-end pb-8 pointer-events-none z-30">
        <div className="flex justify-center items-end relative w-full max-w-3xl pointer-events-auto h-full">
            {hand.map((card, idx) => {
                const total = hand.length;
                const center = (total - 1) / 2;
                const offset = idx - center;
                const rotate = offset * 5; // Rotation degree
                const y = Math.abs(offset) * 5; // Arc effect

                return (
                    <motion.div
                        key={`${card.suit}-${card.rank}`}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: y, rotate: rotate, opacity: 1 }}
                        className="relative -ml-10 md:-ml-8 first:ml-0 hover:z-50 hover:-translate-y-10 origin-bottom transition-all duration-200"
                        style={{ zIndex: idx }}
                    >
                        <CardView 
                            card={card} 
                            onClick={() => isMyTurn && onPlayCard(card)}
                            className={`shadow-2xl ${isMyTurn ? 'cursor-pointer hover:ring-2 ring-yellow-400' : 'cursor-default brightness-90'}`}
                        />
                    </motion.div>
                );
            })}
        </div>
    </div>
  );
}
