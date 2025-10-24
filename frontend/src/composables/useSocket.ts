import { ref, onMounted, onUnmounted, computed } from 'vue';
import { SignalingService } from '@/services/signaling.service';
import { useRoomStore } from '@/stores/room';

export function useSocket() {
  const signalingService = new SignalingService();
  const roomStore = useRoomStore();
  const isConnecting = ref(false);
  const connectionError = ref<string | null>(null);

  const connect = async () => {
    try {
      isConnecting.value = true;
      connectionError.value = null;
      
      await signalingService.connect();
      roomStore.setConnectionStatus(true);
      
      // Setup event listeners
      setupEventListeners();
      
    } catch (error) {
      connectionError.value = error instanceof Error ? error.message : 'Connection failed';
      roomStore.setConnectionStatus(false);
    } finally {
      isConnecting.value = false;
    }
  };

  const disconnect = () => {
    signalingService.disconnect();
    roomStore.setConnectionStatus(false);
    roomStore.reset();
  };

  const joinRoom = (roomId: string, userId: string) => {
    signalingService.joinRoom(roomId, userId);
    roomStore.setCurrentRoom(roomId);
    roomStore.setCurrentUser(userId);
  };

  const leaveRoom = () => {
    roomStore.leaveRoom();
    signalingService.leaveRoom();
  };

  const setupEventListeners = () => {
    // User joined room
    signalingService.onUserJoined((data) => {
      console.log('User joined:', data);
      roomStore.addUser({
        id: data.userId,
        socketId: data.socketId,
        isConnected: true
      });
    });

    // User left room
    signalingService.onUserLeft((data) => {
      console.log('User left:', data);
      roomStore.removeUser(data.userId);
    });

    // Room users list
    signalingService.onRoomUsers((users) => {
      console.log('Room users:', users);
      roomStore.setUsers(users);
    });

    // WebRTC config
    signalingService.onWebRTCConfig((config) => {
      console.log('WebRTC config received:', config);
      roomStore.setWebRTCConfig(config);
    });

    // Rooms list
    signalingService.onRoomsList((rooms) => {
      console.log('Rooms list:', rooms);
      roomStore.setRooms(rooms);
    });
  };

  const requestRooms = () => {
    signalingService.requestRooms();
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    signalingService,
    isConnecting,
    connectionError,
    isConnected: computed(() => roomStore.isConnected),
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    requestRooms
  };
}
