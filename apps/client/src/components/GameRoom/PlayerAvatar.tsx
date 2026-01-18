import { Player } from 'game-engine';
import { motion } from 'framer-motion';
import { User, Clock } from 'lucide-react';
import { memo } from 'react';

interface PlayerAvatarProps {
  player: Player;
  isTurn: boolean;
  position: 'bottom' | 'top' | 'left' | 'right';
  isDealer?: boolean;
}

const PlayerAvatar = memo(({ player, isTurn, position, isDealer }: PlayerAvatarProps) => {
  return (
    <div className={`flex flex-col items-center gap-2 relative ${isTurn ? 'z-20' : 'z-10'}`}>
      
      {/* Avatar Circle */}
      <motion.div 
        animate={{ 
            scale: isTurn ? 1.1 : 1,
            boxShadow: isTurn ? "0 0 20px #fbbf24" : "0 0 0px transparent"
        }}
        className={`
            w-16 h-16 rounded-full bg-black/60 border-2 
            flex items-center justify-center relative
            backdrop-blur-md transition-all
            ${isTurn ? 'border-casino-gold' : 'border-white/20'}
        `}
      >
        <User className={isTurn ? 'text-casino-gold' : 'text-white/50'} />
        
        {/* Dealer Badge */}
        {isDealer && (
            <div className="absolute -top-1 -right-1 bg-casino-gold text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg border border-white/20">
                D
            </div>
        )}
      </motion.div>

      {/* Name Tag */}
      <div className={`
        bg-black/60 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10
        flex items-center gap-2 shadow-lg absolute whitespace-nowrap
        ${position === 'top' ? '-bottom-8' : ''}
        ${position === 'bottom' ? '-top-8' : ''}
        ${position === 'left' ? '-right-24' : ''}
        ${position === 'right' ? '-left-24' : ''}
      `}>
         {isTurn && <Clock size={12} className="text-casino-gold animate-pulse" />}
         {player.name}
         {/* Score Badge */}
         <span className="text-casino-gold ml-1">
            {player.capturedTenCount > 0 && `(${player.capturedTenCount})`}
         </span>
      </div>

    </div>
  );
});

PlayerAvatar.displayName = 'PlayerAvatar';
export default PlayerAvatar;
