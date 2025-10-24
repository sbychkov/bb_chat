<template>
  <div id="app">
    <div v-if="!isInRoom" class="lobby-view">
      <RoomLobby @room-joined="handleRoomJoined" />
    </div>
    
    <div v-else class="room-view">
      <div class="room-header">
        <h2>Room: {{ currentRoom }}</h2>
        <div class="room-stats">
          <span>{{ userCount }} participant{{ userCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>
      
      <div class="video-container">
        <VideoGrid 
          :local-stream="localStream"
          :is-video-enabled="isVideoEnabled"
          :is-audio-enabled="isAudioEnabled"
        />
      </div>
      
      <ControlPanel
        :is-video-enabled="isVideoEnabled"
        :is-audio-enabled="isAudioEnabled"
        @toggle-video="toggleVideo"
        @toggle-audio="toggleAudio"
        @leave-room="leaveRoom"
      />
    </div>
    
    <div v-if="error" class="error-overlay">
      <div class="error-message">
        <h3>Error</h3>
        <p>{{ error }}</p>
        <button @click="error = null" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoomStore } from '@/stores/room';
import { useSocket } from '@/composables/useSocket';
import { useWebRTC } from '@/composables/useWebRTC';
import RoomLobby from '@/components/RoomLobby.vue';
import VideoGrid from '@/components/VideoGrid.vue';
import ControlPanel from '@/components/ControlPanel.vue';

const roomStore = useRoomStore();
const { signalingService } = useSocket();
const { 
  webrtcService, 
  localStream, 
  isVideoEnabled, 
  isAudioEnabled, 
  initialize: initWebRTC,
  getUserMedia,
  toggleVideo,
  toggleAudio,
  cleanup: cleanupWebRTC
} = useWebRTC(signalingService);

const error = ref<string | null>(null);
const isInitialized = ref(false);

const isInRoom = computed(() => roomStore.isInRoom);
const currentRoom = computed(() => roomStore.currentRoom);
const userCount = computed(() => roomStore.userCount);

const handleRoomJoined = async (data: { roomId: string; userId: string }) => {
  try {
    error.value = null;
    
    // Initialize WebRTC
    await initWebRTC(data.userId);
    
    // Get user media
    await getUserMedia();
    
    isInitialized.value = true;
    
    // Start WebRTC connections with existing users
    const existingUsers = roomStore.currentRoomUsers;
    for (const user of existingUsers) {
      await webrtcService.createOffer(user.id);
    }
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to join room';
    console.error('Error joining room:', err);
  }
};

const leaveRoom = async () => {
  try {
    cleanupWebRTC();
    roomStore.leaveRoom();
    isInitialized.value = false;
  } catch (err) {
    console.error('Error leaving room:', err);
  }
};

onMounted(() => {
  // Handle page unload
  const handleBeforeUnload = () => {
    cleanupWebRTC();
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    cleanupWebRTC();
  });
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: #1a1a1a;
  color: white;
  overflow: hidden;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.lobby-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.room-header {
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.room-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
}

.room-stats {
  color: #ccc;
  font-size: 0.9rem;
}

.video-container {
  flex: 1;
  overflow: hidden;
  background: #1a1a1a;
}

.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.error-message {
  background: white;
  color: #333;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.error-message h3 {
  color: #f44336;
  margin-bottom: 1rem;
}

.error-message p {
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.close-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.close-btn:hover {
  background: #5a6fd8;
}

@media (max-width: 768px) {
  .room-header {
    padding: 0.75rem;
  }
  
  .room-header h2 {
    font-size: 1rem;
  }
  
  .room-stats {
    font-size: 0.8rem;
  }
}
</style>
