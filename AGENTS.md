# 仓库指南

## 项目

多栏浏览器 —— Electron + React + TypeScript 桌面应用。单一窗口内通过 webview 并排打开 1-6 个网页，各栏独立浏览。设置面板为内联覆盖层，从窗口右上角齿轮按钮唤出。

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

## Bug 修复 / 特性开发约定

- 修复 bug 或完成特性开发后，**必须打开应用让用户查看效果**。
- 重新构建并启动生产模式的命令：
  ```bash
  pkill -f "Electron.app" 2>/dev/null; node build.mjs && ./node_modules/.bin/electron .
  ```

## 已知陷阱

- **CSS `flex: <number>` 的 flex-grow 语义**：`flex: 0.333` 在浏览器中等价于 `flex: 0.333 1 0%`。如果容器内所有 flex 项的 flex-grow 总和 ≠ 1，浏览器按**绝对比例**分配空间（而非相对比例），导致留白。传入 SplitPane 的 `ratios` 必须确保 sum = 1。
- **设置按钮**：位于 `App.tsx`，`absolute top-2 right-2`，与面板网格的 `p-2` 顶部边距对齐。设置面板的关闭按钮需要给最右侧面板的地址栏加 `pr-[72px]` 避免遮挡。
