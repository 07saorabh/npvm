import type {
  RemoteRepoInfo,
  RemotePackageInfo,
  RemoteUpdateInfo,
  DependencyNode,
  VulnerabilityInfo,
  RemoteAnalysisResult,
} from '@dext7r/npvm-shared';

const NPM_REGISTRY = 'https://registry.npmjs.org';
const OSV_API = 'https://api.osv.dev/v1/querybatch';

// 解析 Git URL
export function parseGitUrl(url: string): RemoteRepoInfo {
  const patterns = [
    // https://github.com/owner/repo
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/tree\/([^\/]+))?$/,
    // git@github.com:owner/repo.git
    /^git@github\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/,
    // https://gitlab.com/owner/repo
    /^https?:\/\/gitlab\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/-\/tree\/([^\/]+))?$/,
    // git@gitlab.com:owner/repo.git
    /^git@gitlab\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const isGitlab = url.includes('gitlab');
      return {
        platform: isGitlab ? 'gitlab' : 'github',
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
        branch: match[3],
      };
    }
  }

  throw new Error(`Invalid Git URL: ${url}`);
}

// 获取 GitHub 文件内容
async function fetchGitHubFile(
  owner: string,
  repo: string,
  path: string,
  branch?: string
): Promise<string | null> {
  const ref = branch || 'HEAD';
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        'User-Agent': 'NPVM-Remote-Analyzer',
      },
    });

    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}

// 获取 GitLab 文件内容
async function fetchGitLabFile(
  owner: string,
  repo: string,
  path: string,
  branch?: string
): Promise<string | null> {
  const projectId = encodeURIComponent(`${owner}/${repo}`);
  const ref = branch || 'HEAD';
  const encodedPath = encodeURIComponent(path);
  const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodedPath}/raw?ref=${ref}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NPVM-Remote-Analyzer' },
    });

    if (!response.ok) return null;
    return response.text();
  } catch {
    return null;
  }
}

// 通过 API 获取仓库文件
export async function fetchRepoFile(
  repoInfo: RemoteRepoInfo,
  filePath: string
): Promise<string | null> {
  if (repoInfo.platform === 'github') {
    return fetchGitHubFile(repoInfo.owner, repoInfo.repo, filePath, repoInfo.branch);
  } else {
    return fetchGitLabFile(repoInfo.owner, repoInfo.repo, filePath, repoInfo.branch);
  }
}

// 解析 package.json
export function parsePackageJson(content: string): {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
} {
  try {
    const pkg = JSON.parse(content);
    return {
      dependencies: pkg.dependencies || {},
      devDependencies: pkg.devDependencies || {},
    };
  } catch {
    return { dependencies: {}, devDependencies: {} };
  }
}

// 从 package.json 提取包列表
export function extractPackages(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>
): RemotePackageInfo[] {
  const packages: RemotePackageInfo[] = [];

  for (const [name, version] of Object.entries(dependencies)) {
    packages.push({
      name,
      version: version.replace(/^[\^~>=<]/, ''),
      isDev: false,
    });
  }

  for (const [name, version] of Object.entries(devDependencies)) {
    packages.push({
      name,
      version: version.replace(/^[\^~>=<]/, ''),
      isDev: true,
    });
  }

  return packages;
}

// 检测 lock 文件类型
export async function detectLockFileType(
  repoInfo: RemoteRepoInfo
): Promise<{ type: 'npm' | 'yarn' | 'pnpm'; content: string } | null> {
  // 尝试 pnpm-lock.yaml
  let content = await fetchRepoFile(repoInfo, 'pnpm-lock.yaml');
  if (content) return { type: 'pnpm', content };

  // 尝试 yarn.lock
  content = await fetchRepoFile(repoInfo, 'yarn.lock');
  if (content) return { type: 'yarn', content };

  // 尝试 package-lock.json
  content = await fetchRepoFile(repoInfo, 'package-lock.json');
  if (content) return { type: 'npm', content };

  return null;
}

// 解析 package-lock.json 构建依赖树
function parseNpmLockFile(content: string): DependencyNode {
  try {
    const lock = JSON.parse(content);
    const root: DependencyNode = {
      name: lock.name || 'root',
      version: lock.version || '0.0.0',
      children: [],
    };

    // lockfileVersion 2+ 使用 packages 字段
    const packages = lock.packages || {};
    const deps = lock.dependencies || {};

    // 构建一级依赖
    if (Object.keys(packages).length > 0) {
      for (const [path, info] of Object.entries(packages) as [string, any][]) {
        if (path === '' || !path.startsWith('node_modules/')) continue;

        // 只处理一级依赖
        const parts = path.replace('node_modules/', '').split('node_modules/');
        if (parts.length === 1) {
          root.children.push({
            name: parts[0],
            version: info.version || '0.0.0',
            children: [],
          });
        }
      }
    } else if (Object.keys(deps).length > 0) {
      for (const [name, info] of Object.entries(deps) as [string, any][]) {
        root.children.push({
          name,
          version: info.version || '0.0.0',
          children: [],
        });
      }
    }

    return root;
  } catch {
    return { name: 'root', version: '0.0.0', children: [] };
  }
}

