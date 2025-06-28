export enum ModelId {
  GEMINI_2_0_FLASH_EXT = "gemini-2.0-flash-exp",
  GEMINI_2_5_FLASH_NATIVE_AUDIO = "gemini-2.5-flash-preview-native-audio-dialog",
  GEMINI_2_5_FLASH_NATIVE_AUDIO_THINKING = "gemini-2.5-flash-exp-native-audio-thinking-dialog",
  GEMINI_2_5_FLASH_LIVE = "gemini-live-2.5-flash-preview",
  GEMINI_2_0_FLASH_LIVE = "gemini-2.0-flash-live-001",
}

export interface Model {
  id: ModelId;
  name: string;
  description?: string;
}

export const models: Model[] = [
  {
    id: ModelId.GEMINI_2_5_FLASH_NATIVE_AUDIO,
    name: "Gemini 2.5 Flash Preview Native Audio Dialog",
    description: "Interactive conversational experiences with native audio dialog",
  },
  {
    id: ModelId.GEMINI_2_5_FLASH_NATIVE_AUDIO_THINKING,
    name: "Gemini 2.5 Flash Exp Native Audio Thinking Dialog", 
    description: "Native audio dialog with enhanced reasoning capabilities",
  },
  {
    id: ModelId.GEMINI_2_5_FLASH_LIVE,
    name: "Gemini Live 2.5 Flash Preview",
    description: "Low-latency bidirectional voice and video interactions",
  },
  {
    id: ModelId.GEMINI_2_0_FLASH_LIVE,
    name: "Gemini 2.0 Flash 001",
    description: "Low-latency bidirectional voice and video interactions",
  },
  {
    id: ModelId.GEMINI_2_0_FLASH_EXT,
    name: "Gemini 2.0 Flash Experimental",
    description: "Experimental version with latest features",
  },
];
