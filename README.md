# AIpane

单窗口多面板浏览器 —— 像窗格一样并排浏览多个网页。基于 Electron + React。

## 功能

- 并排 1-6 个网页，各自独立浏览
- 三种布局：横向、纵向、田字
- 拖拽分割线调整面板比例
- **拖拽排序**：拖动地址栏即可交换面板位置
- 地址栏支持 URL 导航、前进、后退、刷新
- 内联设置面板，右上角齿轮按钮唤出
- 所有配置自动保存，重启恢复
- 快捷键 `Ctrl+T` 新建面板

## 安装与运行

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发模式（含热更新）
node build.mjs && ./node_modules/.bin/electron .   # 生产模式
```

## 技术栈

Electron · React · TypeScript · zustand · Vite · Tailwind CSS

## 项目结构

```
src/
├── main/         # Electron 主进程
├── preload/      # IPC 桥接
├── renderer/     # React 应用
│   └── components/  # PanelGrid / PanelView / SplitPane / SettingsPanel
├── settings/     # 独立设置页面（备用）
└── shared/       # 跨进程类型
```
