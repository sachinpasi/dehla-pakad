'use client';
import { useSocket } from '@/context/SocketContext';
import { Card, Suit } from 'game-engine';
import Hand from './GameRoom/Hand';
import Table from './GameRoom/Table';

export default function GameBoard() {
  const { socket, gameState, playerId } = useSocket();

  if (!gameState || !playerId) return <div>Loading...</div>;

  const myPlayer = gameState.players.find(p => p.id === playerId);
  const isHost = gameState.players[0].id === playerId;
  const isMyTurn = gameState.players[gameState.currentTurnIndex].id === playerId;
  const isBidder = gameState.players[gameState.bidderIndex]?.id === playerId;

  const handleStartGame = () => {
    socket?.emit('start_game', { roomId: gameState.roomId });
  };

  const handleSetTrump = (suit: Suit) => {
    socket?.emit('set_trump', { roomId: gameState.roomId, suit });
  };

  const handlePlayCard = (card: Card) => {
    socket?.emit('play_card', { roomId: gameState.roomId, card });
  };

  return (
    <div className="relative min-h-screen bg-green-800 flex flex-col items-center p-4 overflow-hidden">
      
      {/* HEADER */}
      <div className="absolute top-4 left-4 text-white">
        <h2 className="font-bold">Room: {gameState.roomId}</h2>
        <p>Your ID: {playerId.slice(0, 5)}</p>
        <p>Trump: {gameState.trumpSuit || '?'}</p>
        {gameState.trumpSuit && (
            <span className={`text-2xl ${['H','D'].includes(gameState.trumpSuit) ? 'text-red-500' : 'text-black'}`}>
                {gameState.trumpSuit === 'H' ? '♥' : gameState.trumpSuit === 'D' ? '♦' : gameState.trumpSuit === 'C' ? '♣' : '♠'}
            </span>
        )}
      </div>

      <div className="absolute top-4 right-4 text-white text-right">
        <h3 className="font-bold border-b pb-1 mb-2">Scores (10s captured)</h3>
        {gameState.players.map(p => (
          <div key={p.id} className={p.id === playerId ? 'text-yellow-300 font-bold' : ''}>
            {p.name}: {p.capturedTenCount}
          </div>
        ))}
      </div>

      {/* GAME AREA */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-4xl">
        
        {/* STATUS MSG */}
        <div className="text-center mb-8">
           <div className="bg-black/50 text-white rounded-full px-6 py-2 inline-block backdrop-blur">
             {gameState.status === 'WAITING' && `Waiting for players (${gameState.players.length}/4)...`}
             {gameState.status === 'DEALING_5' && 'Distributing first 5 cards...'}
             {gameState.status === 'TRUMP_SELECTION' && (
                isBidder ? 'Choose Trump!' : `Waiting for ${gameState.players[gameState.bidderIndex]?.name} to choose Trump`
             )}
             {gameState.status === 'DEALING_8' && 'Dealing remaining cards...'}
             {gameState.status === 'PLAYING' && (
                isMyTurn ? <span className="text-yellow-400 font-bold animate-pulse">YOUR TURN</span> : `Turn: ${gameState.players[gameState.currentTurnIndex]?.name}`
             )}
             {gameState.status === 'FINISHED' && 'GAME OVER'}
           </div>
        </div>

        {/* CONTROLS */}
        {gameState.status === 'WAITING' && isHost && gameState.players.length === 4 && (
            <button onClick={handleStartGame} className="mx-auto block bg-yellow-500 px-8 py-3 rounded font-bold hover:scale-105 transition shadow-lg">
                START GAME
            </button>
        )}
        
        {gameState.status === 'WAITING' && gameState.players.length < 4 && (
             <p className="text-white/50 text-center text-sm mt-2">Waiting for more players to join...</p>
        )}

        {/* TRUMP SELECTION */}
        {gameState.status === 'TRUMP_SELECTION' && isBidder && (
            <div className="flex gap-4 justify-center">
                {(['S', 'H', 'C', 'D'] as Suit[]).map(suit => (
                    <button 
                      key={suit}
                      onClick={() => handleSetTrump(suit)}
                      className="w-16 h-16 bg-white rounded-full text-3xl shadow hover:scale-110 transition flex items-center justify-center"
                    >
                        <span className={['H','D'].includes(suit) ? 'text-red-500' : 'text-black'}>
                             {suit === 'H' ? '♥' : suit === 'D' ? '♦' : suit === 'C' ? '♣' : '♠'}
                        </span>
                    </button>
                ))}
            </div>
        )}

        {/* TABLE */}
        <Table playedCards={gameState.playedCards} />

      </div>

      {/* HAND */}
      {myPlayer && (
        <Hand 
          hand={myPlayer.hand} 
          onPlayCard={handlePlayCard} 
          isMyTurn={isMyTurn && gameState.status === 'PLAYING'}
        />
      )}

    </div>
  );
}
