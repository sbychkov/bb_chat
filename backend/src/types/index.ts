export interface User {
  id: string;
  socketId: string;
  roomId: string;
  isConnected: boolean;
}

export interface Room {
  id: string;
  users: Map<string, User>;
  createdAt: Date;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  from: string;
  to: string;
  data: any;
}

export interface JoinRoomData {
  roomId: string;
  userId: string;
}

export interface IceServer {
  urls: string;
  username?: string;
  credential?: string;
}

export interface WebRTCConfig {
  iceServers: IceServer[];
}
