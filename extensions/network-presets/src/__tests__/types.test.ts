import { describe, it, expect } from "vitest";
import { DHCP_PRESET, NetworkPreset } from "../types";

describe("DHCP_PRESET", () => {
  it("should have correct structure", () => {
    expect(DHCP_PRESET).toEqual({
      id: "dhcp",
      name: "DHCP",
      type: "dhcp",
    });
  });

  it("should have type dhcp", () => {
    expect(DHCP_PRESET.type).toBe("dhcp");
  });

  it("should not have IP configuration", () => {
    expect(DHCP_PRESET.ip).toBeUndefined();
    expect(DHCP_PRESET.mask).toBeUndefined();
    expect(DHCP_PRESET.gateway).toBeUndefined();
  });
});

describe("NetworkPreset type", () => {
  it("should allow static preset with all fields", () => {
    const preset: NetworkPreset = {
      id: "test-1",
      name: "Test Preset",
      type: "static",
      ip: "192.168.1.100",
      mask: "255.255.255.0",
      gateway: "192.168.1.1",
      dns: ["8.8.8.8", "8.8.4.4"],
    };

    expect(preset.type).toBe("static");
    expect(preset.ip).toBe("192.168.1.100");
    expect(preset.dns).toHaveLength(2);
  });

  it("should allow static preset without DNS", () => {
    const preset: NetworkPreset = {
      id: "test-2",
      name: "No DNS Preset",
      type: "static",
      ip: "10.0.0.50",
      mask: "255.0.0.0",
      gateway: "10.0.0.1",
    };

    expect(preset.dns).toBeUndefined();
  });
});
