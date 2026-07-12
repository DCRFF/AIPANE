# AIpane

> 单窗口多面板浏览器 —— 像窗格一样并排浏览多个网页，无需来回切换标签页。

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey" alt="Platform">
  <img src="https://img.shields.io/badge/Electron-35.x-47848f" alt="Electron">
  <img src="https://img.shields.io/badge/React-19.x-61dafb" alt="React">
</p>

## 功能

- **多面板并排** — 1 到 6 个独立 webview，各自浏览互不干扰
- **三种布局** — 横向 / 纵向 / 田字，随时切换
- **拖拽分割线** — 自由调整面板比例
- **拖拽排序** — 拖地址栏即可交换面板位置
- **AI 服务快捷添加** — 一键打开 DeepSeek、豆包、ChatGPT、Claude 等
- **地址栏导航** — 支持 URL 输入、前进、后退、刷新
- **自动保存** — 所有配置（布局、面板、URL）自动持久化，重启恢复
- **快捷键** — `Ctrl+T` / `Cmd+T` 新建面板

## 快速开始

**前置条件：** Node.js ≥ 18，pnpm ≥ 8

```bash
# 安装依赖
pnpm install

# 开发模式（含 HMR 热更新）
pnpm dev

# 生产模式（更稳定，无 HMR）
node build.mjs && ./node_modules/.bin/electron .
```

## 快捷键

| 快捷键 | 操作 |
|--------|------|
| `Ctrl+T` / `Cmd+T` | 新建面板 |

## 技术栈

Electron · React · TypeScript · zustand · Vite · Tailwind CSS

## 项目结构

```
src/
├── main/           # Electron 主进程（窗口管理、IPC）
├── preload/        # contextBridge 桥接层
├── renderer/       # React 应用
│   └── components/ # PanelGrid / PanelView / SplitPane / SettingsPanel
├── settings/       # 独立设置页面（备用）
└── shared/         # 跨进程类型定义
```
