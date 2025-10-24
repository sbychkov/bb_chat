<template>
  <div class="room-lobby">
    <div class="lobby-container">
      <header class="lobby-header">
        <h1>Band of Blades Chat</h1>
        <p>Enter a room ID to join or create a new room</p>
      </header>

      <div class="connection-status" :class="{ 'connected': isConnected, 'error': connectionError }">
        <span v-if="isConnecting">Connecting...</span>
        <span v-else-if="connectionError">Connection Error: {{ connectionError }}</span>
        <span v-else-if="isConnected">Connected</span>
        <span v-else>Disconnected</span>
      </div>

      <div class="room-form">
        <div class="input-group">
          <label for="room-id">Room ID:</label>
          <input
            id="room-id"
            v-model="roomId"
            type="text"
            placeholder="Enter room ID or leave empty for random"
            :disabled="isConnecting"
            @keyup.enter="joinRoom"
          />
        </div>

        <div class="input-group">
          <label for="user-id">Your Name (optional):</label>
          <input
            id="user-id"
            v-model="userName"
            type="text"
            placeholder="Enter your name"
            :disabled="isConnecting"
            @keyup.enter="joinRoom"
          />
        </div>

        <button 
          @click="joinRoom" 
          :disabled="isConnecting || !isConnected"
          class="join-btn"
        >
          {{ isConnecting ? 'Connecting...' : 'Join Room' }}
        </button>
      </div>

      <div v-if="rooms.length > 0" class="available-rooms">
        <h3>Available Rooms</h3>
        <div class="rooms-list">
          <div 
            v-for="room in rooms" 
            :key="room.id"
            class="room-item"
            @click="selectRoom(room.id)"
          >
            <div class="room-info">
              <span class="room-id">{{ room.id }}</span>
              <span class="room-users">{{ room.userCount }} participant{{ room.userCount !== 1 ? 's' : '' }}</span>
            </div>
            <button class="join-room-btn">Join</button>
          </div>
        </div>
      </div>

      <div class="help-section">
        <h3>How to use:</h3>
        <ul>
          <li>Enter a room ID to join an existing room or create a new one</li>
          <li>Share the room ID with others to invite them</li>
          <li>Allow camera and microphone access when prompted</li>
          <li>Use the controls at the bottom to manage your video and audio</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSocket } from '@/composables/useSocket';
import { useRoomStore } from '@/stores/room';
import { v4 as uuidv4 } from 'uuid';

interface Emits {
  (e: 'room-joined', data: { roomId: string; userId: string }): void;
}

const emit = defineEmits<Emits>();

const roomId = ref('');
const userName = ref('');
const { isConnecting, connectionError, isConnected, joinRoom: socketJoinRoom, requestRooms } = useSocket();
const roomStore = useRoomStore();

const rooms = computed(() => roomStore.rooms);

const joinRoom = () => {
  if (!isConnected.value || isConnecting.value) return;

  const finalRoomId = roomId.value.trim() || uuidv4();
  const finalUserId = userName.value.trim() || `User-${uuidv4().slice(0, 8)}`;

  socketJoinRoom(finalRoomId, finalUserId);
  emit('room-joined', { roomId: finalRoomId, userId: finalUserId });
};

const selectRoom = (selectedRoomId: string) => {
  roomId.value = selectedRoomId;
};

onMounted(() => {
  // Request rooms list when component mounts
  setTimeout(() => {
    if (isConnected.value) {
      requestRooms();
    }
  }, 1000);
});
</script>

<style scoped>
.room-lobby {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.lobby-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.lobby-header {
  text-align: center;
  margin-bottom: 2rem;
}

.lobby-header h1 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.lobby-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.connection-status {
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.connection-status.connected {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.connection-status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.connection-status:not(.connected):not(.error) {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.room-form {
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.input-group input:focus {
  outline: none;
  border-color: #667eea;
}

.input-group input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.join-btn {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.join-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.join-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.available-rooms {
  margin-bottom: 2rem;
}

.available-rooms h3 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.room-item:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.room-id {
  font-weight: 600;
  color: #333;
}

.room-users {
  font-size: 0.9rem;
  color: #666;
}

.join-room-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.join-room-btn:hover {
  background: #5a6fd8;
}

.help-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e1e5e9;
}

.help-section h3 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.help-section ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.help-section li {
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .room-lobby {
    padding: 1rem;
  }
  
  .lobby-container {
    padding: 1.5rem;
  }
  
  .lobby-header h1 {
    font-size: 1.5rem;
  }
}
</style>
