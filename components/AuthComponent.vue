<template>
  <div>
    <!-- API Key Display -->
    <div
      v-if="playgroundStore.geminiAPIKey"
      class="text-xs flex gap-2 items-center"
    >
      <span class="font-semibold text-neutral-400"> Using Gemini API Key </span>
      <div class="py-1 px-2 rounded-md bg-neutral-200 text-neutral-600">
        {{ ellipsisMiddle(playgroundStore.geminiAPIKey, 4, 4) }}
      </div>
      <a class="hover:underline cursor-pointer" @click="onLogout"> Clear </a>
    </div>

    <!-- Auth Dialog -->
    <AuthDialog
      :open="playgroundStore.showAuthDialog"
      @update:open="playgroundStore.setShowAuthDialog"
      @auth-complete="onAuthComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { usePlaygroundStore } from "~/stores/playground";
import { ellipsisMiddle } from "~/lib/utils";

const playgroundStore = usePlaygroundStore();

const onLogout = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  playgroundStore.setApiKey(null);
  playgroundStore.setShowAuthDialog(true);
};

const onAuthComplete = () => {
  playgroundStore.setShowAuthDialog(false);
};

// Initialize store from localStorage on mount
onMounted(() => {
  playgroundStore.initializeFromStorage();
});
</script>
