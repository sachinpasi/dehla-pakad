'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Player, Suit } from 'game-engine';

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  gameState: GameState | null;
  playerId: string | null;
  joinRoom: (roomId: string, playerName: string) => Promise<void>;
  createRoom: (playerName: string) => Promise<void>;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextProps>({
  socket: null,
  isConnected: false,
  gameState: null,
  playerId: null,
  joinRoom: async () => {},
  createRoom: async () => {},
  leaveRoom: () => {},
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
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = socket;

    socketInstance.on('connect', () => {
      console.log('Connected to server:', socketInstance.id);
      setIsConnected(true);
      setPlayerId(socketInstance.id || null);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Game Events
    socketInstance.on('player_joined', ({ player }: { player: Player }) => {
        console.log('Player Joined:', player);
        setGameState(prev => {
            if (!prev) return null;
            return {
                ...prev,
                players: [...prev.players, player],
                scores: { ...prev.scores, [player.id]: 0 }
            };
        });
    });

    socketInstance.on('game_started', (state: GameState) => {
        setGameState(state);
    });

    socketInstance.on('trump_set', ({ suit, state }: { suit: Suit, state: GameState }) => {
        console.log('Trump set:', suit); 
        setGameState(state);
    });

    socketInstance.on('card_played', ({ state }: { state: GameState }) => {
        setGameState(state);
    });

    socketInstance.on('trick_end', ({ state }: { state: GameState }) => {
        setGameState(state);
    });

    socketInstance.on('game_over', ({ scores }: { scores: Record<string, number> }) => {
       alert(`Game Over! Scores: ${JSON.stringify(scores)}`);
       setGameState(prev => prev ? { ...prev, status: 'FINISHED', scores } : null);
    });

    socketInstance.on('error_message', (msg: string) => {
        alert('Error: ' + msg);
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
      if (!socket) return reject('No socket');
      socket.emit('create_room', { playerName }, (res: { success: boolean, state: GameState, error?: string }) => {
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
      if (!socket) return reject('No socket');
      socket.emit('join_room', { roomId, playerName }, (res: { success: boolean, state: GameState, error?: string }) => {
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

  return (
    <SocketContext.Provider value={{ socket, isConnected, gameState, playerId, createRoom, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};
