import {
  List,
  ActionPanel,
  Action,
  Icon,
  showToast,
  Toast,
  useNavigation,
  Color,
} from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import { NetworkService, NetworkPreset, NetworkInfo } from "./types";
import { getNetworkServices, getNetworkInfo, applyPreset } from "./network";
import { getPresets } from "./storage";

export default function SwitchNetwork() {
  const [services, setServices] = useState<NetworkService[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const svcs = await getNetworkServices();
    setServices(svcs);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return (
    <List isLoading={loading} searchBarPlaceholder="Select network adapter...">
      {services.map((service) => (
        <List.Item
          key={service.device}
          title={service.name}
          subtitle={service.device}
          icon={Icon.Network}
          actions={
            <ActionPanel>
              <Action.Push
                title="Select Preset"
                icon={Icon.List}
                target={<PresetList service={service} />}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function PresetList({ service }: { service: NetworkService }) {
  const { pop } = useNavigation();
  const [presets, setPresets] = useState<NetworkPreset[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [p, info] = await Promise.all([
      getPresets(),
      getNetworkInfo(service.name),
    ]);
    setPresets(p);
    setNetworkInfo(info);
    setLoading(false);
  }, [service.name]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleApplyPreset(preset: NetworkPreset) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Applying preset...",
    });

    try {
      await applyPreset(service.name, preset);
      toast.style = Toast.Style.Success;
      toast.title = `Applied "${preset.name}" to ${service.name}`;
      pop();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to apply preset";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  function getPresetIcon(preset: NetworkPreset): {
    source: Icon;
    tintColor?: Color;
  } {
    if (preset.type === "dhcp") {
      return { source: Icon.ArrowClockwise, tintColor: Color.Blue };
    }
    return { source: Icon.Globe, tintColor: Color.Green };
  }

  function isCurrentPreset(preset: NetworkPreset): boolean {
    if (!networkInfo) return false;

    if (preset.type === "dhcp" && networkInfo.configured === "dhcp") {
      return true;
    }

    if (preset.type === "static" && networkInfo.configured === "manual") {
      return (
        preset.ip === networkInfo.ip &&
        preset.mask === networkInfo.mask &&
        preset.gateway === networkInfo.router
      );
    }

    return false;
  }

  return (
    <List
      isLoading={loading}
      navigationTitle={`${service.name} - Select Preset`}
      searchBarPlaceholder="Select preset to apply..."
    >
      <List.Section title="Current Status">
        <List.Item
          title={networkInfo?.configured === "dhcp" ? "DHCP" : "Static IP"}
          subtitle={networkInfo?.ip ? `IP: ${networkInfo.ip}` : "No IP"}
          accessories={[
            { text: networkInfo?.mask ? `Mask: ${networkInfo.mask}` : "" },
            { text: networkInfo?.router ? `GW: ${networkInfo.router}` : "" },
          ]}
          icon={{ source: Icon.Info, tintColor: Color.SecondaryText }}
        />
      </List.Section>

      <List.Section title="Available Presets">
        {presets.map((preset) => {
          const accessories: List.Item.Accessory[] = [];
          if (preset.gateway)
            accessories.push({ text: `GW: ${preset.gateway}` });
          if (isCurrentPreset(preset))
            accessories.push({ tag: { value: "Active", color: Color.Green } });

          return (
            <List.Item
              key={preset.id}
              title={preset.name}
              subtitle={
                preset.type === "dhcp"
                  ? "Automatic configuration"
                  : `${preset.ip} / ${preset.mask}`
              }
              accessories={accessories}
              icon={getPresetIcon(preset)}
              actions={
                <ActionPanel>
                  <Action
                    title="Apply Preset"
                    icon={Icon.Checkmark}
                    onAction={() => handleApplyPreset(preset)}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
