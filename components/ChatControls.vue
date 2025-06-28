<template>
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-2">
      <h3 class="text-lg font-medium text-neutral-100">Chat</h3>
    </div>

    <div class="flex items-center gap-2">
      <!-- Mobile configuration button -->
      <button
        class="lg:hidden p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
        @click="$emit('toggle-mobile-config')"
      >
        <Settings class="w-5 h-5" />
      </button>

      <!-- Edit instructions button -->
      <button
        v-if="showEditButton"
        class="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
        :class="{ 'text-blue-400': isEditingInstructions }"
        @click="$emit('toggle-edit')"
      >
        <Edit class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, Edit } from "lucide-vue-next";

interface Props {
  showEditButton?: boolean;
  isEditingInstructions?: boolean;
}

defineProps<Props>();

defineEmits<{
  "toggle-edit": [];
  "toggle-mobile-config": [];
}>();
</script>
