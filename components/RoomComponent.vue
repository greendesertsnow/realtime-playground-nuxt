<template>
  <div
    class="flex flex-col px-4 md:grid md:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr] flex-grow overflow-hidden"
  >
    <!-- Configuration sidebar (hidden on mobile) -->
    <div class="hidden lg:block h-full overflow-y-auto relative pr-4">
      <ConfigurationForm />
    </div>

    <!-- Main chat area -->
    <div
      class="w-full flex flex-col h-full mx-auto rounded-2xl bg-neutral-950 border border-neutral-800"
    >
      <ChatComponent />
    </div>

    <!-- Audio elements for LiveKit -->
    <div class="hidden">
      <audio ref="audioElement" autoplay playsinline />
      <div
        v-if="needsAudioPermission"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <button
          @click="enableAudio"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Click to allow audio playback
        </button>
      </div>
      <div
        v-if="needsMicrophoneSetup && isConnected"
        class="fixed bottom-4 right-4 bg-yellow-600 text-white p-4 rounded-lg shadow-lg z-50"
      >
        <p class="text-sm mb-2">Microphone setup needed</p>
        <button
          @click="setupMicrophone"
          class="px-4 py-2 bg-white text-yellow-600 rounded hover:bg-gray-100"
        >
          Enable Microphone
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  Room,
  RoomEvent,
  RemoteAudioTrack,
  RemoteVideoTrack,
} from "livekit-client";
import { useConnection, setConnectionState } from "~/composables/useConnection";
import { useAgent } from "~/composables/useAgent";
import { setGlobalRoom } from "~/composables/useLiveKit";

const { wsUrl, token, shouldConnect } = useConnection();
const agent = useAgent();

const room = ref<Room | null>(null);
const audioElement = ref<HTMLAudioElement | null>(null);
const needsAudioPermission = ref(false);
const needsMicrophoneSetup = ref(false);
const isConnected = ref(false);

const connectToRoom = async () => {
  if (!wsUrl.value || !token.value || !shouldConnect.value) {
    return;
  }

  try {
    // Set connecting state
    setConnectionState(true, false);
    
    if (room.value) {
      await room.value.disconnect();
    }

    room.value = new Room({
      publishDefaults: {
        stopMicTrackOnMute: true,
      },
    });

    // Set up room event handlers
    room.value.on(RoomEvent.Connected, () => {
      console.log("Connected to LiveKit room");
      isConnected.value = true;
      setConnectionState(false, true); // No longer connecting, now connected
      setGlobalRoom(room.value);
    });

    room.value.on(RoomEvent.Disconnected, () => {
      console.log("Disconnected from LiveKit room");
      isConnected.value = false;
      setConnectionState(false, false); // Not connecting, not connected
      setGlobalRoom(null);
    });

    room.value.on(
      RoomEvent.TrackSubscribed,
      (track, publication, participant) => {
        console.log("Track subscribed:", track.kind, participant.identity);

        if (track instanceof RemoteAudioTrack && audioElement.value) {
          track.attach(audioElement.value);
        }
      },
    );

    room.value.on(
      RoomEvent.TrackUnsubscribed,
      (track, publication, participant) => {
        console.log("Track unsubscribed:", track.kind, participant.identity);

        if (track instanceof RemoteAudioTrack && audioElement.value) {
          track.detach(audioElement.value);
        }
      },
    );

    // Handle transcription events
    room.value.on(
      RoomEvent.TranscriptionReceived,
      (segments, participant, publication) => {
        console.log("Transcription received:", segments, participant?.identity);
        agent.updateRawSegments(segments, participant, publication);
      },
    );

    // Handle RPC method registration
    room.value.localParticipant.registerRpcMethod("pg.toast", async (data) => {
      try {
        const { title, description, variant } = JSON.parse(data.payload);
        console.log("Toast RPC:", title, description, variant);
        return JSON.stringify({ shown: true });
      } catch (error) {
        console.error("Error handling toast RPC:", error);
        return JSON.stringify({ error: "Failed to parse payload" });
      }
    });

    // Handle participant events
    room.value.on(RoomEvent.ParticipantConnected, (participant) => {
      console.log("Participant connected:", participant.identity);
      if (participant.isAgent) {
        console.log("Agent participant connected");
      }
    });

    // Debug: Log when local audio starts/stops
    room.value.on(RoomEvent.LocalTrackPublished, (publication, participant) => {
      console.log(
        "Local track published:",
        publication.kind,
        publication.source,
      );
    });

    room.value.on(
      RoomEvent.LocalTrackUnpublished,
      (publication, participant) => {
        console.log(
          "Local track unpublished:",
          publication.kind,
          publication.source,
        );
      },
    );

    // Debug: Log when audio starts/stops being received
    room.value.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      console.log(
        "Active speakers changed:",
        speakers.map((s) => s.identity),
      );
    });

    // Connect to the room
    await room.value.connect(wsUrl.value, token.value);

    // Enable local audio with direct track creation to avoid DataCloneError
    try {
      console.log("Creating microphone track directly...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const [audioTrack] = stream.getAudioTracks();
      if (audioTrack) {
        await room.value.localParticipant.publishTrack(audioTrack, {
          source: "microphone",
        });
        console.log("✅ Microphone track published successfully!");
      }
    } catch (micError) {
      console.warn("Could not enable microphone automatically:", micError);
      needsMicrophoneSetup.value = true;
    }

    console.log("Room connection established");
  } catch (error) {
    console.error("Failed to connect to room:", error);
    setConnectionState(false, false); // Connection failed
    throw error;
  }
};

