# 仓库指南

> 行为规范见 [.omp/RULES.md](.omp/RULES.md)

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
- **README 双语文档**：`README.md`（英文）为主，`README_zh.md`（中文）保持同步，每次 git 提交前需更新两份文档

## 构建与打包

详见 README.md 的 **Packaging** 章节。关键要点：

- **打包前必须 `install --prod`**，否则 pnpm 的 electron-builder 会把全部 devDependencies 打进 asar
- `package.json` 的 `build.files` 必须精确指定子目录（`dist/main/**` 等），不能用 `dist/**/*`（会把 electron-builder 自身输出也打包进去）
- `build.electronVersion` 指定精确版本号，避免 electron-builder 依赖 `node_modules/electron` 检测版本
- Windows 在 macOS 上交叉编译 NSIS 会失败，改用 `target: zip`
- `.npmrc` 设置 `node-linker=hoisted` 使 node_modules 扁平化

## 测试

Vitest（单元） + Playwright（E2E + Electron）


## 已实现功能

- 横向 / 纵向 / 田字三种布局
- 分割线拖拽调整面板比例
- **卡片式拖拽排序**：拖拽地址栏交换面板位置
- **面板池布局**：切换布局 webview 不重载（CSS Grid + Flex 单渲染路径）
- 面板增删（1-6 个），配置自动持久化
- 快捷键 `Ctrl+T` 新建面板
