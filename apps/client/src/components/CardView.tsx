import { Card, Suit } from 'game-engine';
import { motion } from 'framer-motion';

const getSuitColor = (suit: Suit) => {
  return (suit === 'H' || suit === 'D') ? 'text-red-600' : 'text-zinc-900';
};

const getSuitIcon = (suit: Suit) => {
  switch(suit) {
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
    case 'S': return '♠';
  }
};

interface CardViewProps {
    card: Card;
    onClick?: () => void;
    className?: string;
    small?: boolean;
}

export default function CardView({ card, onClick, className = '', small }: CardViewProps) {
  const colorClass = getSuitColor(card.suit);
  const icon = getSuitIcon(card.suit);

  return (
    <motion.div 
      layout
      whileHover={onClick ? { y: -10, scale: 1.05 } : {}}
      onClick={onClick}
      className={`
        relative bg-white rounded-lg shadow-xl cursor-pointer select-none
        flex flex-col justify-between p-2 boarder border-gray-200
        ${small ? 'w-12 h-16' : 'w-16 h-24 md:w-24 md:h-36'}
        ${className}
      `}
    >
      {/* Top Left */}
      <div className={`text-left leading-none ${colorClass} ${small ? 'text-xs' : 'text-sm md:text-lg font-bold'}`}>
        <span>{card.rank}</span>
        <div className="block -mt-1">{icon}</div>
      </div>

      {/* Center Big Icon */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 ${colorClass} ${small ? 'text-2xl' : 'text-4xl md:text-6xl'}`}>
         {icon}
      </div>

      {/* Bottom Right (Rotated) */}
      <div className={`text-right leading-none rotate-180 ${colorClass} ${small ? 'text-xs' : 'text-sm md:text-lg font-bold'}`}>
        <span>{card.rank}</span>
        <div className="block -mt-1">{icon}</div>
      </div>
    </motion.div>
  );
}
