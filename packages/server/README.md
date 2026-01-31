# @dext7r/npvm-server

npvm backend service built with Fastify.

**[Live Demo](https://npvm.zeabur.app)** | **[API Docs](https://npvm.zeabur.app/docs)**

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Features

- RESTful API endpoints
- Auto-generated Swagger documentation
- SSE real-time progress streaming
- Static file hosting (frontend)
- Multi package manager support
- Remote repository analysis

## Installation

```bash
pnpm add @dext7r/npvm-server
```

## Usage

```typescript
import { createServer, startServer } from '@dext7r/npvm-server';

// Start directly
startServer({ port: 3456 });

// Or get app instance
const { app } = await createServer({ port: 3456 });
await app.listen({ port: 3456 });
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pm/detect` | Detect installed package managers |
| GET | `/api/pm/current` | Get current package manager |
| PUT | `/api/pm/current` | Set package manager |
| GET | `/api/packages` | List installed packages |
| GET | `/api/packages/search` | Search npm packages |
| POST | `/api/packages/install` | Install packages (SSE) |
| POST | `/api/packages/update` | Update packages (SSE) |
| POST | `/api/packages/uninstall` | Uninstall packages (SSE) |
| POST | `/api/security/audit` | Run security audit (SSE) |
| GET | `/api/deps/tree` | Get dependency tree |
| GET | `/api/registry/list` | List available registries |
| GET | `/api/registry/current` | Get current registry |
| PUT | `/api/registry/current` | Set registry |
| POST | `/api/remote/analyze` | Analyze remote repository |

## Development

```bash
# Dev mode
pnpm dev

# Build
pnpm build

# Type check
pnpm typecheck
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `3456` | Server port |

## License

[MIT](../../LICENSE)
