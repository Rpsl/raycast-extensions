export interface NetworkPreset {
  id: string;
  name: string;
  type: "static" | "dhcp";
  ip?: string;
  mask?: string;
  gateway?: string;
  dns?: string[];
}

export interface NetworkService {
  name: string;
  hardwarePort: string;
  device: string;
}

export interface NetworkInfo {
  ip?: string;
  mask?: string;
  router?: string;
  configured: "dhcp" | "manual" | "unknown";
}

export const DHCP_PRESET: NetworkPreset = {
  id: "dhcp",
  name: "DHCP",
  type: "dhcp",
};
