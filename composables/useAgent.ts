import { ref, computed, watch, onMounted, onUnmounted } from "vue";

// Placeholder types - these would come from livekit-client in a real implementation
interface TranscriptionSegment {
  id: string;
  text: string;
  firstReceivedTime?: number;
  lastReceivedTime?: number;
}

interface Participant {
  isAgent?: boolean;
}

interface TrackPublication {}

interface Transcription {
  segment: TranscriptionSegment;
  participant?: Participant;
  publication?: TrackPublication;
}

interface AgentData {
  displayTranscriptions: Transcription[];
  agent?: any; // RemoteParticipant type from LiveKit
}

// Global state for agent (since this would normally come from LiveKit room context)
const agentState = ref<AgentData>({
  displayTranscriptions: [],
  agent: undefined,
});

const rawSegments = ref<{ [id: string]: Transcription }>({});

export const useAgent = () => {
  // TODO: This would integrate with actual LiveKit SDK in a real implementation
  // For now, providing a placeholder structure

  const updateRawSegments = (
    segments: TranscriptionSegment[],
    participant?: Participant,
    publication?: TrackPublication,
  ) => {
    const newSegments = { ...rawSegments.value };
    for (const segment of segments) {
      newSegments[segment.id] = { segment, participant, publication };
    }
    rawSegments.value = newSegments;
  };

  const registerRpcMethod = (
    methodName: string,
    handler: (data: any) => Promise<string>,
  ) => {
    // TODO: Implement RPC method registration with LiveKit
    console.log(`RPC method registered: ${methodName}`);
  };

  // Process and merge transcription segments
  watch(
    rawSegments,
    (segments) => {
      const sorted = Object.values(segments).sort(
        (a, b) =>
          (a.segment.firstReceivedTime ?? 0) -
          (b.segment.firstReceivedTime ?? 0),
      );

      const mergedSorted = sorted.reduce((acc, current) => {
        if (acc.length === 0) {
          return [current];
        }

        const last = acc[acc.length - 1];
        if (
          last.participant === current.participant &&
          last.participant?.isAgent &&
          (current.segment.firstReceivedTime ?? 0) -
            (last.segment.lastReceivedTime ?? 0) <=
            1000 &&
          !last.segment.id.startsWith("status-") &&
          !current.segment.id.startsWith("status-")
        ) {
          // Merge segments from the same participant if they're within 1 second of each other
          return [
            ...acc.slice(0, -1),
            {
              ...current,
              segment: {
                ...current.segment,
                text: `${last.segment.text} ${current.segment.text}`,
                id: current.segment.id,
                firstReceivedTime: last.segment.firstReceivedTime,
              },
            },
          ];
        } else {
          return [...acc, current];
        }
      }, [] as Transcription[]);

      agentState.value.displayTranscriptions = mergedSorted;
    },
    { deep: true },
  );

  // Clear transcriptions when connection changes
  const clearTranscriptions = () => {
    rawSegments.value = {};
    agentState.value.displayTranscriptions = [];
  };

  // Setup toast RPC method
  onMounted(() => {
    registerRpcMethod("pg.toast", async (data: any) => {
      // TODO: Integrate with actual toast system
      const { title, description, variant } = JSON.parse(data.payload);
      console.log("Toast:", title, description, variant);
      return JSON.stringify({ shown: true });
    });
  });

  return {
    displayTranscriptions: computed(
      () => agentState.value.displayTranscriptions,
    ),
    agent: computed(() => agentState.value.agent),
    updateRawSegments,
    clearTranscriptions,
    registerRpcMethod,
  };
};

// Provider-like function for setting up agent context
export const provideAgent = () => {
  return useAgent();
};
