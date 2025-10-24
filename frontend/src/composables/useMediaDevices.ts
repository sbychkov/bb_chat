import { ref, onMounted, onUnmounted } from 'vue';

export function useMediaDevices() {
  const devices = ref<MediaDeviceInfo[]>([]);
  const selectedVideoDevice = ref<string>('');
  const selectedAudioDevice = ref<string>('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const loadDevices = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      
      // Get all devices
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      devices.value = deviceList;

      // Set default devices
      const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
      const audioDevices = deviceList.filter(device => device.kind === 'audioinput');

      if (videoDevices.length > 0) {
        selectedVideoDevice.value = videoDevices[0].deviceId;
      }

      if (audioDevices.length > 0) {
        selectedAudioDevice.value = audioDevices[0].deviceId;
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load media devices';
    } finally {
      isLoading.value = false;
    }
  };

  const getVideoDevices = () => {
    return devices.value.filter(device => device.kind === 'videoinput');
  };

  const getAudioDevices = () => {
    return devices.value.filter(device => device.kind === 'audioinput');
  };

  const getDeviceLabel = (device: MediaDeviceInfo) => {
    return device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`;
  };

  const handleDeviceChange = () => {
    // This can be used to restart media streams with new devices
    console.log('Device selection changed');
  };

  onMounted(() => {
    loadDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);
  });

  onUnmounted(() => {
    navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
  });

  return {
    devices,
    selectedVideoDevice,
    selectedAudioDevice,
    isLoading,
    error,
    loadDevices,
    getVideoDevices,
    getAudioDevices,
    getDeviceLabel,
    handleDeviceChange
  };
}
