<template>
  <div
    class="flex items-center justify-center gap-4 p-4 bg-neutral-900/50 rounded-lg"
  >
    <!-- Microphone toggle -->
    <button
      class="relative p-4 rounded-full transition-all duration-200"
      :class="
        !isMicrophoneEnabled
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-green-600 hover:bg-green-700'
      "
      @click="handleToggleMicrophone"
      :disabled="!isConnected"
    >
      <Mic v-if="isMicrophoneEnabled" class="w-6 h-6 text-white" />
      <MicOff v-else class="w-6 h-6 text-white" />
    </button>

    <!-- Audio visualizer -->
    <div class="flex items-center space-x-1 px-4">
      <div
        v-for="(level, i) in audioLevels"
        :key="i"
        class="w-1 bg-blue-400 rounded-full transition-all duration-75"
        :style="{ height: `${level}px` }"
      />
    </div>

    <!-- Device settings dropdown -->
    <div class="relative" ref="dropdownRef">
      <button
        class="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
        @click="showDeviceMenu = !showDeviceMenu"
        :disabled="!isConnected"
      >
        <Settings class="w-5 h-5 text-neutral-300" />
      </button>

      <!-- Dropdown menu -->
      <div
        v-if="showDeviceMenu"
        class="absolute bottom-full right-0 mb-2 w-64 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10"
      >
        <div class="p-3 space-y-3">
          <!-- Audio device selection -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-1">
              Microphone
            </label>
            <select
              class="w-full p-2 bg-neutral-700 border border-neutral-600 rounded text-neutral-100 text-sm"
              :value="activeDeviceId"
              @change="handleDeviceChange"
            >
              <option
                v-for="device in audioDevices"
                :key="device.deviceId"
                :value="device.deviceId"
              >
                {{
                  device.label || `Microphone ${device.deviceId.slice(0, 8)}`
                }}
              </option>
            </select>
          </div>

          <!-- Noise filter toggle -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-neutral-300">Noise Filter</span>
            <button
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              :class="noiseFilter ? 'bg-blue-600' : 'bg-neutral-600'"
              @click="noiseFilter = !noiseFilter"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="noiseFilter ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Disconnect button -->
    <button
      class="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
      @click="handleDisconnect"
      :disabled="!isConnected"
    >
      <PhoneOff class="w-5 h-5 text-white" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Mic, MicOff, Settings, PhoneOff } from "lucide-vue-next";
import {
  useLiveKit,
  useMediaDevices,
  useAudioAnalyzer,
} from "~/composables/useLiveKit";
import { useConnection } from "~/composables/useConnection";

const showDeviceMenu = ref(false);
const noiseFilter = ref(false);
const dropdownRef = ref<HTMLElement>();

// LiveKit integration
const { isConnected, isMicrophoneEnabled, toggleMicrophone, localParticipant } =
  useLiveKit();
const {
  devices: audioDevices,
  activeDeviceId,
  setActiveDevice,
} = useMediaDevices();
const { audioLevels, startAnalyzing, stopAnalyzing } = useAudioAnalyzer();
const { disconnect } = useConnection();

const handleToggleMicrophone = async () => {
  console.log('SessionControls: handleToggleMicrophone called');
  console.log('SessionControls: isConnected =', isConnected.value);
  console.log('SessionControls: isMicrophoneEnabled =', isMicrophoneEnabled.value);
  
  try {
    await toggleMicrophone();
    console.log('SessionControls: toggleMicrophone completed successfully');
  } catch (error) {
    console.error("SessionControls: Failed to toggle microphone:", error);
  }
};

const handleDisconnect = async () => {
  try {
    // Use both the connection disconnect and the livekit disconnect
    await Promise.all([
      disconnect(), // Disconnects from connection state
      useLiveKit().disconnect() // Disconnects the actual room
    ]);
  } catch (error) {
    console.error("Failed to disconnect:", error);
  }
};

const handleDeviceChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  try {
    await setActiveDevice(target.value);
  } catch (error) {
    console.error("Failed to change device:", error);
  }
};

// Watch for microphone track changes to start/stop audio analysis
watch(
  localParticipant,
  (participant) => {
    if (participant?.microphoneTrack?.track) {
      startAnalyzing(participant.microphoneTrack.track.mediaStreamTrack);
    } else {
      stopAnalyzing();
    }
  },
  { immediate: true },
);

// Close dropdown when clicking outside
const handleClickOutside = (e: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    showDeviceMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  stopAnalyzing();
});
</script>
