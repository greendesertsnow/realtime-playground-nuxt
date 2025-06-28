import { ref, computed, watch } from "vue";
import type { PlaygroundState } from "~/data/playground-state";
import { VoiceId } from "~/data/voices";
import { usePlaygroundStore } from "~/stores/playground";

export type ConnectFn = () => Promise<void>;

interface ConnectionDetails {
  wsUrl: string;
  token: string;
  shouldConnect: boolean;
  voice: VoiceId;
}

const connectionDetails = ref<ConnectionDetails>({
  wsUrl: "",
  token: "",
  shouldConnect: false,
  voice: VoiceId.PUCK,
});

// Global connection state
const isConnecting = ref(false);
const isConnected = ref(false);

// Functions to update connection state (used by RoomComponent)
export const setConnectionState = (connecting: boolean, connected: boolean) => {
  isConnecting.value = connecting;
  isConnected.value = connected;
};

export const useConnection = () => {
  const playgroundStore = usePlaygroundStore();

  const connect: ConnectFn = async () => {
    if (!playgroundStore.geminiAPIKey) {
      throw new Error("Gemini API key is required to connect");
    }

    isConnecting.value = true;

    try {
      const pgState: PlaygroundState = {
        sessionConfig: playgroundStore.sessionConfig,
        userPresets: playgroundStore.userPresets,
        selectedPresetId: playgroundStore.selectedPresetId,
        geminiAPIKey: playgroundStore.geminiAPIKey,
        instructions: playgroundStore.instructions,
      };

      const response = await $fetch<{ accessToken: string; url: string }>(
        "/api/token",
        {
          method: "POST",
          body: pgState,
        },
      );

      connectionDetails.value = {
        wsUrl: response.url,
        token: response.accessToken,
        shouldConnect: true,
        voice: playgroundStore.sessionConfig.voice,
      };
    } catch (error) {
      isConnecting.value = false;
      throw error;
    }
  };

  const disconnect = async () => {
    connectionDetails.value = {
      ...connectionDetails.value,
      shouldConnect: false,
    };
    isConnecting.value = false;
    isConnected.value = false;
  };

  // Watch for API key changes and disconnect if key is removed
  watch(
    () => playgroundStore.geminiAPIKey,
    (newKey) => {
      if (newKey === null && connectionDetails.value.shouldConnect) {
        disconnect();
      }
    },
  );

  return {
    wsUrl: computed(() => connectionDetails.value.wsUrl),
    token: computed(() => connectionDetails.value.token),
    shouldConnect: computed(() => connectionDetails.value.shouldConnect),
    voice: computed(() => connectionDetails.value.voice),
    isConnecting: computed(() => isConnecting.value),
    isConnected: computed(() => isConnected.value),
    pgState: computed(() => ({
      sessionConfig: playgroundStore.sessionConfig,
      userPresets: playgroundStore.userPresets,
      selectedPresetId: playgroundStore.selectedPresetId,
      geminiAPIKey: playgroundStore.geminiAPIKey,
      instructions: playgroundStore.instructions,
    })),
    connect,
    disconnect,
  };
};
