<template>
  <div class="flex items-center justify-center h-full w-full">
    <div class="relative">
      <!-- Gemini logo with animation -->
      <div class="flex items-center justify-center">
        <div
          class="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center transition-all duration-300"
          :class="{ 'scale-110 shadow-lg shadow-blue-500/50': isActive }"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="3" fill="white" />
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>

      <!-- Audio visualization bars -->
      <div
        v-if="isActive"
        class="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div class="flex items-end space-x-1">
          <div
            v-for="i in 5"
            :key="i"
            class="w-1 bg-blue-400 rounded-full transition-all duration-150"
            :style="{ height: `${audioLevels[i - 1] || 4}px` }"
          />
        </div>
      </div>

      <!-- Status text -->
      <div class="mt-8 text-center">
        <p class="text-neutral-300 text-sm">
          {{ statusText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Props {
  agentState?: any;
  agentTrackRef?: any;
}

const props = defineProps<Props>();

const isActive = ref(false);
const audioLevels = ref([4, 8, 12, 8, 4]);

// Animate audio levels for demo
let animationInterval: NodeJS.Timeout | undefined;

const statusText = computed(() => {
  if (isActive.value) {
    return "Gemini is listening...";
  }
  return "Connect to start chatting with Gemini";
});

const animateAudioLevels = () => {
  audioLevels.value = audioLevels.value.map(() => Math.random() * 20 + 4);
};

onMounted(() => {
  // Demo animation - replace with actual audio level detection
  animationInterval = setInterval(() => {
    if (isActive.value) {
      animateAudioLevels();
    }
  }, 100);

  // TODO: Connect to actual agent state and audio track
  // For now, simulate active state after 2 seconds
  setTimeout(() => {
    isActive.value = true;
  }, 2000);
});

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval);
  }
});
</script>
