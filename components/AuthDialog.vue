<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent
      class="sm:max-w-md p-0 border-0 rounded-lg overflow-hidden max-h-[90vh] flex flex-col"
    >
      <div class="overflow-y-auto">
        <div class="px-6 pb-6 pt-4 overflow-y-auto">
          <form @submit="onSubmit" class="flex flex-col gap-4">
            <DialogHeader class="gap-2">
              <DialogTitle>
                Gemini 2.0 Multimodal Live API Playground
              </DialogTitle>
              <DialogDescription>
                Try out Google's new Gemini 2.0 Multimodal Live API right from
                your browser with this playground built on
                <a
                  href="https://github.com/livekit/agents"
                  target="_blank"
                  class="underline"
                >
                  LiveKit Agents </a
                >.
              </DialogDescription>
              <DialogDescription>
                You must have a valid
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  class="underline text-gemini-blue"
                >
                  Gemini API key
                </a>
                to connect the playground to your own Gemini platform account.
              </DialogDescription>
            </DialogHeader>

            <div class="bg-black/10 h-[1px] w-full" />

            <!-- API Key Input -->
            <div class="space-y-2">
              <div class="flex flex-col gap-2">
                <label class="font-semibold text-sm whitespace-nowrap">
                  Enter your
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    class="inline-flex items-center text-gemini-blue underline"
                  >
                    Gemini API Key
                    <ArrowUpRight class="h-4 w-4 ml-1" />
                  </a>
                </label>
                <div class="flex gap-2 w-full">
                  <input
                    v-model="apiKey"
                    type="password"
                    placeholder="Gemini API Key"
                    class="w-full p-2 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <Button type="submit" :disabled="!apiKey.trim()">
                    Connect
                  </Button>
                </div>
              </div>
              <div v-if="error" class="text-red-400 text-sm">
                {{ error }}
              </div>
            </div>

            <DialogDescription
              class="text-xs py-2 flex justify-between items-center"
            >
              <div class="flex items-center gap-2 flex-1">
                <LockKeyhole class="h-3 w-3 flex-shrink-0" />
                <span class="font-semibold">
                  Your key is stored only in your browser's LocalStorage.
                </span>
              </div>

              <div class="flex items-center flex-1 justify-end">
                <a
                  href="https://github.com/livekit-examples/gemini-playground"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="underline flex items-center gap-1"
                >
                  <Github class="h-5 w-5" />
                  View source on GitHub
                </a>
              </div>
            </DialogDescription>
          </form>
        </div>
        <div class="h-[45vh] sm:h-0"></div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ArrowUpRight, LockKeyhole, Github } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "~/stores/playground";

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "auth-complete": [];
}>();

const playgroundStore = usePlaygroundStore();

const apiKey = ref("");
const error = ref("");

// Watch for API key changes from store
watch(
  () => playgroundStore.geminiAPIKey,
  (newKey) => {
    if (newKey) {
      apiKey.value = newKey;
    }
  },
  { immediate: true },
);

const onSubmit = (e: Event) => {
  e.preventDefault();

  if (!apiKey.value.trim()) {
    error.value = "API key is required";
    return;
  }

  error.value = "";
  playgroundStore.setApiKey(apiKey.value.trim());
  emit("update:open", false);
  emit("auth-complete");
};
</script>

<style scoped>
.text-gemini-blue {
  color: #5282ed;
}
</style>
