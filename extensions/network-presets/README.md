<div align="center">
  <img src="assets/network-icon.png" width="96" height="96" alt="Network Presets">
  <h1><a href="https://github.com/Rpsl/raycast-network-presets">Network Presets</a></h1>
  <p>Switch between network configurations in seconds — without opening System Settings.</p>
</div>

---

Do you juggle between office, home, and lab networks? Tired of manually entering the same IP addresses every time? **Network Presets** lets you save any network configuration as a named preset and apply it with two keystrokes.

## Commands

### Switch Network Preset

Pick an adapter → pick a preset → done. The active configuration is highlighted so you always know what's applied.

### Manage Network Presets

Create, edit, and delete presets. The built-in **DHCP** preset is always available and cannot be deleted.

## Features

- **One-step switching** — select adapter, select preset, done
- **Static IP presets** — store IP, subnet mask, gateway, and DNS servers together
- **DHCP preset** — always available, no configuration needed
- **Active preset indicator** — see what's currently applied at a glance
- **Smart filtering** — shows only physical adapters (Wi-Fi, Ethernet, USB); hides VPN tunnels, Docker bridges, virtual adapters
- **Validated input** — enforces valid IPs and proper subnet masks before saving

## Usage

### Apply a preset

1. Open Raycast → **Switch Network Preset**
2. Select a network adapter
3. Choose a preset — `⏎` to apply

### Create a preset

1. Open Raycast → **Manage Network Presets**
2. `⌘ N` — New Preset
3. Fill in the details and save

| Field | Example |
|---|---|
| Name | Office, Home Lab, Guest |
| IP Address | 192.168.1.100 |
| Subnet Mask | 255.255.255.0 |
| Gateway | 192.168.1.1 |
| DNS Servers | 8.8.8.8, 8.8.4.4 *(optional)* |

### Edit or delete a preset

- `⌘ E` — edit selected preset
- `⌘ ⌫` — delete selected preset

## Requirements

- macOS 10.15+
- Raycast 1.64.0+
- Administrator privileges (required by `networksetup` to change network settings)

## Development

```bash
npm install      # install dependencies
npm run dev      # start in development mode
npm run build    # production build
npm run lint     # check code style
npm run test     # run tests
```

## License

MIT
