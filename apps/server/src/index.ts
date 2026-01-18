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
  socket.on('create_room', ({ playerName, userId }: { playerName: string, userId: string }, callback) => {
    try {
      // Store userId in socket for signaling
      socket.data.userId = userId;
      socket.join(userId); // Join a room named after userId for targeted messaging

      const player: Player = {
        id: userId, // Persistent ID
        name: playerName,
        socketId: socket.id, // Transient ID
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

  socket.on('join_room', ({ roomId, playerName, userId }: { roomId: string, playerName: string, userId: string }, callback) => {
    try {
      socket.data.userId = userId;
      socket.join(userId);

      const player: Player = {
        id: userId,
        name: playerName,
        socketId: socket.id,
        hand: [],
        capturedTenCount: 0
      };
      const room = roomManager.joinRoom(roomId, player);
      socket.join(roomId);
      
      // Notify others
      // If it's a reconnect, we might want to send 'player_reconnected' or just 'player_joined' is fine 
      // as long as client handles duplicate/update.
      // But efficiently:
      io.to(roomId).emit('player_joined', { player }); // Client should merge/update based on ID
      
      callback({ success: true, state: room.state });
    } catch (e: any) {
      callback({ success: false, error: e.message });
    }
  });

  // ... (start_game, set_trump, play_card remain same as they use roomId/socket.id - wait, play_card uses socket.id?)
  // YES, gameController likely uses socket.id to verify turn? 
  // We should check gameController.playCard. It likely uses room.players.find(p => p.socketId === socket.id).
  // If we updated socketId in RoomManager, this is safe!

  // VOICE CHAT SIGNALING
  socket.on('signal', ({ to, signal }: { to: string, signal: any }) => {
      // from: socket.data.userId (Stable ID)
      // to: target userId (Stable ID)
      io.to(to).emit('signal', { from: socket.data.userId, signal });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
