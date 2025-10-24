import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import roomService from '../services/room.service';
import { SignalingMessage, JoinRoomData, WebRTCConfig } from '../types';

export class RoomHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  handleConnection(socket: Socket): void {
    console.log(`User connected: ${socket.id}`);

    // Handle joining a room
    socket.on('join-room', (data: JoinRoomData) => {
      this.handleJoinRoom(socket, data);
    });

    // Handle WebRTC signaling
    socket.on('webrtc-signaling', (message: SignalingMessage) => {
      this.handleWebRTCSignaling(socket, message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });

    // Handle room list request
    socket.on('get-rooms', () => {
      this.handleGetRooms(socket);
    });

    // Handle WebRTC config request
    socket.on('get-webrtc-config', () => {
      this.handleGetWebRTCConfig(socket);
    });
  }

  private handleJoinRoom(socket: Socket, data: JoinRoomData): void {
    const { roomId, userId } = data;
    const user = {
      id: userId,
      socketId: socket.id,
      roomId,
      isConnected: true
    };

    // Join the socket room
    socket.join(roomId);

    // Add user to room service
    const room = roomService.joinRoom(roomId, user);

    // Notify other users in the room
    socket.to(roomId).emit('user-joined', {
      userId,
      socketId: socket.id
    });

    // Send current room users to the new user
    const roomUsers = roomService.getRoomUsers(roomId);
    socket.emit('room-users', roomUsers.map(u => ({
      id: u.id,
      socketId: u.socketId,
      isConnected: u.isConnected
    })));

    console.log(`User ${userId} joined room ${roomId}`);
  }

  private handleWebRTCSignaling(socket: Socket, message: SignalingMessage): void {
    const { type, to, data } = message;
    
    // Forward the signaling message to the target user
    socket.to(to).emit('webrtc-signaling', {
      ...message,
      from: socket.id
    });

    console.log(`Signaling message ${type} from ${socket.id} to ${to}`);
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`User disconnected: ${socket.id}`);

    // Find and remove user from all rooms
    const rooms = roomService.getAllRooms();
    for (const room of rooms) {
      for (const [userId, user] of room.users) {
        if (user.socketId === socket.id) {
          roomService.leaveRoom(room.id, userId);
          
          // Notify other users in the room
          socket.to(room.id).emit('user-left', {
            userId,
            socketId: socket.id
          });
          
          console.log(`User ${userId} left room ${room.id}`);
          break;
        }
      }
    }
  }

  private handleGetRooms(socket: Socket): void {
    const rooms = roomService.getAllRooms().map(room => ({
      id: room.id,
      userCount: room.users.size,
      createdAt: room.createdAt
    }));

    socket.emit('rooms-list', rooms);
  }

  private handleGetWebRTCConfig(socket: Socket): void {
    const config: WebRTCConfig = {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        },
        {
          urls: 'stun:stun1.l.google.com:19302'
        }
      ]
    };

    socket.emit('webrtc-config', config);
  }
}
