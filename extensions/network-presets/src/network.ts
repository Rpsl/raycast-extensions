import { execFile } from "child_process";
import { promisify } from "util";
import { NetworkService, NetworkInfo, NetworkPreset } from "./types";

const execFileAsync = promisify(execFile);

const NETWORKSETUP = "/usr/sbin/networksetup";

// Virtual/internal device patterns to filter out
const VIRTUAL_DEVICE_PATTERNS = [
  /^bridge\d*$/, // Thunderbolt Bridge, network bridges
  /^utun\d*$/, // VPN tunnels
  /^lo\d*$/, // Loopback
  /^vmnet\d*$/, // VMware
  /^vboxnet\d*$/, // VirtualBox
  /^docker\d*$/, // Docker
  /^veth/, // Docker/container virtual ethernet
  /^awdl\d*$/, // Apple Wireless Direct Link
  /^llw\d*$/, // Low latency WLAN
  /^ap\d*$/, // Access point
];

// Hardware port names to filter out
const VIRTUAL_PORT_PATTERNS = [
  /^Thunderbolt Bridge$/i,
  /^Thunderbolt \d+$/i,
  /^iPhone USB$/i,
  /^iPad USB$/i,
];

export function isPhysicalInterface(
  device: string,
  hardwarePort: string,
): boolean {
  for (const pattern of VIRTUAL_DEVICE_PATTERNS) {
    if (pattern.test(device)) {
      return false;
    }
  }

  for (const pattern of VIRTUAL_PORT_PATTERNS) {
    if (pattern.test(hardwarePort)) {
      return false;
    }
  }

  return true;
}

export async function getNetworkServices(): Promise<NetworkService[]> {
  try {
    const { stdout } = await execFileAsync(NETWORKSETUP, [
      "-listallhardwareports",
    ]);
    const services: NetworkService[] = [];
    const blocks = stdout.split("\n\n").filter((b) => b.trim());

    for (const block of blocks) {
      const lines = block.split("\n");
      let name = "";
      let hardwarePort = "";
      let device = "";

      for (const line of lines) {
        if (line.startsWith("Hardware Port:")) {
          hardwarePort = line.replace("Hardware Port:", "").trim();
          name = hardwarePort;
        } else if (line.startsWith("Device:")) {
          device = line.replace("Device:", "").trim();
        }
      }

      if (name && device && isPhysicalInterface(device, hardwarePort)) {
        services.push({ name, hardwarePort, device });
      }
    }

    return services;
  } catch (error) {
    console.error("Failed to get network services:", error);
    return [];
  }
}

export async function getNetworkInfo(
  serviceName: string,
): Promise<NetworkInfo> {
  try {
    const { stdout } = await execFileAsync(NETWORKSETUP, [
      "-getinfo",
      serviceName,
    ]);
    const info: NetworkInfo = { configured: "unknown" };

    const lines = stdout.split("\n");
    for (const line of lines) {
      if (line.includes("IP address:")) {
        info.ip = line.substring(line.indexOf(":") + 1).trim();
      } else if (line.includes("Subnet mask:")) {
        info.mask = line.substring(line.indexOf(":") + 1).trim();
      } else if (line.includes("Router:")) {
        info.router = line.substring(line.indexOf(":") + 1).trim();
      } else if (line.includes("DHCP Configuration")) {
        info.configured = "dhcp";
      } else if (line.includes("Manual Configuration")) {
        info.configured = "manual";
      }
    }

    return info;
  } catch (error) {
    console.error("Failed to get network info:", error);
    return { configured: "unknown" };
  }
}

export async function applyPreset(
  serviceName: string,
  preset: NetworkPreset,
): Promise<void> {
  if (preset.type === "dhcp") {
    await execFileAsync(NETWORKSETUP, ["-setdhcp", serviceName]);
  } else if (
    preset.type === "static" &&
    preset.ip &&
    preset.mask &&
    preset.gateway
  ) {
    await execFileAsync(NETWORKSETUP, [
      "-setmanual",
      serviceName,
      preset.ip,
      preset.mask,
      preset.gateway,
    ]);

    if (preset.dns && preset.dns.length > 0) {
      await execFileAsync(NETWORKSETUP, [
        "-setdnsservers",
        serviceName,
        ...preset.dns,
      ]);
    }
  } else {
    throw new Error("Invalid preset configuration");
  }
}
