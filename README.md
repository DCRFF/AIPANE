# 多栏浏览器

在一个窗口中并排打开多个网页，各自独立浏览。基于 Electron + React。

## 功能

- 并排 1-6 个网页，各自独立浏览
- 三种布局：横向、纵向、田字
- 拖拽分割线调整比例（横向/纵向模式）
- 地址栏输入 URL 导航，支持前进/后退/刷新
- 所有配置自动保存，下次启动恢复
- 快捷键：`Ctrl+T` 新面板、`Ctrl+W` 关闭面板、`Ctrl+L` 聚焦地址栏

## 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式（含热更新）
pnpm dev

# 生产模式
node build.mjs && ./node_modules/.bin/electron .
```

## 技术栈

Electron · React · TypeScript · zustand · Vite · Tailwind CSS

## 项目结构

```
src/
├── main/         # Electron 主进程
├── preload/      # IPC 桥接
├── renderer/     # React 外壳
├── settings/     # 设置窗口（独立 BrowserWindow）
└── shared/       # 共享类型
```
