import { SignalingMessage, WebRTCConfig, MediaStreamInfo } from '@/types';
import { SignalingService } from './signaling.service';

export class WebRTCService {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private signalingService: SignalingService;
  private webrtcConfig: WebRTCConfig | null = null;
  private currentUserId: string | null = null;

  constructor(signalingService: SignalingService) {
    this.signalingService = signalingService;
    this.setupSignalingListeners();
  }

  private setupSignalingListeners(): void {
    this.signalingService.onWebRTCSignaling((message: SignalingMessage) => {
      this.handleSignalingMessage(message);
    });

    this.signalingService.onWebRTCConfig((config: WebRTCConfig) => {
      this.webrtcConfig = config;
    });
  }

  async initialize(userId: string): Promise<void> {
    this.currentUserId = userId;
    this.signalingService.requestWebRTCConfig();
    
    // Wait for config
    await new Promise<void>((resolve) => {
      const checkConfig = () => {
        if (this.webrtcConfig) {
          resolve();
        } else {
          setTimeout(checkConfig, 100);
        }
      };
      checkConfig();
    });
  }

  async getUserMedia(): Promise<MediaStreamInfo> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.localStream = stream;
      
      return {
        stream,
        isVideoEnabled: true,
        isAudioEnabled: true
      };
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    if (!this.webrtcConfig) {
      throw new Error('WebRTC config not available');
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: this.webrtcConfig.iceServers
    });

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote stream from', userId);
      const remoteStream = event.streams[0];
      this.onRemoteStream?.(userId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          from: this.currentUserId!,
          to: userId,
          data: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with ${userId}:`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'failed' || 
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'closed') {
        this.onConnectionClosed?.(userId);
      }
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  async createOffer(userId: string): Promise<void> {
    const peerConnection = await this.createPeerConnection(userId);
    
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'offer',
        from: this.currentUserId!,
        to: userId,
        data: offer
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async startCall(userId: string): Promise<void> {
    return this.createOffer(userId);
  }

  async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    let peerConnection = this.peerConnections.get(userId);
    
    if (!peerConnection) {
      peerConnection = await this.createPeerConnection(userId);
    }

    try {
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.sendSignalingMessage({
        type: 'answer',
        from: this.currentUserId!,
        to: userId,
        data: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    
    if (!peerConnection) {
      console.error('No peer connection found for user:', userId);
      return;
    }

    try {
      await peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    
    if (!peerConnection) {
      console.error('No peer connection found for user:', userId);
      return;
    }

    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    const { type, from, data } = message;

    switch (type) {
      case 'offer':
        await this.handleOffer(from, data);
        break;
      case 'answer':
        await this.handleAnswer(from, data);
        break;
      case 'ice-candidate':
        await this.handleIceCandidate(from, data);
        break;
    }
  }

  private sendSignalingMessage(message: SignalingMessage): void {
    this.signalingService.sendSignalingMessage(message);
  }

  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  toggleAudio(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  closePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }
  }

  closeAllConnections(): void {
    this.peerConnections.forEach((connection) => {
      connection.close();
    });
    this.peerConnections.clear();
  }

  stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  cleanup(): void {
    this.stopLocalStream();
    this.closeAllConnections();
  }

  // Event callbacks (to be set by components)
  onRemoteStream?: (userId: string, stream: MediaStream) => void;
  onConnectionClosed?: (userId: string) => void;
}
