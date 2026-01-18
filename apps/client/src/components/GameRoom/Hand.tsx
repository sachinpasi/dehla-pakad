import React from 'react';
import { Card } from 'game-engine';
import CardView from '../CardView';
import { motion } from 'framer-motion';

interface HandProps {
  hand: Card[];
  onPlayCard: (card: Card) => void;
  isMyTurn: boolean;
}

export default function Hand({ hand, onPlayCard, isMyTurn }: HandProps) {
  // Simple check for mobile logic to disable arc
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 flex md:justify-center items-end pb-4 md:pb-8 pointer-events-none z-30">
        {/* Mobile: Scrollable Container / Desktop: Centered Container */}
        <div className={`
            flex items-end relative w-full md:max-w-3xl pointer-events-auto h-full px-4
            ${isMobile ? 'overflow-x-auto justify-start no-scrollbar pl-4 pr-12' : 'justify-center overflow-visible'}
        `}>
            {hand.map((card, idx) => {
                const total = hand.length;
                const center = (total - 1) / 2;
                const offset = idx - center;
                
                // Desktop Arc Calculations
                const rotate = isMobile ? 0 : offset * 5; 
                const y = isMobile ? 0 : Math.abs(offset) * 5; 

                return (
                    <motion.div
                        key={`${card.suit}-${card.rank}`}
                        layout
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: y, rotate: rotate, opacity: 1 }}
                        className={`
                            relative origin-bottom transition-all duration-200 shrink-0
                            ${isMobile ? '-ml-8 first:ml-0 mb-4' : '-ml-8 first:ml-0 hover:z-50 hover:-translate-y-10'}
                        `}
                        style={{ zIndex: idx }}
                    >
                        <CardView 
                            card={card} 
                            onClick={() => isMyTurn && onPlayCard(card)}
                            className={`shadow-2xl ${isMyTurn ? 'cursor-pointer hover:ring-2 ring-yellow-400' : 'cursor-default brightness-90'}`}
                            small={isMobile} // Ensure we use the smaller card size on mobile
                        />
                    </motion.div>
                );
            })}
        </div>
    </div>
  );
}
