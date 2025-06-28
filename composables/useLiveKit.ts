import { ref, computed, onMounted, onUnmounted, watch, inject } from "vue";
import {
  Room,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RoomEvent,
  ParticipantEvent,
  LocalParticipant,
  RemoteParticipant,
  ConnectionState,
} from "livekit-client";

// Global state for room management
const globalRoom = ref<Room | null>(null);
const globalIsConnected = ref(false);
const globalLocalParticipant = ref<LocalParticipant | null>(null);
const globalRemoteParticipants = ref<RemoteParticipant[]>([]);

// Function to set the global room (called from RoomComponent)
export const setGlobalRoom = (room: Room | null) => {
  globalRoom.value = room;
  if (room) {
    globalLocalParticipant.value = room.localParticipant;
    globalIsConnected.value = room.state === ConnectionState.Connected;
    globalRemoteParticipants.value = Array.from(room.remoteParticipants.values());
    
    // Set up event listeners for state management
    room.on(RoomEvent.Connected, () => {
      globalIsConnected.value = true;
      globalLocalParticipant.value = room.localParticipant;
    });

    room.on(RoomEvent.Disconnected, () => {
      globalIsConnected.value = false;
      globalLocalParticipant.value = null;
      globalRemoteParticipants.value = [];
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      globalRemoteParticipants.value.push(participant);
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      globalRemoteParticipants.value = globalRemoteParticipants.value.filter(
        (p) => p !== participant,
      );
    });
  } else {
    globalLocalParticipant.value = null;
    globalIsConnected.value = false;
    globalRemoteParticipants.value = [];
  }
};

export const useLiveKit = () => {
  // Use injected room if available, otherwise use global
  const injectedRoom = inject<Room | null>('livekitRoom', null);
  const room = computed(() => injectedRoom || globalRoom.value);
  
  const connect = async (wsUrl: string, token: string) => {
    // This is handled by RoomComponent now
    throw new Error('Connect should be handled by RoomComponent');
  };

  const disconnect = async () => {
    if (room.value) {
      await room.value.disconnect();
    }
  };

  const toggleMicrophone = async () => {
    const roomInstance = globalRoom.value;
    if (!roomInstance || !roomInstance.localParticipant) {
      console.error('No room or local participant available');
      return;
    }
    
    const participant = roomInstance.localParticipant;
    const isCurrentlyEnabled = participant.isMicrophoneEnabled;
    
    console.log('Toggling microphone, currently enabled:', isCurrentlyEnabled);
    
    try {
      if (isCurrentlyEnabled) {
        // Mute: disable the microphone
        console.log('Muting microphone...');
        await participant.setMicrophoneEnabled(false);
        console.log('Microphone muted');
      } else {
        // Unmute: enable the microphone
        console.log('Unmuting microphone...');
        await participant.setMicrophoneEnabled(true);
        console.log('Microphone unmuted');
      }
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
      
      // Fallback: try manual track management
      try {
        if (isCurrentlyEnabled) {
          // Manual mute
          const micTrack = participant.getTrackPublication(Track.Source.Microphone);
          if (micTrack) {
            await micTrack.mute();
          }
        } else {
          // Manual unmute or create new track
          const micTrack = participant.getTrackPublication(Track.Source.Microphone);
          if (micTrack && micTrack.isMuted) {
            await micTrack.unmute();
          } else {
            // Create new track
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              }
            });
            
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
              await participant.publishTrack(audioTrack, {
                source: Track.Source.Microphone,
              });
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback microphone toggle also failed:', fallbackError);
        throw fallbackError;
      }
    }
  };

  const isMicrophoneEnabled = computed(
    () => globalRoom.value?.localParticipant?.isMicrophoneEnabled ?? false,
  );

  return {
    room,
    isConnected: computed(() => globalIsConnected.value),
    localParticipant: computed(() => globalLocalParticipant.value || room.value?.localParticipant || null),
    remoteParticipants: computed(() => globalRemoteParticipants.value),
    isMicrophoneEnabled,
    connect,
    disconnect,
    toggleMicrophone,
  };
};

export const useMediaDevices = () => {
  const devices = ref<MediaDeviceInfo[]>([]);
  const activeDeviceId = ref<string>("");

  const getDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      devices.value = deviceList.filter(
        (device) => device.kind === "audioinput",
      );

      if (devices.value.length > 0 && !activeDeviceId.value) {
        activeDeviceId.value = devices.value[0].deviceId;
      }
    } catch (error) {
      console.error("Failed to enumerate devices:", error);
    }
  };

  const setActiveDevice = async (deviceId: string) => {
    const participant = globalLocalParticipant.value || globalRoom.value?.localParticipant;
    if (!participant) return;
    
    try {
      // Try the standard device switching method first
      await participant.switchActiveDevice("audioinput", deviceId);
      activeDeviceId.value = deviceId;
    } catch (error) {
      console.warn("Standard device switch failed, trying manual approach:", error);
      
      try {
        // Manual device switching approach
        const wasEnabled = participant.isMicrophoneEnabled;
        
        // Unpublish current track if exists
        const currentTrack = participant.getTrackPublication(Track.Source.Microphone);
        if (currentTrack) {
          await participant.unpublishTrack(Track.Source.Microphone);
        }
        
        // Create new track with the specific device
        if (wasEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { deviceId: { exact: deviceId } },
          });
          
          const audioTrack = stream.getAudioTracks()[0];
          if (audioTrack) {
            await participant.publishTrack(audioTrack, {
              source: Track.Source.Microphone,
            });
            activeDeviceId.value = deviceId;
          }
        } else {
          // Just update the device ID for when they enable later
          activeDeviceId.value = deviceId;
        }
      } catch (manualError) {
        console.error("Manual device switch also failed:", manualError);
        throw manualError;
      }
    }
  };

  onMounted(() => {
    getDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
  });

  onUnmounted(() => {
    navigator.mediaDevices.removeEventListener("devicechange", getDevices);
  });

  return {
    devices: computed(() => devices.value),
    activeDeviceId: computed(() => activeDeviceId.value),
    setActiveDevice,
    refreshDevices: getDevices,
  };
};

export const useAudioAnalyzer = () => {
  const audioLevels = ref<number[]>(new Array(8).fill(0));
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array | null = null;
  let animationId: number | null = null;

  const startAnalyzing = (track: MediaStreamTrack) => {
    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(
        new MediaStream([track]),
      );

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 32;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevels = () => {
        if (analyser && dataArray) {
          analyser.getByteFrequencyData(dataArray);

          // Convert frequency data to visual levels
          const levels = [];
          const binsPerBar = Math.floor(dataArray.length / 8);

          for (let i = 0; i < 8; i++) {
            let sum = 0;
            for (let j = 0; j < binsPerBar; j++) {
              const index = i * binsPerBar + j;
              if (index < dataArray.length) {
                sum += dataArray[index];
              }
            }
            const average = sum / binsPerBar;
            levels.push(Math.max(2, (average / 255) * 20));
          }

          audioLevels.value = levels;
        }

        animationId = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (error) {
      console.error("Failed to start audio analysis:", error);
    }
  };

  const stopAnalyzing = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    analyser = null;
    dataArray = null;
    audioLevels.value = new Array(8).fill(2);
  };

  onUnmounted(() => {
    stopAnalyzing();
  });

  return {
    audioLevels: computed(() => audioLevels.value),
    startAnalyzing,
    stopAnalyzing,
  };
};
