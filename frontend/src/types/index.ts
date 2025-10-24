export interface User {
  id: string;
  socketId: string;
  isConnected: boolean;
}

export interface Room {
  id: string;
  userCount: number;
  createdAt: Date;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  from: string;
  to: string;
  data: any;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface MediaStreamInfo {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}
