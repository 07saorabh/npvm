# @dext7r/npvm-web

npvm Web 前端，基于 React 18 + Vite + TypeScript + TailwindCSS 构建。

**[在线演示](https://npvm.zeabur.app)**

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 功能

- 包管理器检测与切换
- 全局/项目包管理
- 包搜索、安装、卸载、更新
- 依赖树可视化
- 安全漏洞扫描
- 远程仓库分析
- 镜像源管理
- 中英文国际化
- 暗色模式

## 技术栈

- **框架**: React 18
- **构建**: Vite
- **语言**: TypeScript
- **样式**: TailwindCSS
- **状态**: Zustand
- **请求**: React Query
- **国际化**: i18next
- **图标**: Lucide React

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（需同时运行 server）
pnpm dev

# 构建
pnpm build

# 预览构建产物
pnpm preview

# 类型检查
pnpm typecheck
```

## 项目结构

```
src/
├── components/       # 通用组件
│   ├── layout/       # 布局组件
│   └── ui/           # UI 组件
├── hooks/            # 自定义 hooks
├── i18n/             # 国际化配置
│   └── locales/      # 翻译文件
├── lib/              # 工具函数
├── pages/            # 页面组件
│   ├── Dashboard.tsx
│   ├── Packages.tsx
│   ├── Dependencies.tsx
│   ├── Security.tsx
│   ├── RemoteAnalysis.tsx
│   └── Settings.tsx
├── store/            # Zustand 状态
├── App.tsx           # 根组件
└── main.tsx          # 入口文件
```

## 环境变量

在 `.env` 文件中配置：

```env
VITE_API_URL=http://localhost:3456
```

## 许可证

[MIT](../../LICENSE)
