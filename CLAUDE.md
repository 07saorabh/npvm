# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供本仓库的开发指引。

## 构建与开发命令

```bash
pnpm install          # 安装所有依赖
pnpm dev              # 启动所有开发服务（server:3456, web:5173）
pnpm build            # 构建所有包（Turbo 自动管理顺序：shared → server/web → cli）
pnpm typecheck        # 全包 TypeScript 类型检查
pnpm clean            # 清理所有包的 dist/ 和 .turbo/

# 单包操作
pnpm --filter @dext7r/npvm-shared build
pnpm --filter @dext7r/npvm-server dev
pnpm --filter @dext7r/npvm-web dev
```

尚未配置测试框架 — `pnpm test` 已定义但无测试运行器。

## 架构

pnpm workspaces + Turborepo **单仓库**。四个包的依赖关系：

```
shared（纯类型，零依赖）
  ↓
server（Fastify 后端，导入 shared）
  ↓
cli（Commander.js 薄封装，导入 server）

web（React 前端，编译时导入 shared，运行时代理 /api → server）
```

### packages/shared
纯 TypeScript 类型与常量。`src/types.ts` 定义所有跨包接口（`PackageManagerType`、`PackageInfo`、`DependencyNode`、`AuditResult`、`RemoteAnalysisResult` 等）。`src/registries.ts` 包含 `REGISTRIES` 镜像源数组。通过 `tsc` 编译到 `dist/`。

### packages/server
Fastify 服务器，端口 3456。关键结构：
- `src/index.ts` — `createServer()` 工厂函数，生产环境静态文件托管，SPA 回退
- `src/routes/api.ts` — 所有 REST 端点注册在 `/api` 下
- `src/adapters/` — 包管理器适配器（npm、yarn、pnpm、bun），继承 `base.ts` 基类，通过 `execa` 封装原生 CLI 命令
- `src/services/` — 业务逻辑（包操作、安全审计、远程分析）
- 安装/更新/卸载使用 SSE 流式推送进度

### packages/web
React 18 + Vite + TailwindCSS。开发模式下 Vite 代理 `/api` 到 `localhost:3456`。
- `src/pages/` — 8 个路由页面（Dashboard、Packages、Dependencies、Security、RemoteAnalysis、Docs、Changelog、Settings）
- `src/components/ui/` — 共享组件库（Button、Card、Badge、Spinner、EmptyState、ConfirmDialog、Toast）
- `src/stores/app.ts` — Zustand 状态管理（暗色模式、侧边栏、当前包管理器、全局/项目模式）
- `src/hooks/usePackages.ts` — TanStack React Query hooks，封装所有 API 调用
- `src/lib/api.ts` — `fetchApi()` 请求封装，支持 localStorage 覆盖 base URL（连接远程后端）
- `src/i18n/` — i18next 国际化，`locales/en.json` 和 `locales/zh.json`
- `src/data/changelog.json` — 独立维护的双语更新日志数据

### packages/cli
薄封装层：`npvm start` 调用 server 的 `createServer()`，自动打开浏览器。通过 `tsup` 打包为单文件 `dist/index.js`。发布为 `@dext7r/npvm-cli`，提供 `npvm` 可执行命令。

## 关键模式

- **全 ESM** — 所有包使用 `"type": "module"`，服务端导入使用 `.js` 扩展名。
- **共享类型而非运行时** — `shared` 仅导出类型和常量，无运行时逻辑。
- **适配器模式** — 每个包管理器（npm/yarn/pnpm/bun）在 `server/src/adapters/` 中有独立适配器，实现统一接口。
- **SSE 长操作** — 安装/更新/卸载通过 SSE 流式推送进度事件，前端使用 `EventSource` 消费。
- **生产托管** — Server 直接托管 `packages/web/dist` 静态文件并提供 SPA 回退，无需额外 Web 服务器。
- **国际化** — 所有用户可见文案通过 `react-i18next`，修改 UI 文案时需同步更新 `en.json` 和 `zh.json`。
- **UI 组件** — 始终使用 `src/components/ui/` 中的组件（Card、Button、Badge 等），禁止使用原生 HTML 元素。
