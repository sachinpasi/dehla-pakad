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
  const [isMobile, setIsMobile] = React.useState(false);
  const [selectedCardIdx, setSelectedCardIdx] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCardClick = (card: Card, idx: number) => {
    if (!isMyTurn) return;

    if (isMobile) {
        // Mobile: First tap selects/pops up, Second tap plays
        if (selectedCardIdx === idx) {
            onPlayCard(card);
            setSelectedCardIdx(null);
        } else {
            setSelectedCardIdx(idx);
        }
    } else {
        // Desktop: One click play
        onPlayCard(card);
    }
  };

  // Click outside to deselect
  React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
              setSelectedCardIdx(null);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-48 md:h-64 flex justify-center items-end pb-4 md:pb-8 pointer-events-none z-30">
        <div ref={containerRef} className="relative w-full max-w-5xl h-full flex justify-center items-end pointer-events-auto">
            {hand.map((card, idx) => {
                const total = hand.length;
                const center = (total - 1) / 2;
                const offset = idx - center;

                // Mobile specific tweak: Tight overlap, larger arc
                // If mobile, we clamp the max spread to fit screen
                const spreadFactor = isMobile ? (total > 8 ? 18 : 25) : 30; // Mobile: 18px per card if many, else 25px
                const x = offset * spreadFactor;
                
                const rotate = offset * (isMobile ? 3 : 5);
                const arcY = Math.abs(offset) * (isMobile ? 3 : 5);
                
                const isSelected = selectedCardIdx === idx;
                const finalY = isSelected ? -60 : arcY; // Pop up 60px if selected

                return (
                    <motion.div
                        key={`${card.suit}-${card.rank}`}
                        layout
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ 
                            y: finalY, 
                            x: x, 
                            rotate: rotate, 
                            scale: isSelected ? 1.2 : 1, // Zoom on select
                            zIndex: isSelected ? 50 : idx, // Bring to front
                            opacity: 1 
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="absolute origin-bottom bottom-0"
                        style={{ 
                            left: '50%', // Center everyone, then use x to spread
                            marginLeft: isMobile ? '-32px' : '-48px', // Half of card width to truly center
                        }}
                    >
                        <CardView 
                            card={card} 
                            onClick={() => handleCardClick(card, idx)}
                            className={`
                                shadow-2xl transition-shadow duration-300
                                ${isMyTurn ? 'cursor-pointer' : 'cursor-default brightness-90'}
                                ${isSelected ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]' : ''}
                            `}
                            small={isMobile}
                        />
                    </motion.div>
                );
            })}
        </div>
    </div>
  );
}
