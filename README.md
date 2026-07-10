# 多栏浏览器

在一个窗口中并排打开多个网页，各自独立浏览。基于 Electron + React。

## 功能

- 并排 1-6 个网页，各自独立浏览
- 三种布局：横向、纵向、田字
- 拖拽分割线调整比例（横向/纵向模式）
- 地址栏输入 URL 导航，支持前进/后退/刷新/面板重命名
- 内联设置面板，右上角齿轮按钮唤出，配置面板数量/URL/布局
- 所有配置自动保存，下次启动恢复
- 快捷键：`Ctrl+T` 新面板
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
├── renderer/     # React 应用（面板网格、地址栏、设置面板）
├── settings/     # 独立设置页面（备用）
└── shared/       # 共享类型
```
