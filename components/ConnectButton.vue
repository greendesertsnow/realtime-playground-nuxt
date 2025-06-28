<template>
  <div class="flex flex-col items-center space-y-4">
    <!-- Connect button -->
    <button
      class="relative px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
      :disabled="globalIsConnecting || isConnected"
      @click="handleConnect"
    >
      <div v-if="globalIsConnecting" class="flex items-center space-x-2">
        <div
          class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
        ></div>
        <span>Connecting...</span>
      </div>
      <div v-else-if="isConnected" class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-green-400 rounded-full"></div>
        <span>Connected</span>
      </div>
      <span v-else>Connect to Gemini</span>
    </button>

    <!-- Microphone Test Button -->
    <div v-if="showMicTest && !globalIsConnecting && !isConnected" class="w-full">
      <button
        @click="testMicrophone"
        :disabled="isTesting"
        class="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        <div v-if="isTesting" class="flex items-center justify-center space-x-2">
          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Testing...</span>
        </div>
        <div v-else class="flex items-center justify-center space-x-2">
          <Mic class="w-4 h-4" />
          <span>🎤 Test Microphone</span>
        </div>
      </button>
      
      <!-- Test Result -->
      <div
        v-if="testResult"
        class="mt-2 p-3 rounded-lg text-sm"
        :class="testResult.success 
          ? 'bg-green-500/20 border border-green-400 text-green-300' 
          : 'bg-red-500/20 border border-red-400 text-red-300'"
      >
        {{ testResult.message }}
      </div>
    </div>

    <!-- API Key Change Button -->
    <div v-if="playgroundStore.geminiAPIKey" class="w-full">
      <button
        @click="changeApiKey"
        class="w-full py-2 px-4 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 hover:text-white font-medium rounded-lg transition-all duration-200 text-sm"
      >
        <div class="flex items-center justify-center space-x-2">
          <Key class="w-4 h-4" />
          <span>Change API Key</span>
        </div>
      </button>
    </div>

    <!-- API Key prompt -->
    <div v-if="!playgroundStore.geminiAPIKey" class="text-center space-y-2">
      <p class="text-sm text-neutral-400">
        You need to provide your Gemini API key to connect
      </p>
      <button
        class="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
        @click="playgroundStore.setShowAuthDialog(true)"
      >
        Enter API Key
      </button>
    </div>

    <!-- Connection status -->
    <div v-if="connectionError" class="text-center">
      <p class="text-sm text-red-400">{{ connectionError }}</p>
      <button
        class="text-sm text-blue-400 hover:text-blue-300 underline transition-colors mt-1"
        @click="retry"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Mic, Key } from "lucide-vue-next";
import { usePlaygroundStore } from "~/stores/playground";
import { useConnection } from "~/composables/useConnection";

interface TestResult {
  success: boolean
  message: string
}

const playgroundStore = usePlaygroundStore();
const { connect, isConnecting: globalIsConnecting, isConnected } = useConnection();

const connectionError = ref("");
const isTesting = ref(false);
const testResult = ref<TestResult | null>(null);
const showMicTest = ref(true);

const handleConnect = async () => {
  if (!playgroundStore.geminiAPIKey) {
    playgroundStore.setShowAuthDialog(true);
    return;
  }

  // Don't allow multiple connection attempts
  if (globalIsConnecting.value || isConnected.value) {
    return;
  }

  connectionError.value = "";

  try {
    await connect();
    console.log("Connection initiated successfully!");
  } catch (error) {
    connectionError.value =
      error instanceof Error ? error.message : "Connection failed";
  }
};

const retry = () => {
  connectionError.value = "";
  handleConnect();
};

const testMicrophone = async () => {
  isTesting.value = true;
  testResult.value = null;

  try {
    // Test direct browser microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });

    // Success - clean up the stream
    stream.getTracks().forEach((track) => track.stop());
    
    testResult.value = {
      success: true,
      message: '✅ Microphone working perfectly!'
    };

    // Hide the test button after 5 seconds if successful
    setTimeout(() => {
      if (testResult.value?.success) {
        showMicTest.value = false;
      }
    }, 5000);
    
  } catch (error: any) {
    let errorMessage = 'Microphone test failed';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = '❌ Microphone access denied. Please allow microphone access.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = '❌ No microphone found. Please connect a microphone.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = '❌ Microphone is being used by another application.';
    } else {
      errorMessage = `❌ Error: ${error.message}`;
    }

    testResult.value = {
      success: false,
      message: errorMessage
    };
  } finally {
    isTesting.value = false;
  }
};

const changeApiKey = () => {
  playgroundStore.setShowAuthDialog(true);
};
</script>
