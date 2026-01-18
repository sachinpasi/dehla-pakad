import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { roomManager } from './managers/RoomManager';
import { gameController } from './managers/GameController';
import { Player, Suit, Card } from 'game-engine';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for dev
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // LOBBY EVENTS
  socket.on('create_room', ({ playerName }: { playerName: string }, callback) => {
    try {
      const player: Player = {
        id: socket.id, // Using socketID as playerID for simplicity in MVP
        name: playerName,
        socketId: socket.id,
        hand: [],
        capturedTenCount: 0
      };
      const room = roomManager.createRoom(player);
      socket.join(room.id);
      callback({ success: true, roomId: room.id, state: room.state });
    } catch (e: any) {
      callback({ success: false, error: e.message });
    }
  });

  socket.on('join_room', ({ roomId, playerName }: { roomId: string, playerName: string }, callback) => {
    try {
      const player: Player = {
        id: socket.id,
        name: playerName,
        socketId: socket.id,
        hand: [],
        capturedTenCount: 0
      };
      const room = roomManager.joinRoom(roomId, player);
      socket.join(roomId);
      
      // Notify others
      socket.to(roomId).emit('player_joined', { player });
      
      callback({ success: true, state: room.state });
    } catch (e: any) {
      callback({ success: false, error: e.message });
    }
  });

  // GAME EVENTS
  socket.on('start_game', ({ roomId }: { roomId: string }) => {
    const room = roomManager.getRoom(roomId);
    if (room && room.hostId === socket.id) {
        try {
            gameController.startGame(room);
            io.to(roomId).emit('game_started', room.state);
        } catch (e) {
            console.error(e);
        }
    }
  });

  socket.on('set_trump', ({ roomId, suit }: { roomId: string, suit: Suit }) => {
      const room = roomManager.getRoom(roomId);
      if (room) {
          try {
              gameController.setTrump(room, suit);
              io.to(roomId).emit('trump_set', { suit, state: room.state });
          } catch(e) {
              socket.emit('error', e); // Simple error handling
          }
      }
  });

  socket.on('play_card', ({ roomId, card }: { roomId: string, card: Card }) => {
      const room = roomManager.getRoom(roomId);
      if (room) {
          try {
              const result = gameController.playCard(room, socket.id, card);
              io.to(roomId).emit('card_played', { playerId: socket.id, card, state: room.state });
              
              if (result.trickCompleted) {
                  // Delay clearing table for UX? Or just send event.
                  // Sending update_scores and trick_end
                  setTimeout(() => {
                      if (room.state.status === 'FINISHED') {
                        io.to(roomId).emit('game_over', { scores: room.state.scores });
                      } else {
                        io.to(roomId).emit('trick_end', { winnerId: result.winnerId, state: room.state });
                      }
                  }, 1000); // 1s delay
              }
          } catch (e: any) {
              socket.emit('error_message', e.message);
          }
      }
  });

  socket.on('restart_game', ({ roomId }) => {
    try {
      const room = roomManager.getRoom(roomId);
      if (!room) return;
      if (room.hostId !== socket.id) {
          socket.emit('error_message', 'Only host can restart game');
          return; 
      }
      
      gameController.restartGame(room);
      io.to(roomId).emit('game_started', room.state);
    } catch (e: any) {
      socket.emit('error_message', e.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Handle player drop?
    // roomManager.removePlayer(socket.id)... complex validation needed
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
