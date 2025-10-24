<template>
  <div class="control-panel">
    <div class="controls">
      <button
        @click="toggleVideo"
        :class="['control-btn', { 'active': isVideoEnabled, 'inactive': !isVideoEnabled }]"
        :title="isVideoEnabled ? 'Turn off video' : 'Turn on video'"
      >
        <span class="control-icon">
          {{ isVideoEnabled ? '📹' : '📹' }}
        </span>
        <span class="control-label">Video</span>
      </button>

      <button
        @click="toggleAudio"
        :class="['control-btn', { 'active': isAudioEnabled, 'inactive': !isAudioEnabled }]"
        :title="isAudioEnabled ? 'Turn off audio' : 'Turn on audio'"
      >
        <span class="control-icon">
          {{ isAudioEnabled ? '🎤' : '🎤' }}
        </span>
        <span class="control-label">Audio</span>
      </button>

      <button
        @click="toggleSettings"
        class="control-btn settings-btn"
        :class="{ 'active': showSettings }"
        title="Settings"
      >
        <span class="control-icon">⚙️</span>
        <span class="control-label">Settings</span>
      </button>

      <button
        @click="leaveRoom"
        class="control-btn leave-btn"
        title="Leave room"
      >
        <span class="control-icon">📞</span>
        <span class="control-label">Leave</span>
      </button>
    </div>

    <div v-if="showSettings" class="settings-panel">
      <h3>Media Settings</h3>
      
      <div class="setting-group">
        <label for="video-device">Camera:</label>
        <select 
          id="video-device" 
          v-model="selectedVideoDevice"
          @change="handleDeviceChange"
        >
          <option 
            v-for="device in getVideoDevices()" 
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ getDeviceLabel(device) }}
          </option>
        </select>
      </div>

      <div class="setting-group">
        <label for="audio-device">Microphone:</label>
        <select 
          id="audio-device" 
          v-model="selectedAudioDevice"
          @change="handleDeviceChange"
        >
          <option 
            v-for="device in getAudioDevices()" 
            :key="device.deviceId"
            :value="device.deviceId"
          >
            {{ getDeviceLabel(device) }}
          </option>
        </select>
      </div>

      <div class="setting-group">
        <label>Room Info:</label>
        <div class="room-info">
          <p><strong>Room ID:</strong> {{ currentRoom }}</p>
          <p><strong>Participants:</strong> {{ userCount }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoomStore } from '@/stores/room';
import { useMediaDevices } from '@/composables/useMediaDevices';

interface Props {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

interface Emits {
  (e: 'toggle-video'): void;
  (e: 'toggle-audio'): void;
  (e: 'leave-room'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const roomStore = useRoomStore();
const showSettings = ref(false);

const {
  selectedVideoDevice,
  selectedAudioDevice,
  getVideoDevices,
  getAudioDevices,
  getDeviceLabel,
  handleDeviceChange
} = useMediaDevices();

const currentRoom = computed(() => roomStore.currentRoom);
const userCount = computed(() => roomStore.userCount);

const toggleVideo = () => {
  emit('toggle-video');
};

const toggleAudio = () => {
  emit('toggle-audio');
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const leaveRoom = () => {
  emit('leave-room');
};
</script>

<style scoped>
.control-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem;
  z-index: 1000;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.control-btn.active {
  background: #4CAF50;
  border-color: #4CAF50;
}

.control-btn.inactive {
  background: #f44336;
  border-color: #f44336;
}

.control-btn.leave-btn {
  background: #f44336;
  border-color: #f44336;
}

.control-btn.leave-btn:hover {
  background: #d32f2f;
}

.control-icon {
  font-size: 1.2rem;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 500;
}

.settings-panel {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.settings-panel h3 {
  color: white;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-group label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.setting-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.setting-group select option {
  background: #2a2a2a;
  color: white;
}

.room-info {
  color: white;
}

.room-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .controls {
    gap: 0.5rem;
  }
  
  .control-btn {
    min-width: 60px;
    padding: 0.5rem 0.75rem;
  }
  
  .control-icon {
    font-size: 1rem;
  }
  
  .control-label {
    font-size: 0.7rem;
  }
}
</style>
