# @dext7r/npvm-web

NPVM Web frontend built with React 18 + Vite + TypeScript + TailwindCSS.

**[Live Demo](https://npvm.zeabur.app)**

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Features

- Package manager detection & switching
- Global/project package management
- Package search, install, uninstall, update
- Dependency tree visualization
- Security vulnerability scanning
- Remote repository analysis
- Registry management
- i18n (English & Chinese)
- Dark mode

## Tech Stack

- **Framework**: React 18
- **Build**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **Data Fetching**: React Query
- **i18n**: i18next
- **Icons**: Lucide React

## Development

```bash
# Install dependencies
pnpm install

# Dev mode (requires server running)
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview

# Type check
pnpm typecheck
```

## Project Structure

```
src/
├── components/       # Shared components
│   ├── layout/       # Layout components
│   └── ui/           # UI components
├── hooks/            # Custom hooks
├── i18n/             # i18n configuration
│   └── locales/      # Translation files
├── lib/              # Utilities
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── Packages.tsx
│   ├── Dependencies.tsx
│   ├── Security.tsx
│   ├── RemoteAnalysis.tsx
│   └── Settings.tsx
├── store/            # Zustand stores
├── App.tsx           # Root component
└── main.tsx          # Entry point
```

## Environment Variables

Configure in `.env`:

```env
VITE_API_URL=http://localhost:3456
```

## License

[MIT](../../LICENSE)
