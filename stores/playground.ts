import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  PlaygroundState,
  SessionConfig,
  Preset,
} from "~/data/playground-state";
import {
  defaultPlaygroundState,
  defaultSessionConfig,
} from "~/data/playground-state";
import { defaultPresets } from "~/data/presets";

// LocalStorage keys
const LS_GEMINI_API_KEY_NAME = "GEMINI_API_KEY";
const LS_USER_PRESETS_KEY = "PG_USER_PRESETS";
const LS_SELECTED_PRESET_ID_KEY = "PG_SELECTED_PRESET_ID";

// Helper functions for localStorage
const presetStorageHelper = {
  getStoredPresets: (): Preset[] => {
    if (process.client) {
      const storedPresets = localStorage.getItem(LS_USER_PRESETS_KEY);
      return storedPresets ? JSON.parse(storedPresets) : [];
    }
    return [];
  },
  setStoredPresets: (presets: Preset[]): void => {
    if (process.client) {
      localStorage.setItem(LS_USER_PRESETS_KEY, JSON.stringify(presets));
    }
  },
  getStoredSelectedPresetId: (): string => {
    if (process.client) {
      return (
        localStorage.getItem(LS_SELECTED_PRESET_ID_KEY) || defaultPresets[0].id
      );
    }
    return defaultPresets[0].id;
  },
  setStoredSelectedPresetId: (presetId: string | null): void => {
    if (process.client) {
      if (presetId !== null) {
        localStorage.setItem(LS_SELECTED_PRESET_ID_KEY, presetId);
      } else {
        localStorage.removeItem(LS_SELECTED_PRESET_ID_KEY);
      }
    }
  },
  getStoredApiKey: (): string | null => {
    if (process.client) {
      return localStorage.getItem(LS_GEMINI_API_KEY_NAME);
    }
    return null;
  },
  setStoredApiKey: (apiKey: string | null): void => {
    if (process.client) {
      if (apiKey) {
        localStorage.setItem(LS_GEMINI_API_KEY_NAME, apiKey);
      } else {
        localStorage.removeItem(LS_GEMINI_API_KEY_NAME);
      }
    }
  },
};

export const usePlaygroundStore = defineStore("playground", () => {
  // State
  const sessionConfig = ref<SessionConfig>({ ...defaultSessionConfig });
  const userPresets = ref<Preset[]>([]);
  const selectedPresetId = ref<string | null>(defaultPresets[0].id);
  const geminiAPIKey = ref<string | null>(null);
  const instructions = ref<string>(defaultPlaygroundState.instructions);
  const showAuthDialog = ref<boolean>(false);

  // Computed
  const selectedPreset = computed<Preset | undefined>(() => {
    return [...defaultPresets, ...userPresets.value].find(
      (preset) => preset.id === selectedPresetId.value,
    );
  });

  const allPresets = computed<Preset[]>(() => [
    ...defaultPresets,
    ...userPresets.value,
  ]);

  // Actions
  const setSessionConfig = (config: Partial<SessionConfig>) => {
    sessionConfig.value = {
      ...sessionConfig.value,
      ...config,
    };
  };

  const setApiKey = (apiKey: string | null) => {
    geminiAPIKey.value = apiKey;
    presetStorageHelper.setStoredApiKey(apiKey);
  };

  const setInstructions = (newInstructions: string) => {
    instructions.value = newInstructions;
  };

  const setUserPresets = (presets: Preset[]) => {
    userPresets.value = presets;
  };

  const setSelectedPresetId = (presetId: string | null) => {
    presetStorageHelper.setStoredSelectedPresetId(presetId);
    selectedPresetId.value = presetId;

    // Update instructions and session config based on selected preset
    const preset = selectedPreset.value;
    if (preset) {
      instructions.value = preset.instructions || "";
      sessionConfig.value = preset.sessionConfig || defaultSessionConfig;
    }
  };

  const saveUserPreset = (preset: Preset) => {
    const updatedPresets = userPresets.value.map((p) =>
      p.id === preset.id ? preset : p,
    );

    if (!updatedPresets.some((p) => p.id === preset.id)) {
      updatedPresets.push(preset);
    }

    userPresets.value = updatedPresets;
    presetStorageHelper.setStoredPresets(updatedPresets);
  };

  const deleteUserPreset = (presetId: string) => {
    const updatedPresets = userPresets.value.filter(
      (preset) => preset.id !== presetId,
    );
    userPresets.value = updatedPresets;
    presetStorageHelper.setStoredPresets(updatedPresets);
  };

  const setShowAuthDialog = (show: boolean) => {
    showAuthDialog.value = show;
  };

  // Initialize store from localStorage
  const initializeFromStorage = () => {
    if (!process.client) return;

    // Load API key
    const storedKey = presetStorageHelper.getStoredApiKey();
    if (storedKey && storedKey.length >= 1) {
      geminiAPIKey.value = storedKey;
    } else {
      geminiAPIKey.value = null;
      showAuthDialog.value = true;
    }

    // Load user presets
    const storedPresets = presetStorageHelper.getStoredPresets();
    userPresets.value = storedPresets;

    // Load selected preset
    const storedSelectedPresetId =
      presetStorageHelper.getStoredSelectedPresetId();
    selectedPresetId.value = storedSelectedPresetId;

    // Update instructions and config based on selected preset
    const preset = selectedPreset.value;
    if (preset) {
      instructions.value = preset.instructions || "";
      sessionConfig.value = preset.sessionConfig || defaultSessionConfig;
    }
  };

  // URL handling helpers
  const encodeToUrlParams = (): string => {
    const params = new URLSearchParams();

    let isDefaultPreset = false;
    const preset = selectedPreset.value;
    if (preset) {
      params.set("preset", preset.id);
      isDefaultPreset = !!preset.defaultGroup;
    }

    if (!isDefaultPreset) {
      if (instructions.value) {
        params.set("instructions", instructions.value);
      }

      if (preset) {
        params.set("presetName", preset.name);
        if (preset.description) {
          params.set("presetDescription", preset.description);
        }
      }

      if (sessionConfig.value) {
        Object.entries(sessionConfig.value).forEach(([key, value]) => {
          if (value !== defaultSessionConfig[key as keyof SessionConfig]) {
            params.set(`sessionConfig.${key}`, String(value));
          }
        });
      }
    }
    return params.toString();
  };

  const updateBrowserUrl = () => {
    if (process.client) {
      const params = encodeToUrlParams();
      const newUrl = `${window.location.origin}${window.location.pathname}${params ? `?${params}` : ""}`;
      window.history.replaceState({}, "", newUrl);
    }
  };

  return {
    // State
    sessionConfig: readonly(sessionConfig),
    userPresets: readonly(userPresets),
    selectedPresetId: readonly(selectedPresetId),
    geminiAPIKey: readonly(geminiAPIKey),
    instructions: readonly(instructions),
    showAuthDialog: readonly(showAuthDialog),

    // Computed
    selectedPreset,
    allPresets,

    // Actions
    setSessionConfig,
    setApiKey,
    setInstructions,
    setUserPresets,
    setSelectedPresetId,
    saveUserPreset,
    deleteUserPreset,
    setShowAuthDialog,
    initializeFromStorage,
    updateBrowserUrl,
  };
});
