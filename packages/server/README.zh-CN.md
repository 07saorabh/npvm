# @dext7r/npvm-server

NPVM 后端服务，基于 Fastify 构建。

**[在线演示](https://npvm.zeabur.app)** | **[API 文档](https://npvm.zeabur.app/docs)**

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 功能

- RESTful API 接口
- Swagger 文档自动生成
- SSE 实时进度推送
- 静态文件托管（前端）
- 多包管理器支持
- 远程仓库分析

## 安装

```bash
pnpm add @dext7r/npvm-server
```

## 使用

```typescript
import { createServer, startServer } from '@dext7r/npvm-server';

// 直接启动
startServer({ port: 3456 });

// 或获取 app 实例
const { app } = await createServer({ port: 3456 });
await app.listen({ port: 3456 });
```

## API 端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/pm/detect` | 检测已安装的包管理器 |
| GET | `/api/pm/current` | 获取当前包管理器 |
| PUT | `/api/pm/current` | 设置包管理器 |
| GET | `/api/packages` | 获取已安装的包列表 |
| GET | `/api/packages/search` | 搜索 npm 包 |
| POST | `/api/packages/install` | 安装包 (SSE) |
| POST | `/api/packages/update` | 更新包 (SSE) |
| POST | `/api/packages/uninstall` | 卸载包 (SSE) |
| POST | `/api/security/audit` | 运行安全审计 (SSE) |
| GET | `/api/deps/tree` | 获取依赖树 |
| GET | `/api/registry/list` | 获取可用镜像源列表 |
| GET | `/api/registry/current` | 获取当前镜像源 |
| PUT | `/api/registry/current` | 设置镜像源 |
| POST | `/api/remote/analyze` | 分析远程仓库 |

## 开发

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm typecheck
```

## 环境变量

| 变量 | 默认值 | 描述 |
|------|--------|------|
| `NODE_ENV` | `development` | 运行环境 |
| `PORT` | `3456` | 服务端口 |

## 许可证

[MIT](../../LICENSE)
