# 仓库指南

## 项目

多栏浏览器 —— Electron + React + TypeScript 桌面应用。单一窗口内通过 BrowserView 并排打开 2-3 个网页，各栏独立浏览。

## 技术栈

Electron · React · TypeScript · zustand · Vite · Tailwind CSS · pnpm

## 目录结构

```
src/
├── main/           # Electron 主进程（窗口、BrowserView、IPC）
├── preload/        # contextBridge 桥接层
├── renderer/       # React 外壳（工具栏、分栏布局）
└── shared/         # 跨进程类型定义
```

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
- **BrowserView 在主进程管理**，渲染进程通过 IPC 驱动，手动 `setBounds` 对齐分栏
- **zustand 做状态管理**，不引入 Redux
- **共享类型**放 `src/shared/types.ts`，main 和 renderer 不能互相 import
- **命名**：目录 kebab-case，组件 PascalCase，工具 camelCase
- **样式**：Tailwind CSS，全程统一

## 测试

Vitest（单元） + Playwright（E2E + Electron）

## 文档

执行计划：[docs/plan/26-07-09-01-执行计划.md](../docs/plan/26-07-09-01-执行计划.md)
设计背景：[docs/report/26-07-09-01-项目计划.md](../docs/report/26-07-09-01-项目计划.md)
