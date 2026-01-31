# @dext7r/npvm-shared

NPVM 共享类型和工具库。

[English](./README.md) | [简体中文](./README.zh-CN.md)

## 安装

```bash
pnpm add @dext7r/npvm-shared
```

## 导出类型

### 包管理器相关

```typescript
type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'bun';

interface PackageManagerInfo {
  type: PackageManagerType;
  version: string;
  available: boolean;
}

interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  isDev: boolean;
  isGlobal: boolean;
  homepage?: string;
  deprecated?: string;
  latestVersion?: string;
  hasUpdate?: boolean;
}
```

### 依赖分析

```typescript
interface DependencyNode {
  name: string;
  version: string;
  children: DependencyNode[];
  isCircular?: boolean;
}
```

### 安全审计

```typescript
type VulnerabilitySeverity = 'critical' | 'high' | 'moderate' | 'low';

interface VulnerabilityInfo {
  id: string;
  package: string;
  version: string;
  severity: VulnerabilitySeverity;
  title: string;
  recommendation: string;
  url?: string;
}
```

### 远程仓库分析

```typescript
type GitPlatform = 'github' | 'gitlab';

interface RemoteRepoInfo {
  platform: GitPlatform;
  owner: string;
  repo: string;
  branch?: string;
}

interface RemoteAnalysisResult {
  repoInfo: RemoteRepoInfo;
  packages: RemotePackageInfo[];
  dependencyTree: DependencyNode | null;
  vulnerabilities: VulnerabilityInfo[];
  updates: RemoteUpdateInfo[];
  lockFileType?: 'npm' | 'yarn' | 'pnpm';
}
```

## 许可证

[MIT](../../LICENSE)
