# @dext7r/npvm-shared

npvm 共享类型和工具库。

[English](./README.md) | [简体中文](./README.zh-CN.md)

## Installation

```bash
pnpm add @dext7r/npvm-shared
```

## Exported Types

### Package Manager

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

### Dependency Analysis

```typescript
interface DependencyNode {
  name: string;
  version: string;
  children: DependencyNode[];
  isCircular?: boolean;
}
```

### Security Audit

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

### Remote Repository Analysis

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

## License

[MIT](../../LICENSE)
