<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button size="sm" variant="secondary">
        <Share class="h-4 w-4" />
        <span class="ml-2 hidden md:block">Share</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-[520px]">
      <div class="flex flex-col space-y-2 text-center sm:text-left">
        <h3 class="text-lg font-semibold">Share Preset</h3>
        <p class="text-sm text-muted-foreground">
          Anyone with this link and their own Gemini API key can try what you've
          come up with.
        </p>
      </div>
      <div class="flex items-center space-x-2 pt-4">
        <div class="grid flex-1 gap-2">
          <Label for="link" class="sr-only"> Link </Label>
          <Input id="link" :value="shareLink" readonly class="h-9" />
        </div>
        <Button type="button" size="sm" class="px-3" @click="handleCopy">
          <Copy class="h-4 w-4" />
          <span class="text-sm font-semibold ml-1">
            {{ copied ? "Copied!" : "Copy" }}
          </span>
        </Button>
      </div>
      <p class="bg-black/5 text-xs rounded-sm py-2 px-2 mt-4 flex gap-2">
        <Lock class="h-3 w-3" />
        Your Gemini API key will not be shared.
      </p>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Copy, Share } from "lucide-vue-next";
import { Lock } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { usePlaygroundStore } from "~/stores/playground";

const playgroundStore = usePlaygroundStore();
const copied = ref(false);

// Computed share link
const shareLink = computed(() => {
  if (process.client) {
    // Create URL parameters from current playground state
    const params = encodePlaygroundStateToUrl(playgroundStore.$state);
    return `${window.location.origin}${window.location.pathname}${params ? `?${params}` : ""}`;
  }
  return "";
});

// Helper function to encode playground state to URL parameters
// TODO: This should be moved to a helper utility
const encodePlaygroundStateToUrl = (state: any) => {
  try {
    const urlParams = new URLSearchParams();

    // Only include non-default values to keep URLs clean
    if (state.selectedPresetId && state.selectedPresetId !== "helpful-ai") {
      urlParams.set("preset", state.selectedPresetId);
    }

    if (
      state.instructions &&
      state.instructions !== playgroundStore.defaultInstructions
    ) {
      urlParams.set("instructions", encodeURIComponent(state.instructions));
    }

    // Add session config if different from defaults
    const { sessionConfig } = state;
    if (sessionConfig) {
      if (sessionConfig.voice && sessionConfig.voice !== "Puck") {
        urlParams.set("voice", sessionConfig.voice);
      }
      if (sessionConfig.temperature && sessionConfig.temperature !== 0.8) {
        urlParams.set("temperature", sessionConfig.temperature.toString());
      }
      if (
        sessionConfig.model &&
        sessionConfig.model !== "gemini-2.0-flash-exp"
      ) {
        urlParams.set("model", sessionConfig.model);
      }
      if (
        sessionConfig.modalities &&
        sessionConfig.modalities !== "audio_only"
      ) {
        urlParams.set("modalities", sessionConfig.modalities);
      }
      if (sessionConfig.maxOutputTokens) {
        urlParams.set("maxTokens", sessionConfig.maxOutputTokens.toString());
      }
    }

    return urlParams.toString();
  } catch (error) {
    console.error("Error encoding playground state to URL:", error);
    return "";
  }
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = shareLink.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};
</script>
