import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Search,
  Plus,
  Trash2,
  RefreshCw,
  Package as PackageIcon,
  Globe,
  Folder,
  ArrowUp,
  AlertTriangle,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';
import {
  useInstalledPackages,
  useSearchPackages,
  useInstallPackage,
  useUninstallPackage,
  useUpdatePackage,
  useCheckUpdates,
} from '../../hooks/usePackages';
import { useAppStore } from '../../stores/app';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Card, Button, Badge, EmptyState, Select } from '../ui';
import { PackageJsonImporter } from './PackageJsonImporter';
import { PackageDetailModal } from './PackageDetailModal';
import { clsx } from 'clsx';
import type { InstalledPackage } from '@dext7r/npvm-shared';

type SortField = 'name' | 'version' | 'type';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '500', label: '500' },
  { value: '1000', label: '1000' },
  { value: '2000', label: '2000' },
  { value: '5000', label: '5000' },
  { value: '10000', label: '10000' },
];

const ROW_HEIGHT = 52;

export function PackageList() {
  const { t } = useTranslation();
  const [npmSearchQuery, setNpmSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [installAsDev, setInstallAsDev] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'uninstall' | 'updateAll';
    packageName?: string;
  }>({ open: false, type: 'uninstall' });
  const [clickedRow, setClickedRow] = useState<string | null>(null);
  const [animatingPackages, setAnimatingPackages] = useState<Set<string>>(new Set());
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; version: string; isDev: boolean } | null>(null);
  const prevPackagesRef = useRef<string[]>([]);

  const parentRef = useRef<HTMLDivElement>(null);

  const { data: packages = [], isLoading, isFetching, refetch } = useInstalledPackages();
  const { data: searchResults = [] } = useSearchPackages(npmSearchQuery);
  const installMutation = useInstallPackage();
  const uninstallMutation = useUninstallPackage();
  const updateMutation = useUpdatePackage();
  const { isGlobal, setIsGlobal } = useAppStore();

  const packagesToCheck = useMemo(
    () => packages.map((p) => ({ name: p.name, version: p.version })),
    [packages]
  );
  const { data: updateInfo = [] } = useCheckUpdates(packagesToCheck);

  const updateMap = useMemo(() => {
    const map = new Map<string, { hasUpdate: boolean; latestVersion: string; deprecated?: string }>();
    updateInfo.forEach((info) => {
      map.set(info.name, {
        hasUpdate: info.hasUpdate,
        latestVersion: info.latestVersion,
        deprecated: info.deprecated,
      });
    });
    return map;
  }, [updateInfo]);

  // 检测包列表变化，触发动画
  useEffect(() => {
    const currentNames = packages.map((p) => p.name);
    const prevNames = prevPackagesRef.current;

    if (prevNames.length > 0) {
      // 新增的包
      const added = currentNames.filter((name) => !prevNames.includes(name));
      // 删除的包（已从列表移除，无需动画）
      // 更新的包（版本变化检测可在此扩展）

      if (added.length > 0) {
        setAnimatingPackages(new Set(added));
        // 动画结束后清除状态
        const timer = setTimeout(() => setAnimatingPackages(new Set()), 500);
        return () => clearTimeout(timer);
      }
    }

    prevPackagesRef.current = currentNames;
  }, [packages]);

  // 行点击效果 - 打开包详情
  const handleRowClick = (pkg: InstalledPackage) => {
    setClickedRow(pkg.name);
    setTimeout(() => setClickedRow(null), 150);
    setSelectedPackage({ name: pkg.name, version: pkg.version, isDev: pkg.isDev });
  };

  // 本地过滤
  const filteredPackages = useMemo(() => {
    if (!filterQuery.trim()) return packages;
    const query = filterQuery.toLowerCase();
    return packages.filter((pkg) => pkg.name.toLowerCase().includes(query));
  }, [packages, filterQuery]);

  // 排序
  const sortedPackages = useMemo(() => {
    const sorted = [...filteredPackages];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'version':
          comparison = a.version.localeCompare(b.version);
          break;
        case 'type':
          comparison = (a.isDev ? 1 : 0) - (b.isDev ? 1 : 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredPackages, sortField, sortDirection]);

  // 分页
  const totalPages = Math.ceil(sortedPackages.length / pageSize);
  const paginatedPackages = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedPackages.slice(start, start + pageSize);
  }, [sortedPackages, page, pageSize]);

  // 虚拟滚动
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: paginatedPackages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  // 重置分页
  const handleFilterChange = (value: string) => {
    setFilterQuery(value);
    setPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUpIcon size={14} className="text-primary-500" />
    ) : (
      <ArrowDownIcon size={14} className="text-primary-500" />
    );
  };

  const handleInstall = async (name: string, dev = false) => {
    await installMutation.mutateAsync({ packages: [name], dev });
    setShowSearch(false);
    setNpmSearchQuery('');
  };

  const handleBatchInstall = async () => {
    const pkgs = manualInput.trim().split(/\s+/).filter(Boolean);
    if (pkgs.length === 0) return;
    await installMutation.mutateAsync({ packages: pkgs, dev: installAsDev });
    setManualInput('');
    setShowSearch(false);
  };

  // 从 package.json 导入安装
  const handleImportInstall = async (packages: { name: string; version: string; isDev: boolean }[]) => {
    if (packages.length === 0) return;
    // 分组：生产依赖和开发依赖
    const prodPkgs = packages.filter((p) => !p.isDev).map((p) => `${p.name}@${p.version}`);
    const devPkgs = packages.filter((p) => p.isDev).map((p) => `${p.name}@${p.version}`);
    // 依次安装
    if (prodPkgs.length > 0) {
      await installMutation.mutateAsync({ packages: prodPkgs, dev: false });
    }
    if (devPkgs.length > 0) {
      await installMutation.mutateAsync({ packages: devPkgs, dev: true });
    }
  };

  const handleUninstall = async (name: string) => {
    setConfirmDialog({ open: true, type: 'uninstall', packageName: name });
  };

  const confirmUninstall = async () => {
    if (confirmDialog.packageName) {
      await uninstallMutation.mutateAsync([confirmDialog.packageName]);
    }
    setConfirmDialog({ open: false, type: 'uninstall' });
  };

  const handleUpdate = async (name: string) => {
    await updateMutation.mutateAsync([name]);
  };

  const toggleMode = async () => {
    const newIsGlobal = !isGlobal;
    setIsGlobal(newIsGlobal);
    await fetch('/api/global/status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isGlobal: newIsGlobal }),
    });
  };

  const updatableCount = updateInfo.filter((u) => u.hasUpdate).length;
  const updatablePackages = updateInfo.filter((u) => u.hasUpdate).map((u) => u.name);

  const handleUpdateAll = async () => {
    if (updatablePackages.length === 0) return;
    setConfirmDialog({ open: true, type: 'updateAll' });
  };

  const confirmUpdateAll = async () => {
    await updateMutation.mutateAsync(updatablePackages);
    setConfirmDialog({ open: false, type: 'updateAll' });
  };

  const renderRow = (pkg: InstalledPackage) => {
    const updateStatus = updateMap.get(pkg.name);
    const isAnimating = animatingPackages.has(pkg.name);
    const isClicked = clickedRow === pkg.name;

    return (
      <div
        onClick={() => handleRowClick(pkg)}
        className={clsx(
          'flex items-center px-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 cursor-pointer select-none',
          // hover 效果
          'transition-all duration-150 ease-in-out',
          'hover:bg-gray-100/70 dark:hover:bg-gray-700/50',
          // 点击效果
          isClicked && 'bg-gray-200/80 dark:bg-gray-600/50 scale-[0.995]',
          // 新增动画
          isAnimating && 'animate-fade-in bg-green-50 dark:bg-green-900/20'
        )}
      >
        <div className="flex-1 min-w-0 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {pkg.name}
            </span>
            {updateStatus?.deprecated && (
              <span
                className="flex items-center gap-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded flex-shrink-0"
                title={updateStatus.deprecated}
              >
                <AlertTriangle size={10} />
                {t('packages.deprecated')}
              </span>
            )}
          </div>
        </div>
        <div className="w-32 py-3">
          <span className="text-gray-600 dark:text-gray-400">{pkg.version}</span>
          {updateStatus?.hasUpdate && (
            <span className="ml-2 text-xs text-primary-500 inline-flex items-center gap-1">
              <ArrowUp size={10} />
              {updateStatus.latestVersion}
            </span>
          )}
        </div>
        <div className="w-20 py-3">
          <Badge variant={pkg.isDev ? 'warning' : 'success'} size="sm">
            {pkg.isDev ? t('common.dev') : t('common.prod')}
          </Badge>
        </div>
        <div className="w-24 py-3 flex items-center justify-end gap-1">
          {updateStatus?.hasUpdate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleUpdate(pkg.name);
              }}
              loading={updateMutation.isPending}
              title={t('common.update')}
            >
              <ArrowUp size={16} className="text-primary-500" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleUninstall(pkg.name);
            }}
            disabled={uninstallMutation.isPending}
          >
            <Trash2 size={16} className="text-red-500" />
          </Button>
        </div>
      </div>
    );
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, sortedPackages.length);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {isGlobal ? t('packages.globalTitle') : t('packages.title')} ({filteredPackages.length})
          </h2>
          <button
            onClick={toggleMode}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              isGlobal
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            )}
            title={isGlobal ? t('packages.switchToProject') : t('packages.switchToGlobal')}
          >
            {isGlobal ? <Globe size={14} /> : <Folder size={14} />}
            {isGlobal ? t('packages.globalMode') : t('packages.projectMode')}
          </button>
          {updatableCount > 0 && (
            <button
              onClick={handleUpdateAll}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
              title={t('packages.updateAll')}
            >
              <ArrowUp size={12} />
              {updatableCount} {t('common.update')}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => setShowSearch(!showSearch)} leftIcon={<Plus size={18} />}>
            {t('packages.addPackage')}
          </Button>
        </div>
      </div>

      {/* Add Package Panel */}
      {showSearch && (
        <Card className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('packages.quickInstall')}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBatchInstall()}
                placeholder={t('packages.quickInstallPlaceholder')}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm"
              />
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={installAsDev}
                  onChange={(e) => setInstallAsDev(e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('common.dev')}</span>
              </label>
              <Button onClick={handleBatchInstall} disabled={!manualInput.trim()} loading={installMutation.isPending}>
                {t('common.install')}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">{t('packages.quickInstallHint')}</p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={npmSearchQuery}
                onChange={(e) => setNpmSearchQuery(e.target.value)}
                placeholder={t('packages.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((pkg) => (
                  <div key={pkg.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {pkg.name}
                        <span className="ml-2 text-sm text-gray-500">{pkg.version}</span>
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{pkg.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleInstall(pkg.name)} loading={installMutation.isPending}>
                        {t('common.install')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleInstall(pkg.name, true)} disabled={installMutation.isPending}>
                        {t('common.dev')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Package JSON Importer */}
      <PackageJsonImporter
        onInstall={handleImportInstall}
        isInstalling={installMutation.isPending}
      />

      {/* Filter & Pagination Controls */}
      {packages.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => handleFilterChange(e.target.value)}
              placeholder={t('packages.filterPlaceholder')}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              {t('packages.showing', { start: startItem, end: endItem, total: sortedPackages.length })}
            </span>
            <Select
              value={String(pageSize)}
              onChange={handlePageSizeChange}
              options={PAGE_SIZE_OPTIONS}
              size="sm"
              className="w-20"
            />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={18} />
              </Button>
              <span className="px-2">
                {page} / {totalPages || 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Package List */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
        ) : packages.length === 0 ? (
          <EmptyState icon={PackageIcon} title={t('packages.noPackages')} className="py-8" />
        ) : filteredPackages.length === 0 ? (
          <EmptyState icon={Search} title={t('packages.noMatch')} className="py-8" />
        ) : (
          <>
            {/* Table Header */}
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleSort('name')}
                className="flex-1 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-left"
              >
                {t('packages.name')}
                <SortIcon field="name" />
              </button>
              <button
                onClick={() => handleSort('version')}
                className="w-32 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {t('packages.version')}
                <SortIcon field="version" />
              </button>
              <button
                onClick={() => handleSort('type')}
                className="w-20 flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {t('packages.type')}
                <SortIcon field="type" />
              </button>
              <div className="w-24 text-right">{t('packages.actions')}</div>
            </div>

            {/* Virtual List */}
            <div
              ref={parentRef}
              className="overflow-auto"
              style={{ height: Math.min(paginatedPackages.length * ROW_HEIGHT, 400) }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const pkg = paginatedPackages[virtualRow.index];
                  return (
                    <div
                      key={pkg.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {renderRow(pkg)}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === 'uninstall'}
        title={t('packages.confirmUninstall', { name: confirmDialog.packageName })}
        variant="destructive"
        confirmText={t('common.uninstall')}
        cancelText={t('common.cancel')}
        onConfirm={confirmUninstall}
        onCancel={() => setConfirmDialog({ open: false, type: 'uninstall' })}
      />

      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === 'updateAll'}
        title={t('packages.confirmUpdateAll', { count: updatablePackages.length })}
        confirmText={t('common.update')}
        cancelText={t('common.cancel')}
        onConfirm={confirmUpdateAll}
        onCancel={() => setConfirmDialog({ open: false, type: 'updateAll' })}
      />

      <PackageDetailModal
        packageName={selectedPackage?.name || null}
        currentVersion={selectedPackage?.version}
        isDev={selectedPackage?.isDev}
        onClose={() => setSelectedPackage(null)}
      />
    </div>
  );
}
