export type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface PackageManagerInfo {
  type: PackageManagerType;
  version: string;
  path: string;
  available: boolean;
}

export interface PackageInfo {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  author?: string;
  keywords?: string[];
  maintainers?: { name: string; email?: string }[];
  time?: { created?: string; modified?: string };
  downloads?: { weekly?: number; monthly?: number };
  engines?: Record<string, string>;
  bugs?: string;
  readme?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export interface InstalledPackage {
  name: string;
  version: string;
  isDev: boolean;
  isPeer: boolean;
  latestVersion?: string;
  hasUpdate: boolean;
}

export interface DependencyNode {
  name: string;
  version: string;
  children: DependencyNode[];
  isCircular?: boolean;
}

export interface VulnerabilityInfo {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  package: string;
  version: string;
  recommendation: string;
  url?: string;
}

export interface AuditSummary {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  total: number;
}

export interface AuditResult {
  vulnerabilities: VulnerabilityInfo[];
  summary: AuditSummary;
}

export interface AuditMetadata {
  projectPath: string;
  packageManager: PackageManagerType;
  scannedAt: number;
  duration: number;
  totalPackages: number;
}

export interface AuditReport {
  metadata: AuditMetadata;
  result: AuditResult;
}

export interface AuditFixResult {
  fixed: number;
  remaining: AuditResult;
  logs: string[];
}

export interface RegistryConfig {
  name: string;
  url: string;
  description?: string;
}

export interface OperationProgress {
  id: string;
  type: 'install' | 'uninstall' | 'update' | 'audit';
  status: 'pending' | 'running' | 'completed' | 'failed';
  package?: string;
  progress: number;
  message: string;
  logs: string[];
  startedAt: number;
  completedAt?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 远程仓库分析相关类型
export type GitPlatform = 'github' | 'gitlab';
export type RemoteSourceType = 'git' | 'npm';

export interface RemoteRepoInfo {
  platform: GitPlatform;
  owner: string;
  repo: string;
  branch?: string;
}

export interface NpmPackageMeta {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
}

export interface RemotePackageInfo {
  name: string;
  version: string;
  isDev: boolean;
}

export interface RemoteUpdateInfo {
  name: string;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
}

export interface RemoteAnalysisResult {
  sourceType: RemoteSourceType;
  repoInfo?: RemoteRepoInfo;
  packageMeta?: NpmPackageMeta;
  packages: RemotePackageInfo[];
  dependencyTree: DependencyNode | null;
  vulnerabilities: VulnerabilityInfo[];
  updates: RemoteUpdateInfo[];
  lockFileType?: 'npm' | 'yarn' | 'pnpm';
}

// ============ 内部解析类型（用于替代 any） ============

/** 依赖信息通用结构 */
export interface DependencyInfo {
  version?: string;
  resolved?: string;
  dependencies?: Record<string, DependencyInfo>;
}

/** npm audit v7+ 漏洞项 */
export interface NpmAuditVulnerability {
  severity: string;
  range?: string;
  fixAvailable?: { name: string; version: string } | boolean;
  via: Array<string | { title?: string; source?: number; cve?: string; url?: string }>;
}

/** npm audit v6 advisory */
export interface NpmAuditAdvisory {
  id?: number;
  title?: string;
  severity?: string;
  module_name?: string;
  vulnerable_versions?: string;
  recommendation?: string;
  url?: string;
}

/** yarn audit advisory */
export interface YarnAuditAdvisory {
  id?: number;
  title?: string;
  severity?: string;
  module_name?: string;
  vulnerable_versions?: string;
  recommendation?: string;
  url?: string;
}

/** npm lock 文件包条目 */
export interface NpmLockPackageEntry {
  version?: string;
  resolved?: string;
  integrity?: string;
  dependencies?: Record<string, string>;
}

/** npm 搜索结果对象 */
export interface NpmSearchObject {
  package: {
    name: string;
    description?: string;
    version: string;
  };
}

/** yarn tree 子节点 */
export interface YarnTreeChild {
  name?: string;
  children?: YarnTreeChild[];
}

/** yarn list 数据结构 */
export interface YarnTreeData {
  trees?: YarnTreeChild[];
}

/** OSV 漏洞事件 */
export interface OsvVulnEvent {
  introduced?: string;
  fixed?: string;
}
