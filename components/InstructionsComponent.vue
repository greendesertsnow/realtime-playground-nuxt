<template>
  <div class="p-4 bg-neutral-900/30 rounded-lg">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium text-neutral-100">Instructions</h3>
        <button
          class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          @click="resetToDefault"
        >
          Reset to Default
        </button>
      </div>

      <div class="relative">
        <textarea
          v-model="instructions"
          class="w-full h-48 p-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 resize-none focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Enter instructions for the AI assistant..."
        />
      </div>

      <div class="text-xs text-neutral-500">
        {{ instructions.length }} characters
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defaultPresets } from "~/data/presets";

// Find the default helpful AI preset
const defaultPreset = defaultPresets.find((p) => p.id === "helpful-ai");
const defaultInstructions = defaultPreset?.instructions || "";

const instructions = ref(defaultInstructions);

const resetToDefault = () => {
  instructions.value = defaultInstructions;
};

// TODO: Connect to actual playground state
// TODO: Add real-time sync with configuration
// TODO: Add validation and character limits
</script>
