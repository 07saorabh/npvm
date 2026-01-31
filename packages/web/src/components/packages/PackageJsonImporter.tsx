import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileJson,
  Upload,
  Link,
  Package,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card, Button, Badge, Input } from '../ui';

interface ParsedDependency {
  name: string;
  version: string;
  isDev: boolean;
  selected: boolean;
}

interface PackageJsonImporterProps {
  onInstall: (packages: { name: string; version: string; isDev: boolean }[]) => void;
  isInstalling?: boolean;
  className?: string;
}

type ImportMode = 'file' | 'url';

export function PackageJsonImporter({
  onInstall,
  isInstalling = false,
  className,
}: PackageJsonImporterProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<ImportMode>('file');
  const [url, setUrl] = useState('');
  const [dependencies, setDependencies] = useState<ParsedDependency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDevDeps, setShowDevDeps] = useState(true);
  const [showProdDeps, setShowProdDeps] = useState(true);

  // 解析 package.json 内容
  const parsePackageJson = useCallback((content: string) => {
    try {
      const pkg = JSON.parse(content);
      const deps: ParsedDependency[] = [];

      // 生产依赖
      if (pkg.dependencies) {
        Object.entries(pkg.dependencies).forEach(([name, version]) => {
          deps.push({ name, version: String(version), isDev: false, selected: true });
        });
      }

      // 开发依赖
      if (pkg.devDependencies) {
        Object.entries(pkg.devDependencies).forEach(([name, version]) => {
          deps.push({ name, version: String(version), isDev: true, selected: true });
        });
      }

      if (deps.length === 0) {
        setError(t('packageImporter.noDependencies'));
        return;
      }

      setDependencies(deps);
      setError(null);
    } catch {
      setError(t('packageImporter.parseError'));
    }
  }, [t]);

  // 处理文件上传
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name !== 'package.json') {
      setError(t('packageImporter.invalidFile'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parsePackageJson(content);
    };
    reader.onerror = () => {
      setError(t('packageImporter.readError'));
    };
    reader.readAsText(file);
  }, [parsePackageJson, t]);

  // 处理 URL 获取
  const handleUrlFetch = useCallback(async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // 处理 GitHub raw URL
      let fetchUrl = url.trim();
      if (fetchUrl.includes('github.com') && !fetchUrl.includes('raw.githubusercontent.com')) {
        fetchUrl = fetchUrl
          .replace('github.com', 'raw.githubusercontent.com')
          .replace('/blob/', '/');
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const content = await response.text();
      parsePackageJson(content);
    } catch {
      setError(t('packageImporter.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [url, parsePackageJson, t]);

  // 切换单个依赖选中状态
  const toggleDependency = useCallback((name: string) => {
    setDependencies((prev) =>
      prev.map((dep) =>
        dep.name === name ? { ...dep, selected: !dep.selected } : dep
      )
    );
  }, []);

  // 全选/取消全选
  const toggleAll = useCallback((selected: boolean) => {
    setDependencies((prev) =>
      prev.map((dep) => ({
        ...dep,
        selected: (showProdDeps && !dep.isDev) || (showDevDeps && dep.isDev) ? selected : dep.selected,
      }))
    );
  }, [showProdDeps, showDevDeps]);

  // 过滤后的依赖列表
  const filteredDeps = useMemo(() => {
    return dependencies.filter((dep) => {
      if (dep.isDev && !showDevDeps) return false;
      if (!dep.isDev && !showProdDeps) return false;
      return true;
    });
  }, [dependencies, showDevDeps, showProdDeps]);

  // 统计信息
  const stats = useMemo(() => {
    const prod = dependencies.filter((d) => !d.isDev);
    const dev = dependencies.filter((d) => d.isDev);
    const selectedProd = prod.filter((d) => d.selected).length;
    const selectedDev = dev.filter((d) => d.selected).length;
    return {
      total: dependencies.length,
      prod: prod.length,
      dev: dev.length,
      selectedProd,
      selectedDev,
      selectedTotal: selectedProd + selectedDev,
    };
  }, [dependencies]);

  // 执行安装
  const handleInstall = useCallback(() => {
    const selected = dependencies.filter((d) => d.selected);
    if (selected.length === 0) return;
    onInstall(selected.map(({ name, version, isDev }) => ({ name, version, isDev })));
  }, [dependencies, onInstall]);

  // 清空
  const handleClear = useCallback(() => {
    setDependencies([]);
    setUrl('');
    setError(null);
  }, []);

  return (
    <Card className={clsx('animate-fade-in', className)}>
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileJson size={18} className="text-primary-500" />
          <h3 className="font-medium text-gray-800 dark:text-gray-100">
            {t('packageImporter.title')}
          </h3>
          {dependencies.length > 0 && (
            <Badge variant="info" size="sm">
              {stats.selectedTotal}/{stats.total}
            </Badge>
          )}
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* 模式切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('file')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
                mode === 'file'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <Upload size={14} />
              {t('packageImporter.localFile')}
            </button>
            <button
              onClick={() => setMode('url')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
                mode === 'url'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <Link size={14} />
              {t('packageImporter.fromUrl')}
            </button>
          </div>

          {/* 文件上传 */}
          {mode === 'file' && (
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('packageImporter.dropOrClick')}
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* URL 输入 */}
          {mode === 'url' && (
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t('packageImporter.urlPlaceholder')}
                className="flex-1"
                clearable
              />
              <Button
                onClick={handleUrlFetch}
                disabled={!url.trim() || isLoading}
                loading={isLoading}
              >
                {t('packageImporter.fetch')}
              </Button>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* 依赖列表 */}
          {dependencies.length > 0 && (
            <>
              {/* 过滤和操作栏 */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showProdDeps}
                      onChange={(e) => setShowProdDeps(e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('common.prod')} ({stats.prod})
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDevDeps}
                      onChange={(e) => setShowDevDeps(e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('common.dev')} ({stats.dev})
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAll(true)}
                    className="text-xs text-primary-500 hover:text-primary-600"
                  >
                    {t('packageImporter.selectAll')}
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={() => toggleAll(false)}
                    className="text-xs text-gray-500 hover:text-gray-600"
                  >
                    {t('packageImporter.deselectAll')}
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    {t('common.clear')}
                  </button>
                </div>
              </div>

              {/* 依赖列表 */}
              <div className="max-h-[300px] overflow-y-auto scrollbar-thin space-y-1">
                {filteredDeps.map((dep) => (
                  <div
                    key={dep.name}
                    onClick={() => toggleDependency(dep.name)}
                    className={clsx(
                      'flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors',
                      dep.selected
                        ? 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {dep.selected ? (
                        <CheckSquare size={16} className="text-primary-500 flex-shrink-0" />
                      ) : (
                        <Square size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      <Package size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {dep.name}
                      </span>
                      <Badge variant={dep.isDev ? 'warning' : 'success'} size="sm">
                        {dep.isDev ? 'dev' : 'prod'}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                      {dep.version}
                    </span>
                  </div>
                ))}
              </div>

              {/* 安装按钮 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500">
                  {t('packageImporter.selectedCount', { count: stats.selectedTotal })}
                </span>
                <Button
                  onClick={handleInstall}
                  disabled={stats.selectedTotal === 0 || isInstalling}
                  loading={isInstalling}
                  leftIcon={<Package size={16} />}
                >
                  {t('packageImporter.installSelected')}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
