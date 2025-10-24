import { io, Socket } from 'socket.io-client';
import { SignalingMessage, WebRTCConfig } from '@/types';

export class SignalingService {
  private socket: Socket | null = null;
  private apiUrl: string;

  constructor() {
    this.apiUrl = (import.meta as any).env?.VITE_API_URL || window.location.origin;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.apiUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Connected to signaling server');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Failed to connect to signaling server:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from signaling server:', reason);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, userId: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    
    this.socket.emit('join-room', { roomId, userId });
  }

  leaveRoom(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sendSignalingMessage(message: SignalingMessage): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    
    this.socket.emit('webrtc-signaling', message);
  }

  requestWebRTCConfig(): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    
    this.socket.emit('get-webrtc-config');
  }

  requestRooms(): void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    
    this.socket.emit('get-rooms');
  }

  // Event listeners
  onUserJoined(callback: (data: { userId: string; socketId: string }) => void): void {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: { userId: string; socketId: string }) => void): void {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onRoomUsers(callback: (users: any[]) => void): void {
    if (this.socket) {
      this.socket.on('room-users', callback);
    }
  }

  onWebRTCSignaling(callback: (message: SignalingMessage) => void): void {
    if (this.socket) {
      this.socket.on('webrtc-signaling', callback);
    }
  }

  onWebRTCConfig(callback: (config: WebRTCConfig) => void): void {
    if (this.socket) {
      this.socket.on('webrtc-config', callback);
    }
  }

  onRoomsList(callback: (rooms: any[]) => void): void {
    if (this.socket) {
      this.socket.on('rooms-list', callback);
    }
  }

  // Remove event listeners
  offUserJoined(): void {
    if (this.socket) {
      this.socket.off('user-joined');
    }
  }

  offUserLeft(): void {
    if (this.socket) {
      this.socket.off('user-left');
    }
  }

  offRoomUsers(): void {
    if (this.socket) {
      this.socket.off('room-users');
    }
  }

  offWebRTCSignaling(): void {
    if (this.socket) {
      this.socket.off('webrtc-signaling');
    }
  }

  offWebRTCConfig(): void {
    if (this.socket) {
      this.socket.off('webrtc-config');
    }
  }

  offRoomsList(): void {
    if (this.socket) {
      this.socket.off('rooms-list');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
