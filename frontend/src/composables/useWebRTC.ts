import { ref, onUnmounted } from 'vue';
import { WebRTCService } from '@/services/webrtc.service';
import { SignalingService } from '@/services/signaling.service';
import { useRoomStore } from '@/stores/room';
import { MediaStreamInfo } from '@/types';

export function useWebRTC(signalingService: SignalingService) {
  const webrtcService = new WebRTCService(signalingService);
  const roomStore = useRoomStore();
  
  const localStream = ref<MediaStream | null>(null);
  const isVideoEnabled = ref(true);
  const isAudioEnabled = ref(true);
  const isInitialized = ref(false);
  const error = ref<string | null>(null);

  const initialize = async (userId: string) => {
    try {
      error.value = null;
      await webrtcService.initialize(userId);
      isInitialized.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'WebRTC initialization failed';
      console.warn('WebRTC initialization failed:', err);
      // Don't throw, just log the error and continue
    }
  };

  const getUserMedia = async (): Promise<MediaStreamInfo> => {
    try {
      error.value = null;
      const streamInfo = await webrtcService.getUserMedia();
      localStream.value = streamInfo.stream;
      isVideoEnabled.value = streamInfo.isVideoEnabled;
      isAudioEnabled.value = streamInfo.isAudioEnabled;
      return streamInfo;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to access media devices';
      throw err;
    }
  };

  const startCall = async (userId: string) => {
    try {
      await webrtcService.createOffer(userId);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start call';
      throw err;
    }
  };

  const toggleVideo = () => {
    if (webrtcService) {
      isVideoEnabled.value = webrtcService.toggleVideo();
    }
  };

  const toggleAudio = () => {
    if (webrtcService) {
      isAudioEnabled.value = webrtcService.toggleAudio();
    }
  };

  const cleanup = () => {
    webrtcService.cleanup();
    localStream.value = null;
    isInitialized.value = false;
  };

  // Setup WebRTC event handlers
  webrtcService.onRemoteStream = (userId: string, stream: MediaStream) => {
    roomStore.addRemoteStream(userId, stream);
  };

  webrtcService.onConnectionClosed = (userId: string) => {
    roomStore.removeRemoteStream(userId);
    roomStore.removePeerConnection(userId);
  };

  onUnmounted(() => {
    cleanup();
  });

  return {
    webrtcService,
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    isInitialized,
    error,
    initialize,
    getUserMedia,
    startCall,
    toggleVideo,
    toggleAudio,
    cleanup
  };
}
