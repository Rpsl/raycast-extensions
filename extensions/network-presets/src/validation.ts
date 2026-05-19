/**
 * Validates an IP address format (IPv4)
 */
export function isValidIp(value: string): boolean {
  if (!value) return false;

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(value)) return false;

  const parts = value.split(".").map(Number);
  return parts.every((p) => p >= 0 && p <= 255);
}

/**
 * Validates a subnet mask
 */
export function isValidSubnetMask(value: string): boolean {
  if (!isValidIp(value)) return false;

  // Valid subnet masks in decimal
  const validMasks = [
    "0.0.0.0",
    "128.0.0.0",
    "192.0.0.0",
    "224.0.0.0",
    "240.0.0.0",
    "248.0.0.0",
    "252.0.0.0",
    "254.0.0.0",
    "255.0.0.0",
    "255.128.0.0",
    "255.192.0.0",
    "255.224.0.0",
    "255.240.0.0",
    "255.248.0.0",
    "255.252.0.0",
    "255.254.0.0",
    "255.255.0.0",
    "255.255.128.0",
    "255.255.192.0",
    "255.255.224.0",
    "255.255.240.0",
    "255.255.248.0",
    "255.255.252.0",
    "255.255.254.0",
    "255.255.255.0",
    "255.255.255.128",
    "255.255.255.192",
    "255.255.255.224",
    "255.255.255.240",
    "255.255.255.248",
    "255.255.255.252",
    "255.255.255.254",
    "255.255.255.255",
  ];

  return validMasks.includes(value);
}

/**
 * Validates a preset name (optional - empty is allowed)
 */
export function isValidPresetName(name: string): boolean {
  return name.trim().length <= 50;
}
