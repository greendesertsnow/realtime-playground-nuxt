<template>
  <div class="p-4 space-y-6 bg-neutral-900/50 rounded-lg">
    <h2 class="text-lg font-semibold text-neutral-100">Configuration</h2>

    <!-- Model Selection -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-neutral-300">Model</label>
      <select
        v-model="config.model"
        class="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
      >
        <option v-for="model in models" :key="model.id" :value="model.id">
          {{ model.name }}
        </option>
      </select>
    </div>

    <!-- Voice Selection -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-neutral-300">Voice</label>
      <select
        v-model="config.voice"
        class="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
      >
        <option v-for="voice in voices" :key="voice.id" :value="voice.id">
          {{ voice.name }}
        </option>
      </select>
    </div>

    <!-- Modalities Selection -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-neutral-300">Modalities</label>
      <select
        v-model="config.modalities"
        class="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
      >
        <option
          v-for="modality in modalities"
          :key="modality.id"
          :value="modality.id"
        >
          {{ modality.name }}
        </option>
      </select>
    </div>

    <!-- Temperature -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-neutral-300">
        Temperature: {{ config.temperature }}
      </label>
      <input
        v-model="config.temperature"
        type="range"
        min="0.6"
        max="1.2"
        step="0.1"
        class="w-full"
      />
    </div>

    <!-- Max Output Tokens -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-neutral-300"
        >Max Output Tokens</label
      >
      <input
        v-model="config.maxOutputTokens"
        type="number"
        placeholder="Unlimited"
        class="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { models } from "~/data/models";
import { voices } from "~/data/voices";
import { modalities } from "~/data/modalities";
import { defaultSessionConfig } from "~/data/playground-state";

// Configuration state
const config = reactive({ ...defaultSessionConfig });

// TODO: Implement form validation with VeeValidate + Zod
// TODO: Add debounced updates to prevent spam
// TODO: Connect to actual session configuration
// TODO: Add toast notifications for feedback
</script>