const disconnectFromRoom = async () => {
  if (room.value) {
    await room.value.disconnect();
    room.value = null;
    isConnected.value = false;
    setConnectionState(false, false);
    setGlobalRoom(null);
  }
};

const enableAudio = () => {
  if (audioElement.value) {
    audioElement.value
      .play()
      .then(() => {
        needsAudioPermission.value = false;
      })
      .catch(() => {
        console.warn("Could not enable audio playback");
      });
  }
};


const setupMicrophone = async () => {
  if (!room.value) return;

  console.log("🎤 Starting microphone setup...");

  // First check if we have microphone permissions
  try {
    const permissions = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    console.log("Microphone permission state:", permissions.state);
  } catch (e) {
    console.log("Could not check microphone permissions");
  }

  // Check if media devices are available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.error("Media devices not available");
    alert("Microphone access not available in this browser");
    return;
  }

  try {
    console.log("Requesting microphone access...");

    // Direct media access first - this should prompt for permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    console.log("Got microphone stream:", stream);
    console.log("Audio tracks:", stream.getAudioTracks());

    const [audioTrack] = stream.getAudioTracks();
    if (audioTrack) {
      console.log("Publishing audio track...");
      await room.value.localParticipant.publishTrack(audioTrack, {
        source: "microphone",
      });
      needsMicrophoneSetup.value = false;
      console.log("✅ Microphone enabled successfully!");
    } else {
      console.error("No audio track found in stream");
    }
  } catch (error) {
    console.error("❌ Failed to setup microphone:", error);

    if (error.name === "NotAllowedError") {
      alert(
        "Microphone access denied. Please allow microphone access in your browser settings and try again.",
      );
    } else if (error.name === "NotFoundError") {
      alert("No microphone found. Please connect a microphone and try again.");
    } else {
      alert(`Microphone error: ${error.message}`);
    }
  }
};

// Watch for connection changes
watch(shouldConnect, async (newValue) => {
  if (newValue && wsUrl.value && token.value) {
    await connectToRoom();
  } else {
    await disconnectFromRoom();
  }
});

// Check if audio permission is needed
onMounted(() => {
  // Detect if user interaction is needed for audio
  const detectAudioPermission = () => {
    if (audioElement.value) {
      const playPromise = audioElement.value.play();
      if (playPromise) {
        playPromise.catch(() => {
          needsAudioPermission.value = true;
        });
      }
    }
  };

  nextTick(() => {
    detectAudioPermission();
  });
});

onUnmounted(() => {
  disconnectFromRoom();
});

// Provide room context for child components
provide("livekitRoom", room);
provide("livekitAgent", agent);
</script>
