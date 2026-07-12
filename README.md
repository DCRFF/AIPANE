# AIpane

> A multi-panel browser in a single window — browse multiple webpages side by side, no tab switching needed.

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/Electron-35.x-47848f" alt="Electron">
  <img src="https://img.shields.io/badge/React-19.x-61dafb" alt="React">
</p>

[中文](README_zh.md) | English

## Features

- **Multi-panel browsing** — 1 to 6 independent webviews, each with isolated navigation
- **Three layouts** — horizontal / vertical / grid, switch anytime
- **Drag-to-resize** — freely adjust panel proportions with split handles
- **Drag-to-reorder** — drag the address bar to swap panel positions
- **Quick AI service launcher** — one-click open DeepSeek, ChatGPT, Claude, Gemini, and more
- **Address bar** — URL navigation, back, forward, refresh
- **Auto-save** — all config (layout, panels, URLs) persisted and restored on restart
- **Keyboard shortcuts** — `Ctrl+T` / `Cmd+T` to add a new panel

## Quick Start

**Prerequisites:** Node.js ≥ 18, pnpm ≥ 8

```bash
# Install dependencies
pnpm install

# Development mode (with HMR)
pnpm dev

# Production mode (more stable, no HMR)
node build.mjs && ./node_modules/.bin/electron .
```

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
