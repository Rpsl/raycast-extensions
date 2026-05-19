import {
  List,
  ActionPanel,
  Action,
  Icon,
  Form,
  showToast,
  Toast,
  useNavigation,
  confirmAlert,
  Alert,
  Color,
} from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import { NetworkPreset } from "./types";
import { getPresets, savePreset, deletePreset } from "./storage";
import { isValidIp, isValidSubnetMask } from "./validation";

export default function ManagePresets() {
  const [presets, setPresets] = useState<NetworkPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPresets = useCallback(async () => {
    setLoading(true);
    const p = await getPresets();
    setPresets(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  async function handleDelete(preset: NetworkPreset) {
    if (preset.id === "dhcp") {
      await showToast({
        style: Toast.Style.Failure,
        title: "Cannot delete DHCP preset",
      });
      return;
    }

    const confirmed = await confirmAlert({
      title: "Delete Preset",
      message: `Are you sure you want to delete "${preset.name}"?`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      await deletePreset(preset.id);
      await showToast({
        style: Toast.Style.Success,
        title: "Preset deleted",
      });
      loadPresets();
    }
  }

  return (
    <List isLoading={loading} searchBarPlaceholder="Search presets...">
      <List.Section title="Presets">
        {presets.map((preset) => {
          const accessories: List.Item.Accessory[] = [];
          if (preset.gateway)
            accessories.push({ text: `GW: ${preset.gateway}` });
          if (preset.id === "dhcp")
            accessories.push({ tag: { value: "System", color: Color.Blue } });

          return (
            <List.Item
              key={preset.id}
              title={preset.name}
              subtitle={
                preset.type === "dhcp"
                  ? "Automatic (DHCP)"
                  : `${preset.ip} / ${preset.mask}`
              }
              accessories={accessories}
              icon={preset.type === "dhcp" ? Icon.ArrowClockwise : Icon.Globe}
              actions={
                <ActionPanel>
                  {preset.id !== "dhcp" && (
                    <ActionPanel.Section>
                      <Action.Push
                        title="Edit Preset"
                        icon={Icon.Pencil}
                        target={
                          <PresetForm preset={preset} onSave={loadPresets} />
                        }
                        shortcut={{ modifiers: ["cmd"], key: "e" }}
                      />
                      <Action
                        title="Delete Preset"
                        icon={Icon.Trash}
                        style={Action.Style.Destructive}
                        onAction={() => handleDelete(preset)}
                        shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                      />
                    </ActionPanel.Section>
                  )}
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      <List.Section title="Actions">
        <List.Item
          title="Add New Preset"
          icon={Icon.Plus}
          actions={
            <ActionPanel>
              <Action.Push
                title="Add New Preset"
                icon={Icon.Plus}
                target={<PresetForm onSave={loadPresets} />}
                shortcut={{ modifiers: ["cmd"], key: "n" }}
              />
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}

interface PresetFormProps {
  preset?: NetworkPreset;
  onSave: () => void;
}

function PresetForm({ preset, onSave }: PresetFormProps) {
  const { pop } = useNavigation();
  const isEditing = !!preset;

  const [name, setName] = useState(preset?.name || "");
  const [ip, setIp] = useState(preset?.ip || "");
  const [mask, setMask] = useState(preset?.mask || "255.255.255.0");
  const [gateway, setGateway] = useState(preset?.gateway || "");
  const [dns, setDns] = useState(preset?.dns?.join(", ") || "");

  const [nameError, setNameError] = useState<string | undefined>();
  const [ipError, setIpError] = useState<string | undefined>();
  const [maskError, setMaskError] = useState<string | undefined>();
  const [gatewayError, setGatewayError] = useState<string | undefined>();

  function validateName(value: string) {
    if (value.trim().length > 50) {
      setNameError("Name is too long (max 50 characters)");
    } else {
      setNameError(undefined);
    }
  }

  function validateIpField(
    value: string,
    setError: (e: string | undefined) => void,
  ) {
    if (!value.trim()) {
      setError("This field is required");
    } else if (!isValidIp(value)) {
      setError("Invalid IP address format");
    } else {
      setError(undefined);
    }
  }

  function validateMaskField(value: string) {
    if (!value.trim()) {
      setMaskError("This field is required");
    } else if (!isValidSubnetMask(value)) {
      setMaskError("Invalid subnet mask");
    } else {
      setMaskError(undefined);
    }
  }

  async function handleSubmit() {
    let hasError = false;

    if (name.trim().length > 50) {
      setNameError("Name is too long (max 50 characters)");
      hasError = true;
    }

    if (!ip.trim() || !isValidIp(ip)) {
      setIpError("Valid IP address is required");
      hasError = true;
    }

    if (!mask.trim() || !isValidSubnetMask(mask)) {
      setMaskError("Valid subnet mask is required");
      hasError = true;
    }

    if (!gateway.trim() || !isValidIp(gateway)) {
      setGatewayError("Valid gateway is required");
      hasError = true;
    }

    if (hasError) return;

    const dnsServers = dns
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d && isValidIp(d));

    const presetName = name.trim() || ip.trim();

    const newPreset: NetworkPreset = {
      id: preset?.id || `preset-${Date.now()}`,
      name: presetName,
      type: "static",
      ip: ip.trim(),
      mask: mask.trim(),
      gateway: gateway.trim(),
      dns: dnsServers.length > 0 ? dnsServers : undefined,
    };

    await savePreset(newPreset);

    await showToast({
      style: Toast.Style.Success,
      title: isEditing ? "Preset updated" : "Preset created",
    });

    onSave();
    pop();
  }

  return (
    <Form
      navigationTitle={isEditing ? "Edit Preset" : "New Preset"}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={isEditing ? "Save Changes" : "Create Preset"}
            icon={Icon.Checkmark}
            onSubmit={handleSubmit}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Preset Name"
        placeholder="Optional (will use IP if empty)"
        info="Leave empty to use IP address as name"
        value={name}
        onChange={setName}
        error={nameError}
        onBlur={() => validateName(name)}
      />

      <Form.Separator />

      <Form.TextField
        id="ip"
        title="IP Address"
        placeholder="192.168.1.10"
        value={ip}
        onChange={setIp}
        error={ipError}
        onBlur={() => validateIpField(ip, setIpError)}
      />

      <Form.TextField
        id="mask"
        title="Subnet Mask"
        placeholder="255.255.255.0"
        value={mask}
        onChange={setMask}
        error={maskError}
        onBlur={() => validateMaskField(mask)}
      />

      <Form.TextField
        id="gateway"
        title="Gateway"
        placeholder="192.168.1.1"
        value={gateway}
        onChange={setGateway}
        error={gatewayError}
        onBlur={() => validateIpField(gateway, setGatewayError)}
      />

      <Form.Separator />

      <Form.TextField
        id="dns"
        title="DNS Servers"
        placeholder="8.8.8.8, 8.8.4.4 (optional)"
        info="Comma-separated list of DNS servers"
        value={dns}
        onChange={setDns}
      />
    </Form>
  );
}
