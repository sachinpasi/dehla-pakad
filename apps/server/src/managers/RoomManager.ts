import { Room, Player, GameState } from 'game-engine';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  constructor() {}

  generateRoomId(): string {
    // Generate 4-digit random code
    let id = '';
    do {
      id = Math.floor(1000 + Math.random() * 9000).toString();
    } while (this.rooms.has(id));
    return id;
  }

  createRoom(hostPlayer: Player): Room {
    const roomId = this.generateRoomId();
    const newRoom: Room = {
      id: roomId,
      hostId: hostPlayer.id,
      state: {
        roomId,
        players: [hostPlayer],
        deck: [],
        trumpSuit: null,
        currentTurnIndex: 0,
        dealerIndex: 0,
        bidderIndex: -1,
        playedCards: [],
        status: 'WAITING',
        scores: { [hostPlayer.id]: 0 }
      }
    };
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, player: Player): Room {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    // Check if player exists (Reconnection)
    const existingPlayerIndex = room.state.players.findIndex(p => p.id === player.id);
    if (existingPlayerIndex !== -1) {
        // Update socketId
        room.state.players[existingPlayerIndex].socketId = player.socketId;
        // Optionally update name if changed
        room.state.players[existingPlayerIndex].name = player.name;
        
        // Return room immediately
        return room;
    }

    // New Player Checks
    if (room.state.status !== 'WAITING') {
      throw new Error('Game already started');
    }
    if (room.state.players.length >= 4) {
      throw new Error('Room is full');
    }
    
    room.state.players.push(player);
    room.state.scores[player.id] = 0;
    
    return room;
  }

  removePlayer(roomId: string, playerId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.state.players = room.state.players.filter(p => p.id !== playerId);
    if (room.state.players.length === 0) {
      this.rooms.delete(roomId);
    }
  }
}

export const roomManager = new RoomManager();
