import { describe, it, expect } from "vitest";
import { isPhysicalInterface } from "../network";

describe("isPhysicalInterface", () => {
  describe("should return true for physical interfaces", () => {
    it("Wi-Fi adapter", () => {
      expect(isPhysicalInterface("en0", "Wi-Fi")).toBe(true);
    });

    it("Ethernet adapter", () => {
      expect(isPhysicalInterface("en1", "Ethernet")).toBe(true);
    });

    it("USB Ethernet adapter", () => {
      expect(isPhysicalInterface("en15", "USB 10/100/1000 LAN")).toBe(true);
    });

    it("Ethernet Adapter with device name", () => {
      expect(isPhysicalInterface("en4", "Ethernet Adapter (en4)")).toBe(true);
    });
  });

  describe("should return false for virtual interfaces", () => {
    it("Thunderbolt Bridge", () => {
      expect(isPhysicalInterface("bridge0", "Thunderbolt Bridge")).toBe(false);
    });

    it("Thunderbolt port", () => {
      expect(isPhysicalInterface("en1", "Thunderbolt 1")).toBe(false);
      expect(isPhysicalInterface("en2", "Thunderbolt 2")).toBe(false);
      expect(isPhysicalInterface("en3", "Thunderbolt 3")).toBe(false);
    });

    it("VPN tunnel", () => {
      expect(isPhysicalInterface("utun0", "VPN")).toBe(false);
      expect(isPhysicalInterface("utun1", "Some VPN")).toBe(false);
    });

    it("Docker network", () => {
      expect(isPhysicalInterface("docker0", "Docker")).toBe(false);
    });

    it("Docker veth", () => {
      expect(isPhysicalInterface("veth123abc", "Container")).toBe(false);
    });

    it("VMware network", () => {
      expect(isPhysicalInterface("vmnet1", "VMware")).toBe(false);
      expect(isPhysicalInterface("vmnet8", "VMware NAT")).toBe(false);
    });

    it("VirtualBox network", () => {
      expect(isPhysicalInterface("vboxnet0", "VirtualBox")).toBe(false);
    });

    it("Apple Wireless Direct Link", () => {
      expect(isPhysicalInterface("awdl0", "AWDL")).toBe(false);
    });

    it("Low latency WLAN", () => {
      expect(isPhysicalInterface("llw0", "LLW")).toBe(false);
    });

    it("Access point", () => {
      expect(isPhysicalInterface("ap1", "Access Point")).toBe(false);
    });

    it("Loopback", () => {
      expect(isPhysicalInterface("lo0", "Loopback")).toBe(false);
    });

    it("iPhone USB", () => {
      expect(isPhysicalInterface("en5", "iPhone USB")).toBe(false);
    });

    it("iPad USB", () => {
      expect(isPhysicalInterface("en6", "iPad USB")).toBe(false);
    });

    it("Bridge interface", () => {
      expect(isPhysicalInterface("bridge0", "Network Bridge")).toBe(false);
      expect(isPhysicalInterface("bridge1", "Custom Bridge")).toBe(false);
    });
  });
});
