# AIpane

> A multi-panel browser built for AI — compare responses from DeepSeek, ChatGPT, Claude, Gemini, and more side by side in a single window.

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/Electron-35.x-47848f" alt="Electron">
  <img src="https://img.shields.io/badge/React-19.x-61dafb" alt="React">
</p>

[中文](README_zh.md) | English

## Why AIpane?

When working with AI, one answer is rarely enough. AIpane lets you ask the same question to multiple AI services at once, compare outputs, and pick the best — without juggling tabs or windows.

## Features

- **Side-by-side AI comparison** — ask DeepSeek, ChatGPT, Claude, Gemini, and more simultaneously
- **1–6 independent panels** — each with its own webview, each navigating independently
- **Three layouts** — horizontal, vertical, or grid; switch anytime
- **Drag-to-resize** — adjust panel proportions with split handles
- **Drag-to-reorder** — drag the address bar to rearrange panels
- **Custom AI services** — 8 built-in presets (DeepSeek, ChatGPT, Claude, etc.) plus your own services (Ollama, self-hosted LLMs, etc.) — add, edit, and delete freely, persisted across restarts
- **Address bar** — full URL navigation with back, forward, and refresh
- **Auto-save** — layout, panels, and URLs persist across restarts
- **Keyboard shortcuts** — `Ctrl+T` / `Cmd+T` for a new panel
## Quick Start

**Prerequisites:** Node.js ≥ 18, pnpm ≥ 8

```bash
# Install dependencies
pnpm install

# Development mode (with HMR)
pnpm dev

# Production mode (no HMR, closer to packaged app)
node build.mjs && ./node_modules/.bin/electron .
```

### Dev vs Production

| | Dev | Production |
|---|---|---|
| Renderer | Vite HMR — changes instant | Built files — rebuild required |
| Main process | Restart Electron | Rebuild + restart |
| Loads from | `http://localhost:5173` | `file://` |
| Use for | UI tweaks, styling | Main process work, pre-package check |

## Packaging

Build distributable packages for all platforms:

```bash
# Prune dev dependencies (required for correct packaging)
rm -rf node_modules && pnpm install --prod --no-frozen-lockfile

# Build for all platforms (arm64 + x64)
npx electron-builder --mac --win --linux
npx electron-builder --win --linux --x64

# Restore dev dependencies
pnpm install
```

**Important:** Always `install --prod` before packaging — `electron-builder` with pnpm will otherwise bundle the entire `node_modules` (~470M) into the app.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` / `Cmd+T` | New panel |

## Tech Stack

Electron · React · TypeScript · zustand · Vite · Tailwind CSS

## Project Structure

```
src/
├── main/           # Electron main process (window management, IPC)
├── preload/        # contextBridge layer
├── renderer/       # React app
│   └── components/ # PanelGrid / PanelView / SplitPane / SettingsPanel
├── settings/       # Standalone settings page (legacy)
└── shared/         # Cross-process type definitions
```
