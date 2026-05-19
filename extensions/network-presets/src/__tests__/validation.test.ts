import { describe, it, expect } from "vitest";
import { isValidIp, isValidSubnetMask, isValidPresetName } from "../validation";

describe("isValidIp", () => {
  describe("valid IP addresses", () => {
    it("should accept standard IPs", () => {
      expect(isValidIp("192.168.1.1")).toBe(true);
      expect(isValidIp("10.0.0.1")).toBe(true);
      expect(isValidIp("172.16.0.1")).toBe(true);
      expect(isValidIp("8.8.8.8")).toBe(true);
    });

    it("should accept boundary values", () => {
      expect(isValidIp("0.0.0.0")).toBe(true);
      expect(isValidIp("255.255.255.255")).toBe(true);
      expect(isValidIp("1.1.1.1")).toBe(true);
    });

    it("should accept IPs with zeros", () => {
      expect(isValidIp("192.168.0.1")).toBe(true);
      expect(isValidIp("10.0.0.0")).toBe(true);
    });
  });

  describe("invalid IP addresses", () => {
    it("should reject empty string", () => {
      expect(isValidIp("")).toBe(false);
    });

    it("should reject values over 255", () => {
      expect(isValidIp("256.0.0.1")).toBe(false);
      expect(isValidIp("192.168.1.256")).toBe(false);
      expect(isValidIp("999.999.999.999")).toBe(false);
    });

    it("should reject incomplete IPs", () => {
      expect(isValidIp("192.168.1")).toBe(false);
      expect(isValidIp("192.168")).toBe(false);
      expect(isValidIp("192")).toBe(false);
    });

    it("should reject IPs with extra octets", () => {
      expect(isValidIp("192.168.1.1.1")).toBe(false);
    });

    it("should reject IPs with letters", () => {
      expect(isValidIp("192.168.1.a")).toBe(false);
      expect(isValidIp("abc.def.ghi.jkl")).toBe(false);
    });

    it("should reject IPs with spaces", () => {
      expect(isValidIp("192.168.1. 1")).toBe(false);
      expect(isValidIp(" 192.168.1.1")).toBe(false);
    });

    it("should reject negative numbers", () => {
      expect(isValidIp("-1.0.0.0")).toBe(false);
    });
  });
});

describe("isValidSubnetMask", () => {
  describe("valid subnet masks", () => {
    it("should accept common masks", () => {
      expect(isValidSubnetMask("255.255.255.0")).toBe(true);
      expect(isValidSubnetMask("255.255.0.0")).toBe(true);
      expect(isValidSubnetMask("255.0.0.0")).toBe(true);
    });

    it("should accept /32 mask", () => {
      expect(isValidSubnetMask("255.255.255.255")).toBe(true);
    });

    it("should accept /0 mask", () => {
      expect(isValidSubnetMask("0.0.0.0")).toBe(true);
    });

    it("should accept CIDR-valid masks", () => {
      expect(isValidSubnetMask("255.255.255.128")).toBe(true);
      expect(isValidSubnetMask("255.255.255.192")).toBe(true);
      expect(isValidSubnetMask("255.255.255.224")).toBe(true);
      expect(isValidSubnetMask("255.255.255.240")).toBe(true);
      expect(isValidSubnetMask("255.255.255.248")).toBe(true);
      expect(isValidSubnetMask("255.255.255.252")).toBe(true);
    });
  });

  describe("invalid subnet masks", () => {
    it("should reject non-contiguous masks", () => {
      expect(isValidSubnetMask("255.0.255.0")).toBe(false);
      expect(isValidSubnetMask("255.255.0.255")).toBe(false);
    });

    it("should reject invalid values", () => {
      expect(isValidSubnetMask("255.255.255.1")).toBe(false);
      expect(isValidSubnetMask("255.255.255.100")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidSubnetMask("")).toBe(false);
    });
  });
});

describe("isValidPresetName", () => {
  it("should accept valid names", () => {
    expect(isValidPresetName("Office")).toBe(true);
    expect(isValidPresetName("Home Lab")).toBe(true);
    expect(isValidPresetName("Server Room #1")).toBe(true);
  });

  it("should accept empty names (optional field)", () => {
    expect(isValidPresetName("")).toBe(true);
    expect(isValidPresetName("   ")).toBe(true);
  });

  it("should reject names over 50 characters", () => {
    const longName = "a".repeat(51);
    expect(isValidPresetName(longName)).toBe(false);
  });

  it("should accept names at boundary (50 chars)", () => {
    const maxName = "a".repeat(50);
    expect(isValidPresetName(maxName)).toBe(true);
  });
});
