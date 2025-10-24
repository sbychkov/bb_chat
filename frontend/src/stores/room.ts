import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, Room, WebRTCConfig } from '@/types';

export const useRoomStore = defineStore('room', () => {
  // State
  const currentRoom = ref<string | null>(null);
  const currentUser = ref<string | null>(null);
  const users = ref<User[]>([]);
  const rooms = ref<Room[]>([]);
  const isConnected = ref(false);
  const webrtcConfig = ref<WebRTCConfig | null>(null);
  const peerConnections = ref<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreams = ref<Map<string, MediaStream>>(new Map());

  // Getters
  const currentRoomUsers = computed(() => 
    users.value.filter(user => user.id !== currentUser.value)
  );

  const userCount = computed(() => users.value.length);

  const isInRoom = computed(() => currentRoom.value !== null);

  // Actions
  function setCurrentUser(userId: string) {
    currentUser.value = userId;
  }

  function setCurrentRoom(roomId: string) {
    currentRoom.value = roomId;
  }

  function setUsers(newUsers: User[]) {
    users.value = newUsers;
  }

  function addUser(user: User) {
    const existingIndex = users.value.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      users.value[existingIndex] = user;
    } else {
      users.value.push(user);
    }
  }

  function removeUser(userId: string) {
    users.value = users.value.filter(user => user.id !== userId);
    peerConnections.value.delete(userId);
    remoteStreams.value.delete(userId);
  }

  function setRooms(newRooms: Room[]) {
    rooms.value = newRooms;
  }

  function setConnectionStatus(connected: boolean) {
    isConnected.value = connected;
  }

  function setWebRTCConfig(config: WebRTCConfig) {
    webrtcConfig.value = config;
  }

  function addPeerConnection(userId: string, connection: RTCPeerConnection) {
    peerConnections.value.set(userId, connection);
  }

  function removePeerConnection(userId: string) {
    const connection = peerConnections.value.get(userId);
    if (connection) {
      connection.close();
      peerConnections.value.delete(userId);
    }
  }

  function addRemoteStream(userId: string, stream: MediaStream) {
    remoteStreams.value.set(userId, stream);
  }

  function removeRemoteStream(userId: string) {
    const stream = remoteStreams.value.get(userId);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      remoteStreams.value.delete(userId);
    }
  }

  function leaveRoom() {
    // Close all peer connections
    peerConnections.value.forEach((connection) => {
      connection.close();
    });
    
    // Stop all remote streams
    remoteStreams.value.forEach((stream) => {
      stream.getTracks().forEach(track => track.stop());
    });

    // Clear state
    currentRoom.value = null;
    users.value = [];
    peerConnections.value.clear();
    remoteStreams.value.clear();
  }

  function reset() {
    leaveRoom();
    currentUser.value = null;
    isConnected.value = false;
    webrtcConfig.value = null;
    rooms.value = [];
  }

  return {
    // State
    currentRoom,
    currentUser,
    users,
    rooms,
    isConnected,
    webrtcConfig,
    peerConnections,
    remoteStreams,
    
    // Getters
    currentRoomUsers,
    userCount,
    isInRoom,
    
    // Actions
    setCurrentUser,
    setCurrentRoom,
    setUsers,
    addUser,
    removeUser,
    setRooms,
    setConnectionStatus,
    setWebRTCConfig,
    addPeerConnection,
    removePeerConnection,
    addRemoteStream,
    removeRemoteStream,
    leaveRoom,
    reset
  };
});
