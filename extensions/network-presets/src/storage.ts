import { LocalStorage, showToast, Toast } from "@raycast/api";
import { NetworkPreset, DHCP_PRESET } from "./types";

const PRESETS_KEY = "network-presets";

function parseStoredPresets(stored: string): NetworkPreset[] {
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall through to reset
  }
  showToast({
    style: Toast.Style.Failure,
    title: "Saved presets are corrupted, resetting",
  });
  LocalStorage.removeItem(PRESETS_KEY);
  return [];
}

export async function getPresets(): Promise<NetworkPreset[]> {
  const stored = await LocalStorage.getItem<string>(PRESETS_KEY);
  const userPresets: NetworkPreset[] = stored ? parseStoredPresets(stored) : [];
  return [DHCP_PRESET, ...userPresets];
}

export async function getUserPresets(): Promise<NetworkPreset[]> {
  const stored = await LocalStorage.getItem<string>(PRESETS_KEY);
  return stored ? parseStoredPresets(stored) : [];
}

export async function savePreset(preset: NetworkPreset): Promise<void> {
  const presets = await getUserPresets();
  const existingIndex = presets.findIndex((p) => p.id === preset.id);

  if (existingIndex >= 0) {
    presets[existingIndex] = preset;
  } else {
    presets.push(preset);
  }

  await LocalStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

export async function deletePreset(presetId: string): Promise<void> {
  if (presetId === "dhcp") {
    throw new Error("Cannot delete DHCP preset");
  }

  const presets = await getUserPresets();
  const filtered = presets.filter((p) => p.id !== presetId);
  await LocalStorage.setItem(PRESETS_KEY, JSON.stringify(filtered));
}
