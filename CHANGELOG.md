# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Version check feature in settings - compare local build with GitHub latest commit
- Package detail modal with fullscreen toggle support
- package.json importer - import dependencies from local file or URL
- Sidebar title (npvm) now clickable to navigate to dashboard
- Multiple deployment platform demo links in footer (Zeabur, Vercel, Cloudflare, Netlify, Deno, Surge, Render, Railway, Kinsta)
- Build-time version injection via Vite define (`__BUILD_INFO__`)
- Refresh button spin animation when fetching packages
- Audit history with export functionality (JSON/CSV/HTML)
- Project path history with timestamps
- Sorting and pagination options for package list

### Changed

- Improved ESLint configuration for React hooks rules
- Enhanced i18n support with more translation keys

### Fixed

- Fixed component creation during render in RepoInfoCard
- Fixed unused variable lint errors
- Fixed animation state management in ConfirmDialog

## [0.1.0] - Initial Release

### Added

- Multi package manager support (npm, yarn, pnpm, bun)
- Global and project mode package management
- Registry switching (npm, taobao, tencent, etc.)
- Package operations (install, uninstall, update) with real-time progress
- Package update detection and deprecated package indicators
- Security vulnerability scanning
- Dependency tree visualization
- Remote repository analysis (GitHub/GitLab/npm)
- Internationalization (English, Chinese)
- Dark mode support
- Swagger API documentation
- Docker support

[Unreleased]: https://github.com/h7ml/npvm/commits/main
[0.1.0]: https://github.com/h7ml/npvm/releases/tag/v0.1.0
