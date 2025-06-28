<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button size="sm" variant="secondary">
        <Save class="w-4 h-4" />
        <span class="md:ml-2 hidden md:block">Save</span>
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[475px]">
      <DialogHeader>
        <DialogTitle>Save preset</DialogTitle>
        <DialogDescription>
          This will save the current playground settings so you can access it
          later.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="name" auto-focus auto-complete="off" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Input id="description" v-model="description" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" @click="handleSave" class="text-sm font-semibold">
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Save } from "lucide-vue-next";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { usePlaygroundStore } from "~/stores/playground";
import { defaultPresets, type Preset } from "~/data/presets";

const playgroundStore = usePlaygroundStore();

const open = ref(false);
const name = ref("");
const description = ref("");

// Get the currently selected preset
const selectedPreset = computed(() => {
  if (!playgroundStore.selectedPresetId) return null;

  // Check user presets first
  const userPreset = playgroundStore.userPresets.find(
    (p) => p.id === playgroundStore.selectedPresetId,
  );
  if (userPreset) return userPreset;

  // Check default presets
  return (
    defaultPresets.find((p) => p.id === playgroundStore.selectedPresetId) ||
    null
  );
});

// Update form fields when selected preset changes
watch(
  selectedPreset,
  (preset) => {
    if (preset) {
      name.value = preset.defaultGroup
        ? `${preset.name} (copy)`
        : preset.name || "";
      description.value = preset.description || "";
    } else {
      name.value = "";
      description.value = "";
    }
  },
  { immediate: true },
);

const handleSave = () => {
  const newPreset: Preset = {
    id:
      selectedPreset.value && !selectedPreset.value.defaultGroup
        ? selectedPreset.value.id
        : Math.random().toString(36).substr(2, 9),
    name: name.value,
    description: description.value,
    instructions: playgroundStore.instructions,
    sessionConfig: playgroundStore.sessionConfig,
    defaultGroup: undefined,
  };

  playgroundStore.saveUserPreset(newPreset);

  if (selectedPreset.value?.id !== newPreset.id) {
    playgroundStore.setSelectedPresetId(newPreset.id);
  }

  open.value = false;
};
</script>
