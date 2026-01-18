'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Player, Suit } from 'game-engine';
import toast from 'react-hot-toast';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  gameState: GameState | null;
  playerId: string | null;
  joinRoom: (roomId: string, playerName: string) => Promise<void>;
  createRoom: (playerName: string) => Promise<void>;
  leaveRoom: () => void;
  restartGame: () => void;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
  gameState: null,
  playerId: null,
  joinRoom: async () => {},
  createRoom: async () => {},
  leaveRoom: () => {},
  restartGame: () => {},
});

export const useSocket = () => useContext(SocketContext);

// Default to localhost if not set, but allow env var for production
const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket] = useState<Socket>(() => io(SOCKET_URL, {
    transports: ['websocket'],
    autoConnect: true,
  }));
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
        let storedId = localStorage.getItem('royal_tens_uid');
        if (!storedId) {
            storedId = crypto.randomUUID();
            localStorage.setItem('royal_tens_uid', storedId);
        }
        return storedId;
    }
    return null;
  });

  useEffect(() => {
    const socketInstance = socket;

    socketInstance.on('connect', () => {
      console.log('Connected to server:', socketInstance.id);
      setIsConnected(true);
      // We don't overwrite playerId with socket.id anymore
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // ... (rest of events same)
    
    // Game Events
    socketInstance.on('player_joined', ({ player }: { player: Player }) => {
        console.log('Player Joined:', player);
        toast.success(`${player.name} joined the game!`);
        setGameState(prev => {
            if (!prev) return null;
            // Handle Reconnect: If player already exists, update them, don't duplicate
            const exists = prev.players.find(p => p.id === player.id);
            if (exists) {
                return {
                    ...prev,
                    players: prev.players.map(p => p.id === player.id ? player : p)
                };
            }
            return {
                ...prev,
                players: [...prev.players, player],
                scores: { ...prev.scores, [player.id]: 0 }
            };
        });
    });

    socketInstance.on('game_started', (state: GameState) => {
        toast.success('Game Started! Good luck!');
        setGameState(state);
    });

    socketInstance.on('trump_set', ({ suit, state }: { suit: Suit, state: GameState }) => {
        console.log('Trump set:', suit);
        const suitSymbol = suit === 'H' ? '♥' : suit === 'D' ? '♦' : suit === 'C' ? '♣' : '♠';
        toast(`Trump set to ${suitSymbol}`, { icon: '🎺' });
        setGameState(state);
    });

    socketInstance.on('card_played', ({ state }: { state: GameState }) => {
        setGameState(state);
    });

    socketInstance.on('trick_end', ({ state, winnerId }: { state: GameState, winnerId?: string }) => {
        if (winnerId) {
            const winner = state.players.find(p => p.id === winnerId);
            if (winner) toast.success(`${winner.name} won the trick!`);
        }
        setGameState(state);
    });

    socketInstance.on('game_over', ({ scores }: { scores: Record<string, number> }) => {
       toast.error('Game Over!', { duration: 5000 });
       setGameState(prev => prev ? { ...prev, status: 'FINISHED', scores } : null);
    });

    socketInstance.on('error_message', (msg: string) => {
        toast.error(msg);
    });

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('player_joined');
      socketInstance.off('game_started');
      socketInstance.off('trump_set');
      socketInstance.off('card_played');
      socketInstance.off('trick_end');
      socketInstance.off('game_over');
      socketInstance.off('error_message');
      socketInstance.disconnect();
    };
  }, [socket]);

  const createRoom = (playerName: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!socket || !playerId) return reject('No socket or User ID');
      socket.emit('create_room', { playerName, userId: playerId }, (res: { success: boolean, state: GameState, error?: string }) => {
        if (res.success) {
          setGameState(res.state);
          resolve();
        } else {
          reject(res.error);
        }
      });
    });
  };

  const joinRoom = (roomId: string, playerName: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!socket || !playerId) return reject('No socket or User ID');
      socket.emit('join_room', { roomId, playerName, userId: playerId }, (res: { success: boolean, state: GameState, error?: string }) => {
        if (res.success) {
          setGameState(res.state);
          resolve();
        } else {
          reject(res.error);
        }
      });
    });
  };

  const leaveRoom = () => {
      // socket?.disconnect();
      // location.reload(); // Simple way to clear state
      setGameState(null);
  };

  const restartGame = () => {
    if (!socket || !gameState) return;
    socket.emit('restart_game', { roomId: gameState.roomId });
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      gameState,
      playerId,
      joinRoom,
      createRoom,
      leaveRoom,
      restartGame
    }}>
      {children}
    </SocketContext.Provider>
  );
};
