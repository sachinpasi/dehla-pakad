'use client';
import { useSocket } from '@/context/SocketContext';
import { useVoice } from '@/context/VoiceContext';
import { Card, Suit } from 'game-engine';
import Hand from './GameRoom/Hand';
import Table from './GameRoom/Table';
import PlayerAvatar from './GameRoom/PlayerAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, LogOut, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GameBoard() {
  const { socket, gameState, playerId, restartGame, leaveRoom } = useSocket();
  const { joinVoice, leaveVoice, toggleMute, isMuted, isVoiceConnected, isSpeakerMuted, toggleSpeaker } = useVoice();

  if (!gameState || !playerId) return (
      <div className="flex h-screen items-center justify-center text-white bg-casino-green">
          <div className="animate-pulse">Loading Game State...</div>
      </div>
  );

  const myIndex = gameState.players.findIndex(p => p.id === playerId);
  const myPlayer = gameState.players[myIndex];
  const isHost = gameState.players[0].id === playerId;
  // const isMyTurn = gameState.players[gameState.currentTurnIndex].id === playerId; // unused
  // But wait, Hand needs isMyTurn.
  const isMyTurn = gameState.players[gameState.currentTurnIndex]?.id === playerId;

  const handleStartGame = () => {
    if (gameState.players.length < 4) {
        toast.error("Waiting for 4 players!");
        return;
    }
    socket?.emit('start_game', { roomId: gameState.roomId });
  };

  const handleSetTrump = (suit: Suit) => {
    socket?.emit('set_trump', { roomId: gameState.roomId, suit });
  };

  const handlePlayCard = (card: Card) => {
    socket?.emit('play_card', { roomId: gameState.roomId, card });
  };

  // Helper to get relative position
  const getPosition = (index: number) => {
     const offset = (index - myIndex + 4) % 4;
     if (offset === 0) return 'bottom';
     if (offset === 1) return 'right';
     if (offset === 2) return 'top';
     if (offset === 3) return 'left'; 
     return 'bottom';
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center overflow-hidden bg-[radial-gradient(circle_at_center,_#0f4025_0%,_#051f11_100%)]">
      
      {/* --- HEADER: Stats & Controls --- */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-50 pointer-events-none">
         {/* Left: Room Info */}
         <div className="glass-panel px-4 py-2 rounded-xl flex flex-col gap-1 pointer-events-auto">
             <div className="flex items-center gap-2 text-xs text-white/50 font-bold tracking-widest uppercase">
                 Room ID
             </div>
             <div className="text-xl font-mono font-bold text-white tracking-wider">
                 {gameState.roomId}
             </div>
         </div>

         {/* Center: Trump Status */}
         <div className="glass-panel px-6 py-2 rounded-b-2xl -mt-4 flex flex-col items-center pointer-events-auto shadow-lg border-t-0">
             <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Trump Suit</span>
             {gameState.trumpSuit ? (
                 <div className={`text-4xl ${['H','D'].includes(gameState.trumpSuit) ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`}>
                     {gameState.trumpSuit === 'H' ? '♥' : gameState.trumpSuit === 'D' ? '♦' : gameState.trumpSuit === 'C' ? '♣' : '♠'}
                 </div>
             ) : (
                 <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" />
             )}
         </div>

         {/* Right: Voice & Menu */}
         <div className="flex gap-2 pointer-events-auto">
             {!isVoiceConnected ? (
                 <button onClick={joinVoice} className="glass-button w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-green-500/20" title="Join Voice">
                     <MicOff size={18} />
                 </button>
             ) : (
                 <>
                    {/* Speaker Toggle */}
                    <button onClick={toggleSpeaker} className={`glass-button w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSpeakerMuted ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`} title="Toggle Speaker">
                        {isSpeakerMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    {/* Mic Toggle */}
                    <button onClick={toggleMute} className={`glass-button w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`} title="Mute Mic">
                        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    
                    <button onClick={leaveVoice} className="glass-button w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-red-400 hover:bg-red-500/10" title="Leave Voice">
                        <LogOut size={18} />
                    </button>
                 </>
             )}
             <button onClick={leaveRoom} className="glass-button px-3 py-1 rounded-lg text-xs font-bold text-red-300 border-red-500/20 hover:bg-red-500/10">
                 EXIT
             </button>
         </div>
      </div>

      {/* --- STATUS BAR --- */}
      <div className="absolute top-16 md:top-24 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {gameState.status !== 'PLAYING' && (
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="glass-panel px-4 py-1 md:px-6 md:py-2 rounded-full flex items-center gap-2 backdrop-blur-xl border-casino-gold/30 shadow-lg text-white text-xs md:text-base"
                >
                    {gameState.status === 'WAITING' && (
                        <span className="flex items-center gap-2 text-yellow-200 font-medium">
                            <span className="animate-pulse">●</span> Waiting for players...
                        </span>
                    )}
                    {gameState.status === 'DEALING_5' && (
                        <span className="text-casino-gold font-bold">Dealing First 5 Cards...</span>
                    )}
                    {gameState.status === 'TRUMP_SELECTION' && (
                         <span className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                             Wait for 
                             <span className="font-bold text-yellow-400">
                                {gameState.players[gameState.bidderIndex]?.id === playerId ? 'YOU' : gameState.players[gameState.bidderIndex]?.name}
                             </span> 
                             to choose Trump
                         </span>
                    )}
                    {gameState.status === 'DEALING_8' && (
                        <span className="text-casino-gold font-bold">Dealing Final 8 Cards...</span>
                    )}
                </motion.div>
            )}
            
            {/* Turn Indicator for Playing State */}
            {gameState.status === 'PLAYING' && (
                 <motion.div 
                    key="turn"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="glass-panel px-8 py-3 rounded-full flex items-center gap-3 backdrop-blur-xl border-white/20 shadow-xl"
                 >
                     <span className="text-white/60 text-sm font-bold uppercase tracking-wider">Current Turn</span>
                     <div className="w-px h-4 bg-white/20" />
                     <span className={`font-bold text-lg ${isMyTurn ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>
                        {isMyTurn ? "IT'S YOUR TURN" : gameState.players[gameState.currentTurnIndex]?.name}
                     </span>
                 </motion.div>
            )}
          </AnimatePresence>
      </div>


      {/* --- PLAY AREA --- */}
      <div className="flex-1 w-full max-w-6xl relative flex items-center justify-center">
         
         {/* Center Table */}
         <div className="relative z-10 scale-75 md:scale-100 transition-transform origin-center">
             <Table playedCards={gameState.playedCards} />
         </div>

         {/* Players Positioning */}
         {gameState.players.map((player, idx) => {
             const pos = getPosition(idx);
             if (pos === 'bottom') return null; // We render HUD for me

             return (
                 <div 
                    key={player.id} 
                    className={`absolute transition-all duration-500
                        ${pos === 'top' ? 'top-28 md:top-10 left-1/2 -translate-x-1/2' : ''}
                        ${pos === 'left' ? 'left-2 top-1/3 -translate-y-1/2 md:left-8 md:top-1/2' : ''}
                        ${pos === 'right' ? 'right-2 top-1/3 -translate-y-1/2 md:right-8 md:top-1/2' : ''}
                    `}
                 >
                     <div className="scale-75 md:scale-100 origin-center transition-transform">
                        <PlayerAvatar 
                            player={player} 
                            isTurn={gameState.currentTurnIndex === idx} 
                            position={pos}
                            isDealer={gameState.dealerIndex === idx}
                        />
                     </div>
                 </div>
             );
         })}

         {/* My turn indicator (Center Bottom above hand) */}
         {isMyTurn && (
             <div className="absolute bottom-48 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                 <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 px-6 py-1 rounded-full text-sm font-bold animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.3)] backdrop-blur-sm">
                     YOUR TURN
                 </div>
             </div>
         )}

         {/* Waiting State */}
         {gameState.status === 'WAITING' && (
             <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm">
                 <motion.div 
                    initial={{ scale: 0.9 }} 
                    animate={{ scale: 1 }} 
                    className="glass-panel p-8 rounded-2xl flex flex-col items-center"
                 >
                     <div className="text-4xl mb-4">⏳</div>
                     <h2 className="text-2xl font-bold text-white mb-2">Waiting for Players</h2>
                     <div className="flex gap-2 text-white/60 mb-6">
                         <span>{gameState.players.length} / 4 Joined</span>
                     </div>
                     {isHost && gameState.players.length === 4 && (
                         <button onClick={handleStartGame} className="bg-gradient-to-r from-casino-gold to-yellow-600 text-black px-8 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition">
                             START MATCH
                         </button>
                     )}
                 </motion.div>
             </div>
         )}
      </div>


      {/* --- HAND --- */}
      {myPlayer && (
        <Hand 
          hand={myPlayer.hand} 
          onPlayCard={handlePlayCard} 
          isMyTurn={isMyTurn && gameState.status === 'PLAYING'}
        />
      )}


      {/* --- OVERLAYS --- */}
      
      {/* Trump Selection */}
      <AnimatePresence>
        {gameState.status === 'TRUMP_SELECTION' && (gameState.players[gameState.bidderIndex]?.id === playerId) && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur"
            >
                <div className="glass-panel p-8 rounded-3xl text-center border-casino-gold/30 shadow-[0_0_50px_rgba(251,191,36,0.1)]">
                    <h2 className="text-3xl font-bold text-white mb-2">Choose Trump Suit</h2>
                    <p className="text-white/50 mb-8">Select the suit that will dominate this round.</p>
                    <div className="flex gap-6">
                        {(['S', 'H', 'C', 'D'] as Suit[]).map(suit => (
                            <button 
                                key={suit}
                                onClick={() => handleSetTrump(suit)}
                                className="w-24 h-24 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-6xl shadow-xl transition-all hover:scale-110 hover:shadow-2xl border border-white/5 group"
                            >
                                <span className={`${['H','D'].includes(suit) ? 'text-red-500 drop-shadow-lg' : 'text-white drop-shadow-lg'} group-hover:scale-110 transition-transform`}>
                                    {suit === 'H' ? '♥' : suit === 'D' ? '♦' : suit === 'C' ? '♣' : '♠'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
          {gameState.status === 'FINISHED' && (
              <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                 className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md"
              >
                  <div className="glass-panel p-10 rounded-3xl text-center max-w-lg w-full border-casino-gold/50 shadow-2xl">
                       <h2 className="text-5xl font-black text-casino-gold mb-8 drop-shadow-lg tracking-tight">GAME OVER</h2>
                       
                       <div className="space-y-3 mb-8">
                           <h3 className="text-white/50 text-sm uppercase tracking-widest font-bold border-b border-white/10 pb-2 mb-4">Final Scoreboard</h3>
                           {Object.entries(gameState.scores || {}).map(([pid, score]) => {
                               const p = gameState.players.find(pl => pl.id === pid);
                               return (
                                   <div key={pid} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                       <span className="text-lg text-white font-medium">{p?.name || 'Unknown'}</span>
                                       <span className="text-2xl font-bold text-casino-gold">{score}</span>
                                   </div>
                               );
                           })}
                       </div>

                       {isHost && (
                           <button onClick={restartGame} className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/20 hover:scale-[1.02] transition-all">
                               PLAY NEXT HAND
                           </button>
                       )}
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

    </div>
  );
}
