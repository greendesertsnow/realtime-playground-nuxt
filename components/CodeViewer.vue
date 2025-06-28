<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm" variant="primary" class="relative">
        <Rocket class="h-5 w-5" />
        <span class="sm:ml-2 hidden sm:block">Build with LiveKit</span>
        <span class="ml-2 sm:hidden">Build</span>
      </Button>
    </DialogTrigger>
    <DialogContent
      class="sm:max-w-6xl w-[95vw] flex flex-col mx-auto h-[90vh] max-h-[90vh]"
    >
      <DialogHeader>
        <DialogTitle>
          Build your own AI Agent with LiveKit & Gemini
        </DialogTitle>
        <DialogDescription>
          Use the starter code below with
          <a
            class="underline"
            :href="docsLink"
            target="_blank"
            rel="noopener noreferrer"
          >
            LiveKit Agents
          </a>
          to get started with the Gemini Multimodal Live API.
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-col h-full overflow-hidden group relative">
        <Button
          class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-white hover:text-black bg-white text-black"
          @click="handleCopy"
        >
          {{ copied ? "Copied!" : "Copy" }}
        </Button>
        <div class="h-full overflow-auto">
          <pre
            class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto"
          ><code>{{ pythonCode }}</code></pre>
        </div>
      </div>
      <div class="mt-4 flex justify-end flex-shrink-0">
        <Button as-child variant="default">
          <a href="https://docs.livekit.io/agents" target="_blank">
            <ArrowUpRight class="h-5 w-5 mr-2" />
            Get building!
          </a>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Rocket, ArrowUpRight } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { usePlaygroundStore } from "~/stores/playground";

const playgroundStore = usePlaygroundStore();
const copied = ref(false);
const language = ref<"python" | "typescript">("python");

// Helper function to format instructions for code generation
const formatInstructions = (
  instructions: string,
  maxLineLength = 80,
): string => {
  return instructions
    .split(/\s+/)
    .reduce(
      (lines, word) => {
        if ((lines[lines.length - 1] + " " + word).length <= maxLineLength) {
          lines[lines.length - 1] +=
            (lines[lines.length - 1] ? " " : "") + word;
        } else {
          lines.push(word);
        }
        return lines;
      },
      [""],
    )
    .join("\n");
};

// Generate Python code based on current playground state
const pythonCode = computed(() => {
  const instructions = formatInstructions(
    playgroundStore.instructions.replace(/"/g, '\\"'),
  );

  const maxTokens =
    playgroundStore.sessionConfig.maxOutputTokens === null
      ? '"inf"'
      : playgroundStore.sessionConfig.maxOutputTokens;

  const modalities = (() => {
    switch (playgroundStore.sessionConfig.modalities) {
      case "text_and_audio":
        return '["TEXT", "AUDIO"]';
      case "audio_only":
        return '["AUDIO"]';
      default:
        return '["TEXT"]';
    }
  })();

  return `from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, WorkerType, cli, multimodal
from livekit.plugins import google

async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    agent = multimodal.MultimodalAgent(
        model=google.beta.realtime.RealtimeModel(
            instructions="""${instructions}""",
            voice="${playgroundStore.sessionConfig.voice}",
            temperature=${playgroundStore.sessionConfig.temperature},
            max_response_output_tokens=${maxTokens},
            modalities=${modalities},
        )
    )
    agent.start(ctx.room)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))`;
});

const docsLink = computed(() => {
  return language.value === "python"
    ? "https://github.com/livekit/agents"
    : "https://github.com/livekit/agents-js";
});

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(pythonCode.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = pythonCode.value;
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
