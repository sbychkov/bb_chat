<template>
  <div class="video-grid">
    <div 
      v-for="user in allUsers" 
      :key="user.id"
      class="video-tile"
      :class="{ 'local-user': user.id === currentUser }"
    >
      <video
        v-if="user.id === currentUser"
        ref="localVideo"
        :srcObject="localStream"
        autoplay
        muted
        playsinline
        class="video-element"
      />
      <video
        v-else
        :srcObject="getRemoteStream(user.id)"
        autoplay
        playsinline
        class="video-element"
      />
      <div class="user-info">
        <span class="user-name">
          {{ user.id === currentUser ? 'You' : `User ${user.id.slice(0, 8)}` }}
        </span>
        <div class="status-indicators">
          <span 
            v-if="!isVideoEnabled && user.id === currentUser"
            class="status-icon video-off"
            title="Video Off"
          >
            📹
          </span>
          <span 
            v-if="!isAudioEnabled && user.id === currentUser"
            class="status-icon audio-off"
            title="Audio Off"
          >
            🎤
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoomStore } from '@/stores/room';

interface Props {
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const props = defineProps<Props>();
const roomStore = useRoomStore();
const localVideo = ref<HTMLVideoElement | null>(null);

const currentUser = computed(() => roomStore.currentUser);
const currentRoomUsers = computed(() => roomStore.currentRoomUsers);
const allUsers = computed(() => {
  const users = [...currentRoomUsers.value];
  if (currentUser.value) {
    users.unshift({
      id: currentUser.value,
      socketId: '',
      isConnected: true
    });
  }
  return users;
});

const getRemoteStream = (userId: string) => {
  return roomStore.remoteStreams.get(userId) || null;
};

onMounted(async () => {
  await nextTick();
  if (localVideo.value && props.localStream) {
    localVideo.value.srcObject = props.localStream;
  }
});
</script>

<style scoped>
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  overflow: auto;
}

.video-tile {
  position: relative;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
  min-height: 200px;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #2a2a2a;
}

.user-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem 0.5rem 0.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.status-indicators {
  display: flex;
  gap: 0.5rem;
}

.status-icon {
  font-size: 0.8rem;
  opacity: 0.7;
}

.video-off {
  opacity: 1;
  color: #ff6b6b;
}

.audio-off {
  opacity: 1;
  color: #ff6b6b;
}

.local-user {
  border: 2px solid #4CAF50;
}

.local-user .user-name {
  color: #4CAF50;
}

@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }
  
  .video-tile {
    min-height: 150px;
  }
}
</style>
