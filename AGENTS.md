# 仓库指南

## 项目

AIpane —— Electron + React + TypeScript 桌面应用。单一窗口内通过 webview 并排打开 1-6 个网页，各栏独立浏览。设置面板为内联覆盖层，从窗口右上角齿轮按钮唤出。

## 技术栈

Electron · React · TypeScript · zustand · Vite · Tailwind CSS · pnpm

## 目录结构

```
src/
├── main/           # Electron 主进程（窗口管理、IPC 处理）
├── preload/        # contextBridge 桥接层
├── renderer/       # React 应用（面板网格、地址栏、设置面板）
│   └── components/ # PanelGrid / PanelView / AddressBar / SettingsPanel
├── settings/       # 独立设置页面（备用，已不使用）
└── shared/         # 跨进程类型定义

## 启动方式

**开发模式**（含 HMR）：
```bash
pnpm dev
```

**生产模式**（直接启动，无 HMR，更稳定）：
```bash
node build.mjs && ./node_modules/.bin/electron .
```

**其他命令**：
```bash
pnpm install   # 安装依赖
pnpm build     # 仅构建
pnpm package   # 打包安装包
pnpm lint      # 代码检查
pnpm typecheck # 类型检查
pnpm test      # 测试
```
## 核心约定
- **IPC 全异步**：`ipcRenderer.invoke` / `ipcMain.handle`，禁止 `sendSync` 和 `remote`
- **webview 在渲染进程管理**，PanelView 组件直接渲染 <webview> 标签
- **设置面板内联**，通过 React 状态控制显隐，不走独立 BrowserWindow
- **zustand 做状态管理**，不引入 Redux
- **共享类型**放 `src/shared/types.ts`，main 和 renderer 不能互相 import
- **命名**：目录 kebab-case，组件 PascalCase，工具 camelCase
- **样式**：Tailwind CSS，全程统一

## 测试

Vitest（单元） + Playwright（E2E + Electron）

## 文档

执行计划：[docs/plan/26-07-09-01-执行计划.md](../docs/plan/26-07-09-01-执行计划.md)
设计背景：[docs/report/26-07-09-01-项目计划.md](../docs/report/26-07-09-01-项目计划.md)
Bug 分析：[docs/report/26-07-12-01-SplitPane-bug分析.md](../docs/report/26-07-12-01-SplitPane-bug分析.md)
拖拽排序方案：[docs/report/26-07-12-02-面板拖拽排序方案.md](../docs/report/26-07-12-02-面板拖拽排序方案.md)
CSS Grid 方案分析：[docs/report/26-07-12-03-CSSGrid布局方案分析.md](../docs/report/26-07-12-03-CSSGrid布局方案分析.md)
切换布局方案调研：[docs/report/26-07-12-04-切换布局方案调研.md](../docs/report/26-07-12-04-切换布局方案调研.md)
布局改造计划：[docs/plan/26-07-12-01-面板池布局改造计划.md](../docs/plan/26-07-12-01-面板池布局改造计划.md)

## 已实现功能

- 横向 / 纵向 / 田字三种布局
- 分割线拖拽调整面板比例
- **卡片式拖拽排序**：拖拽地址栏交换面板位置，零 React 重渲染，pointer capture 防 webview 吞事件
- 面板增删（1-6 个），配置自动持久化
- 快捷键 `Ctrl+T` 新建面板

## 待实施

- [面板池布局改造](docs/plan/26-07-12-01-面板池布局改造计划.md)：解决切换布局时 webview 重载问题
