<template>
  <div class="flex flex-col h-full overflow-hidden p-2 lg:p-4">
    <!-- Chat controls -->
    <ChatControls
      :show-edit-button="isChatRunning"
      :is-editing-instructions="isEditingInstructions"
      @toggle-edit="toggleInstructionsEdit"
    />

    <!-- Main content area -->
    <div
      class="flex flex-col flex-grow items-center lg:justify-between mt-12 lg:mt-0"
    >
      <div class="w-full h-full flex flex-col">
        <!-- Instructions/Visualizer area -->
        <div class="flex items-center justify-center w-full">
          <!-- Mobile layout -->
          <div class="lg:hidden w-full">
            <InstructionsComponent v-if="isEditingInstructions" />
            <div v-else class="flex w-full items-center">
              <div class="h-[280px] lg:h-[400px] mt-16 md:mt-0 lg:pb-24 w-full">
                <GeminiVisualizer
                  :agent-state="agentState"
                  :agent-track-ref="audioTrack"
                />
              </div>
            </div>
          </div>

          <!-- Desktop layout -->
          <div class="hidden lg:block w-full">
            <InstructionsComponent />
          </div>
        </div>

        <!-- Desktop visualizer area -->
        <div class="grow h-full flex items-center justify-center">
          <div class="w-full hidden lg:block">
            <div v-if="!isEditingInstructions" class="flex w-full items-center">
              <div class="h-[280px] lg:h-[400px] mt-16 md:mt-0 lg:pb-24 w-full">
                <GeminiVisualizer
                  :agent-state="agentState"
                  :agent-track-ref="audioTrack"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connection controls with animation -->
      <div class="my-4">
        <Transition
          enter-active-class="transition-all duration-150 ease-in-out"
          leave-active-class="transition-all duration-150 ease-in-out"
          enter-from-class="opacity-0 translate-y-5"
          enter-to-class="opacity-100 translate-y-0"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
          mode="out-in"
        >
          <SessionControls v-if="isChatRunning" key="session-controls" />
          <ConnectButton v-else key="connect-button" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useConnection } from "~/composables/useConnection";
import { useLiveKit } from "~/composables/useLiveKit";

// Reactive state
const isEditingInstructions = ref(false);
const isChatRunning = ref(false);
const hasSeenAgent = ref(false);

// Get connection state from composables
const { shouldConnect, wsUrl, token } = useConnection();
const { connect, isConnected, remoteParticipants } = useLiveKit();

const agentState = ref(null); // TODO: useVoiceAssistant()
const audioTrack = ref(null); // TODO: useVoiceAssistant()
const agent = ref(null); // TODO: useAgent()

// Update chat running state based on LiveKit connection
watch(
  isConnected,
  (connected) => {
    isChatRunning.value = connected;
  },
  { immediate: true },
);

// Watch for connection triggers and connect to LiveKit
watch(
  [shouldConnect, wsUrl, token],
  async ([should, url, accessToken]) => {
    if (should && url && accessToken && !isConnected.value) {
      try {
        await connect(url, accessToken);
      } catch (error) {
        console.error("Failed to connect to LiveKit room:", error);
      }
    }
  },
  { immediate: true },
);

// Timer refs for cleanup
let disconnectTimer: NodeJS.Timeout | undefined;
let appearanceTimer: NodeJS.Timeout | undefined;

const toggleInstructionsEdit = () => {
  isEditingInstructions.value = !isEditingInstructions.value;
};

// Monitor agent state from remote participants
const setupAgentMonitoring = () => {
  watch(
    remoteParticipants,
    (participants) => {
      // Find the agent participant and monitor its tracks
      const agentParticipant = participants.find((p) =>
        p.identity.includes("agent"),
      );
      if (agentParticipant) {
        hasSeenAgent.value = true;
        // Get audio track for visualizer
        const audioPublication = agentParticipant.getTrack("audio");
        if (audioPublication?.track) {
          audioTrack.value = {
            participant: agentParticipant,
            publication: audioPublication,
            source: "microphone",
          };
        }
      }
    },
    { immediate: true },
  );
};

onMounted(() => {
  setupAgentMonitoring();
});

onUnmounted(() => {
  if (disconnectTimer) clearTimeout(disconnectTimer);
  if (appearanceTimer) clearTimeout(appearanceTimer);
});
</script>
