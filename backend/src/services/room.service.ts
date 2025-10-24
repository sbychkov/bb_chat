import { Room, User } from '../types';

class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(roomId: string): Room {
    const room: Room = {
      id: roomId,
      users: new Map(),
      createdAt: new Date()
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, user: User): Room {
    let room = this.getRoom(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }
    
    room.users.set(user.id, user);
    return room;
  }

  leaveRoom(roomId: string, userId: string): Room | undefined {
    const room = this.getRoom(roomId);
    if (room) {
      room.users.delete(userId);
      
      // Clean up empty rooms
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
        return undefined;
      }
    }
    return room;
  }

  getUser(roomId: string, userId: string): User | undefined {
    const room = this.getRoom(roomId);
    return room?.users.get(userId);
  }

  getRoomUsers(roomId: string): User[] {
    const room = this.getRoom(roomId);
    return room ? Array.from(room.users.values()) : [];
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  updateUserConnection(roomId: string, userId: string, socketId: string, isConnected: boolean): void {
    const room = this.getRoom(roomId);
    if (room) {
      const user = room.users.get(userId);
      if (user) {
        user.socketId = socketId;
        user.isConnected = isConnected;
      }
    }
  }
}

export default new RoomService();
