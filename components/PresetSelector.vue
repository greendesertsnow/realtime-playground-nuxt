<template>
  <div>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          size="sm"
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="flex-1 justify-between md:max-w-[200px] lg:max-w-[300px]"
        >
          <div class="flex items-center">
            <component
              v-if="selectedPreset?.icon"
              :is="getIconComponent(selectedPreset.icon)"
              class="mr-2 h-4 w-4"
            />
            <span>{{ selectedPreset?.name || "Load…" }}</span>
          </div>
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList class="max-h-[320px]">
            <!-- Saved User Presets -->
            <CommandGroup
              v-if="playgroundStore.userPresets.length > 0"
              heading="Saved"
            >
              <CommandItem
                v-for="preset in playgroundStore.userPresets"
                :key="preset.id"
                :value="preset.id"
                @select="() => handlePresetSelect(preset.id)"
              >
                <div class="flex items-center justify-between w-full">
                  <HoverCard>
                    <HoverCardTrigger as-child>
                      <div class="flex items-center">
                        <component
                          v-if="preset.icon"
                          :is="getIconComponent(preset.icon)"
                          class="mr-2 h-4 w-4"
                        />
                        <span>{{ preset.name }}</span>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent
                      class="w-80"
                      side="bottom"
                      align="start"
                      :align-offset="20"
                    >
                      <p>{{ preset.description }}</p>
                    </HoverCardContent>
                  </HoverCard>
                  <div class="flex items-center space-x-2">
                    <Check
                      :class="
                        cn(
                          'h-4 w-4',
                          playgroundStore.selectedPresetId === preset.id
                            ? 'opacity-100'
                            : 'opacity-0',
                        )
                      "
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-6 w-6 p-0"
                      @click.stop="() => confirmDelete(preset)"
                    >
                      <Trash class="h-4 w-4 text-red-500 hover:text-red-700" />
                    </Button>
                  </div>
                </div>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <!-- Start from scratch option -->
            <CommandGroup>
              <CommandItem
                value="blank"
                @select="() => handlePresetSelect(null)"
              >
                <div class="flex items-center">
                  <File class="mr-2 h-4 w-4" />
                  <span>Start from scratch</span>
                </div>
              </CommandItem>
            </CommandGroup>

            <!-- Default Preset Groups -->
            <CommandGroup
              v-for="group in Object.values(PresetGroup)"
              :key="group"
              :heading="group"
            >
              <CommandEmpty>No examples found.</CommandEmpty>
              <CommandItem
                v-for="preset in getDefaultPresetsByGroup(group)"
                :key="preset.id"
                :value="preset.id"
                @select="() => handlePresetSelect(preset.id)"
              >
                <HoverCard>
                  <HoverCardTrigger as-child>
                    <div class="flex items-center">
                      <component
                        v-if="preset.icon"
                        :is="getIconComponent(preset.icon)"
                        class="mr-2 h-4 w-4"
                      />
                      <span>{{ preset.name }}</span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent
                    class="w-80"
                    side="bottom"
                    align="start"
                    :align-offset="20"
                  >
                    <p>{{ preset.description }}</p>
                  </HoverCardContent>
                </HoverCard>
                <Check
                  :class="
                    cn(
                      'ml-auto h-4 w-4 mr-2',
                      playgroundStore.selectedPresetId === preset.id
                        ? 'opacity-100'
                        : 'opacity-0',
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete "{{ presetToDelete?.name }}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" @click="handleDelete"> Delete </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ChevronsUpDown, File } from "lucide-vue-next";
import { Check, Trash } from "lucide-vue-next";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { defaultPresets, PresetGroup, type Preset } from "~/data/presets";
import { usePlaygroundStore } from "~/stores/playground";
import { useConnection } from "~/composables/useConnection";

// Icon mapping for string-based icons
import {
  Bot,
  GraduationCap,
  Headphones,
  Gamepad2,
  Sparkles,
  Skull,
  Frown,
  Music,
  Anchor,
} from "lucide-vue-next";

const iconMap = {
  Bot,
  GraduationCap,
  Headphones,
  Gamepad2,
  Sparkles,
  Skull,
  Frown,
  Music,
  Cigarette: Bot, // Fallback
  Anchor,
  Meh: Bot, // Fallback
  Palmtree: Bot, // Fallback
};

const open = ref(false);
const showDeleteDialog = ref(false);
const presetToDelete = ref<Preset | null>(null);
const lastPresetId = ref<string | null>(null);

const playgroundStore = usePlaygroundStore();
const { connect, disconnect, shouldConnect } = useConnection();

// Computed values
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

// Helper functions
const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || Bot;
};

const getDefaultPresetsByGroup = (group: PresetGroup) => {
  return defaultPresets.filter((preset) => preset.defaultGroup === group);
};

const confirmDelete = (preset: Preset) => {
  presetToDelete.value = preset;
  showDeleteDialog.value = true;
};

const handleDelete = () => {
  if (presetToDelete.value) {
    playgroundStore.deleteUserPreset(presetToDelete.value.id);
    showDeleteDialog.value = false;
    presetToDelete.value = null;

    // TODO: Add toast notification
    console.log("Preset removed");
  }
};

const handlePresetSelect = (presetId: string | null) => {
  playgroundStore.setSelectedPresetId(presetId);
  open.value = false;

  // TODO: Handle URL updates for sharing functionality
  // if (selectedPreset && !selectedPreset.defaultGroup) {
  //   window.history.replaceState({}, document.title, window.location.pathname)
  // }
};

// Watch for preset changes and reconnect if needed
watch(
  () => playgroundStore.selectedPresetId,
  (newPresetId) => {
    if (newPresetId !== lastPresetId.value) {
      lastPresetId.value = newPresetId;
      if (shouldConnect.value) {
        disconnect().then(() => {
          connect();
        });
      }
    }
  },
);
</script>
