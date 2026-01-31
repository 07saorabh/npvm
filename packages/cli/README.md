# @dext7r/npvm-cli

NPVM command line tool for launching the visual package management platform.

[![npm version](https://img.shields.io/npm/v/@dext7r/npvm-cli.svg)](https://www.npmjs.com/package/@dext7r/npvm-cli)

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Installation

```bash
npm install -g @dext7r/npvm-cli
# or
pnpm add -g @dext7r/npvm-cli
# or
yarn global add @dext7r/npvm-cli
```

## Usage

```bash
# Start in current directory (project mode)
npvm

# Specify port
npvm --port 8080
npvm -p 8080

# Specify project path
npvm --path /path/to/project
npvm -P /path/to/project

# Show help
npvm --help

# Show version
npvm --version
```

## Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--port` | `-p` | `3456` | Server port |
| `--path` | `-P` | `process.cwd()` | Project path |
| `--help` | `-h` | - | Show help |
| `--version` | `-V` | - | Show version |

## Working Modes

CLI auto-detects the current directory:

- **Project Mode**: Directory contains `package.json` or `node_modules`
- **Global Mode**: Otherwise, manages globally installed packages

## Examples

```bash
# Start in a React project
cd my-react-app
npvm

# Analyze another project
npvm -P ~/projects/my-vue-app

# Use custom port
npvm -p 9000
```

After starting, visit `http://localhost:3456` to use the web interface.

## License

[MIT](../../LICENSE)
