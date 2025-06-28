<template>
  <div class="flex flex-col h-dvh bg-neutral-900 text-neutral-50">
    <header
      class="flex flex-col md:flex-row flex-shrink-0 gap-3 md:h-12 items-center justify-between px-5 py-8 w-full md:mx-auto"
    >
      <div class="flex items-center gap-3">
        <LkLogo />
        <span class="h-8 border-r border-white/10"></span>
        <div class="flex gap-2 items-center">
          <GeminiLogo />
          <span class="text-[18px] pt-[3px] font-light">
            Multimodal Live Playground
          </span>
        </div>
      </div>
      <div class="inline-flex flex-row items-center space-x-2">
        <PresetSelector />
        <PresetSave />
        <PresetShare />
        <CodeViewer />
      </div>
    </header>
    <main
      class="flex flex-col flex-grow overflow-hidden p-0 pb-4 lg:pb-0 w-full md:mx-auto"
    >
      <RoomComponent />
    </main>
    <footer
      class="hidden md:flex md:items-center md:gap-2 md:justify-end font-mono uppercase text-right py-3 px-8 text-xs text-neutral-600 w-full md:mx-auto"
    >
      Built with
      <HeartIcon />
      on
      <a
        href="https://github.com/livekit/agents"
        target="_blank"
        rel="noopener noreferrer"
        class="underline"
      >
        LiveKit Agents
      </a>
      •
      <a
        href="https://github.com/livekit-examples/gemini-playground"
        target="_blank"
        rel="noopener noreferrer"
        class="underline inline-flex items-center gap-1"
      >
        <Github class="h-4 w-4" />
        View source on GitHub
      </a>
      • © 2025 LiveKit
    </footer>

    <!-- Global Auth Component -->
    <AuthComponent />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Github } from "lucide-vue-next";
import { usePlaygroundStore } from "~/stores/playground";

const playgroundStore = usePlaygroundStore();

// Initialize store on app mount
onMounted(() => {
  playgroundStore.initializeFromStorage();
  
  // Show auth dialog if no API key is set
  if (!playgroundStore.geminiAPIKey) {
    setTimeout(() => {
      playgroundStore.setShowAuthDialog(true);
    }, 1000);
  }
});

// SEO metadata
useSeoMeta({
  title: "LiveKit | Gemini Multimodal Playground",
  description:
    "Speech-to-speech playground for Google's new Gemini Multimodal Live API. Built on LiveKit Agents.",
  ogTitle: "LiveKit | Gemini Multimodal Playground",
  ogDescription:
    "Speech-to-speech playground for Google's new Gemini Multimodal Live API. Built on LiveKit Agents.",
  ogType: "website",
  ogUrl: "https://gemini-playground-xi.vercel.app/",
  ogImage: "https://gemini-playground-xi.vercel.app/og-image.png",
});
</script>