// 解析 yarn.lock
function parseYarnLockFile(content: string): DependencyNode {
  const root: DependencyNode = {
    name: 'root',
    version: '0.0.0',
    children: [],
  };

  try {
    // 简化解析：提取包名和版本
    const regex = /^"?([^@\s]+)@[^"]+?"?:\s*\n\s+version\s+"([^"]+)"/gm;
    let match;
    const seen = new Set<string>();

    while ((match = regex.exec(content)) !== null) {
      const name = match[1];
      const version = match[2];

      if (!seen.has(name)) {
        seen.add(name);
        root.children.push({ name, version, children: [] });
      }
    }
  } catch {
    // 忽略解析错误
  }

  return root;
}

// 解析 pnpm-lock.yaml
function parsePnpmLockFile(content: string): DependencyNode {
  const root: DependencyNode = {
    name: 'root',
    version: '0.0.0',
    children: [],
  };

  try {
    // 简化解析：提取 packages 下的条目
    const lines = content.split('\n');
    let inPackages = false;
    const seen = new Set<string>();

    for (const line of lines) {
      if (line.startsWith('packages:')) {
        inPackages = true;
        continue;
      }

      if (inPackages && line.match(/^[a-z]/i)) {
        break;
      }

      if (inPackages) {
        // 匹配形如 /package-name@version: 或 'package-name@version':
        const match = line.match(/^\s+['"]?\/?([@\w\-./]+)@(\d+\.\d+\.\d+[^'":]*)/);
        if (match) {
          const name = match[1];
          const version = match[2];

          if (!seen.has(name)) {
            seen.add(name);
            root.children.push({ name, version, children: [] });
          }
        }
      }
    }
  } catch {
    // 忽略解析错误
  }

  return root;
}

// 解析 lock 文件构建依赖树
export function parseLockFile(
  content: string,
  type: 'npm' | 'yarn' | 'pnpm'
): DependencyNode {
  switch (type) {
    case 'npm':
      return parseNpmLockFile(content);
    case 'yarn':
      return parseYarnLockFile(content);
    case 'pnpm':
      return parsePnpmLockFile(content);
    default:
      return { name: 'root', version: '0.0.0', children: [] };
  }
}

// 调用 OSV API 检查漏洞
export async function checkVulnerabilities(
  packages: { name: string; version: string }[]
): Promise<VulnerabilityInfo[]> {
  if (packages.length === 0) return [];

  try {
    const queries = packages.map((pkg) => ({
      package: { name: pkg.name, ecosystem: 'npm' },
      version: pkg.version,
    }));

    const response = await fetch(OSV_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const vulnerabilities: VulnerabilityInfo[] = [];

    for (let i = 0; i < (data.results || []).length; i++) {
      const result = data.results[i];
      const pkg = packages[i];

      for (const vuln of result.vulns || []) {
        const severity = mapOsvSeverity(vuln.severity || vuln.database_specific?.severity);
        vulnerabilities.push({
          id: vuln.id,
          title: vuln.summary || vuln.id,
          severity,
          package: pkg.name,
          version: pkg.version,
          recommendation: vuln.affected?.[0]?.ranges?.[0]?.events?.find((e: any) => e.fixed)?.fixed
            ? `Upgrade to ${vuln.affected[0].ranges[0].events.find((e: any) => e.fixed).fixed}`
            : 'No fix available',
          url: vuln.references?.[0]?.url,
        });
      }
    }

    return vulnerabilities;
  } catch {
    return [];
  }
}

function mapOsvSeverity(severity: string | undefined): 'critical' | 'high' | 'moderate' | 'low' {
  if (!severity) return 'moderate';
  const s = severity.toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high') return 'high';
  if (s === 'moderate' || s === 'medium') return 'moderate';
  return 'low';
}

// 批量检查包的最新版本
export async function checkUpdates(
  packages: { name: string; version: string }[]
): Promise<RemoteUpdateInfo[]> {
  const results = await Promise.all(
    packages.map(async (pkg) => {
      try {
        const response = await fetch(`${NPM_REGISTRY}/${pkg.name}`);
        if (!response.ok) {
          return {
            name: pkg.name,
            currentVersion: pkg.version,
            latestVersion: pkg.version,
            hasUpdate: false,
          };
        }

        const data = await response.json();
        const latest = data['dist-tags']?.latest || pkg.version;

        return {
          name: pkg.name,
          currentVersion: pkg.version,
          latestVersion: latest,
          hasUpdate: latest !== pkg.version && !pkg.version.includes(latest),
        };
      } catch {
        return {
          name: pkg.name,
          currentVersion: pkg.version,
          latestVersion: pkg.version,
          hasUpdate: false,
        };
      }
    })
  );

  return results;
}

// 完整分析远程仓库
export async function analyzeRemoteRepo(repoUrl: string, branch?: string): Promise<RemoteAnalysisResult> {
  // 解析 Git URL
  const repoInfo = parseGitUrl(repoUrl);
  if (branch) repoInfo.branch = branch;

  // 获取 package.json
  const packageJsonContent = await fetchRepoFile(repoInfo, 'package.json');
  if (!packageJsonContent) {
    throw new Error('package.json not found in repository');
  }

  // 解析 package.json
  const { dependencies, devDependencies } = parsePackageJson(packageJsonContent);
  const packages = extractPackages(dependencies, devDependencies);

  // 检测并解析 lock 文件
  let dependencyTree: DependencyNode | null = null;
  let lockFileType: 'npm' | 'yarn' | 'pnpm' | undefined;

  const lockFile = await detectLockFileType(repoInfo);
  if (lockFile) {
    lockFileType = lockFile.type;
    dependencyTree = parseLockFile(lockFile.content, lockFile.type);
  }

  // 并行执行漏洞检查和更新检查
  const packagesForCheck = packages.slice(0, 50).map((p) => ({ name: p.name, version: p.version }));

  const [vulnerabilities, updates] = await Promise.all([
    checkVulnerabilities(packagesForCheck),
    checkUpdates(packagesForCheck),
  ]);

  return {
    repoInfo,
    packages,
    dependencyTree,
    vulnerabilities,
    updates,
    lockFileType,
  };
}
