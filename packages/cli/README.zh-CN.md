# @dext7r/npvm-cli

npvm 命令行工具，一键启动包管理可视化平台。

[![npm version](https://img.shields.io/npm/v/@dext7r/npvm-cli.svg)](https://www.npmjs.com/package/@dext7r/npvm-cli)

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 安装

```bash
npm install -g @dext7r/npvm-cli
# 或
pnpm add -g @dext7r/npvm-cli
# 或
yarn global add @dext7r/npvm-cli
```

## 使用

```bash
# 在当前目录启动（项目模式）
npvm

# 指定端口
npvm --port 8080
npvm -p 8080

# 指定项目路径
npvm --path /path/to/project
npvm -P /path/to/project

# 查看帮助
npvm --help

# 查看版本
npvm --version
```

## 命令参数

| 参数 | 简写 | 默认值 | 描述 |
|------|------|--------|------|
| `--port` | `-p` | `3456` | 服务端口 |
| `--path` | `-P` | `process.cwd()` | 项目路径 |
| `--help` | `-h` | - | 显示帮助 |
| `--version` | `-V` | - | 显示版本 |

## 工作模式

CLI 会自动检测当前目录：

- **项目模式**: 目录包含 `package.json` 或 `node_modules`
- **全局模式**: 其他情况，管理全局安装的包

## 示例

```bash
# 在 React 项目中启动
cd my-react-app
npvm

# 分析其他项目
npvm -P ~/projects/my-vue-app

# 使用自定义端口
npvm -p 9000
```

启动后访问 `http://localhost:3456` 即可使用 Web 界面。

## 许可证

[MIT](../../LICENSE)
