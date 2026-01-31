import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Package,
  ExternalLink,
  GitBranch,
  User,
  FileText,
  ChevronDown,
  ChevronRight,
  Calendar,
  Download,
  Tag,
  Bug,
  Cpu,
  Users,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Card, Badge, Spinner } from '../ui';
import type { PackageInfo } from '@dext7r/npvm-shared';
import { getApiBase } from '../../lib/api';

interface PackageDetailModalProps {
  packageName: string | null;
  currentVersion?: string;
  isDev?: boolean;
  onClose: () => void;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
}

function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {title} ({count})
        </span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {isOpen && (
        <div className="p-4 max-h-64 overflow-y-auto scrollbar-thin space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

export function PackageDetailModal({
  packageName,
  currentVersion,
  isDev,
  onClose,
}: PackageDetailModalProps) {
  const { t } = useTranslation();
  const [info, setInfo] = useState<PackageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!packageName) {
      setInfo(null);
      return;
    }

    const fetchInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${getApiBase()}/packages/${encodeURIComponent(packageName)}`);
        const data = await response.json();
        if (data.success && data.data) {
          setInfo(data.data);
        } else {
          setError(data.error || t('packageDetail.fetchError'));
        }
      } catch {
        setError(t('packageDetail.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [packageName, t]);

  // ESC 键退出全屏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  if (!packageName) return null;

  const depsCount = info?.dependencies ? Object.keys(info.dependencies).length : 0;
  const devDepsCount = info?.devDependencies ? Object.keys(info.devDependencies).length : 0;
  const peerDepsCount = info?.peerDependencies ? Object.keys(info.peerDependencies).length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4"
      onClick={onClose}
    >
      <Card
        className={clsx(
          'overflow-hidden flex flex-col animate-scale-in transition-all duration-300',
          isFullscreen
            ? 'w-full h-full max-w-none max-h-none rounded-none'
            : 'w-full max-w-3xl max-h-[90vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Package size={24} className="text-primary-500 flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                {packageName}
              </h2>
              {currentVersion && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-gray-500">v{currentVersion}</span>
                  {isDev !== undefined && (
                    <Badge variant={isDev ? 'warning' : 'success'} size="sm">
                      {isDev ? t('common.dev') : t('common.prod')}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isFullscreen ? t('packageDetail.exitFullscreen') : t('packageDetail.fullscreen')}
            >
              {isFullscreen ? (
                <Minimize2 size={18} className="text-gray-500" />
              ) : (
                <Maximize2 size={18} className="text-gray-500" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" text={t('common.loading')} />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {info && !loading && (
            <div className={clsx(
              'space-y-4',
              isFullscreen && 'max-w-5xl mx-auto'
            )}>
              {/* Description */}
              {info.description && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {info.description}
                </p>
              )}

              {/* Keywords */}
              {info.keywords && info.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {info.keywords.slice(0, isFullscreen ? 30 : 15).map((keyword) => (
                    <Badge key={keyword} variant="outline" size="sm">
                      <Tag size={10} className="mr-1" />
                      {keyword}
                    </Badge>
                  ))}
                  {info.keywords.length > (isFullscreen ? 30 : 15) && (
                    <Badge variant="outline" size="sm">
                      +{info.keywords.length - (isFullscreen ? 30 : 15)}
                    </Badge>
                  )}
                </div>
              )}

              {/* Meta Grid */}
              <div className={clsx(
                'grid gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg',
                isFullscreen ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3'
              )}>
                {info.version && (
                  <div className="flex items-center gap-2">
                    <Download size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">{t('packageDetail.latestVersion')}</div>
                      <div className="font-mono text-sm text-gray-800 dark:text-gray-200 truncate">
                        v{info.version}
                      </div>
                    </div>
                  </div>
                )}

                {info.license && (
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">{t('packageDetail.license')}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {info.license}
                      </div>
                    </div>
                  </div>
                )}

                {info.author && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">{t('packageDetail.author')}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
                        {info.author}
                      </div>
                    </div>
                  </div>
                )}

                {info.time?.created && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">{t('packageDetail.created')}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        {formatDate(info.time.created)}
                      </div>
                    </div>
                  </div>
                )}

                {info.time?.modified && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">{t('packageDetail.lastUpdated')}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        {formatDate(info.time.modified)}
                      </div>
                    </div>
                  </div>
                )}

                {info.maintainers && info.maintainers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500">{t('packageDetail.maintainers')}</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">
                        {t('packageDetail.maintainersCount', { count: info.maintainers.length })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Engines */}
              {info.engines && Object.keys(info.engines).length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Cpu size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{t('packageDetail.engines')}:</span>
                  {Object.entries(info.engines).map(([engine, version]) => (
                    <Badge key={engine} variant="info" size="sm">
                      {engine}: {version}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://www.npmjs.com/package/${packageName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Package size={14} />
                  npm
                </a>

                {info.homepage && (
                  <a
                    href={info.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <ExternalLink size={14} />
                    {t('packageDetail.homepage')}
                  </a>
                )}

                {info.repository && (
                  <a
                    href={info.repository.replace(/^git\+/, '').replace(/\.git$/, '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <GitBranch size={14} />
                    {t('packageDetail.repository')}
                  </a>
                )}

                {info.bugs && (
                  <a
                    href={info.bugs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Bug size={14} />
                    {t('packageDetail.issues')}
                  </a>
                )}

                <a
                  href={`https://bundlephobia.com/package/${packageName}@${info.version}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <Download size={14} />
                  {t('packageDetail.bundleSize')}
                </a>
              </div>

              {/* Maintainers */}
              {info.maintainers && info.maintainers.length > 0 && (
                <CollapsibleSection title={t('packageDetail.maintainers')} count={info.maintainers.length}>
                  {info.maintainers.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-gray-800 dark:text-gray-200">{m.name}</span>
                      {m.email && (
                        <span className="text-gray-500 text-xs">{m.email}</span>
                      )}
                    </div>
                  ))}
                </CollapsibleSection>
              )}

              {/* Dependencies */}
              <CollapsibleSection
                title={t('packageDetail.dependencies')}
                count={depsCount}
                defaultOpen={depsCount <= 10}
              >
                {info.dependencies && Object.entries(info.dependencies).map(([name, version]) => (
                  <div key={name} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{name}</span>
                    <span className="text-gray-500 font-mono text-xs">{version}</span>
                  </div>
                ))}
              </CollapsibleSection>

              {/* Dev Dependencies */}
              <CollapsibleSection title={t('packageDetail.devDependencies')} count={devDepsCount}>
                {info.devDependencies && Object.entries(info.devDependencies).map(([name, version]) => (
                  <div key={name} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{name}</span>
                    <span className="text-gray-500 font-mono text-xs">{version}</span>
                  </div>
                ))}
              </CollapsibleSection>

              {/* Peer Dependencies */}
              <CollapsibleSection title={t('packageDetail.peerDependencies')} count={peerDepsCount}>
                {info.peerDependencies && Object.entries(info.peerDependencies).map(([name, version]) => (
                  <div key={name} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{name}</span>
                    <span className="text-gray-500 font-mono text-xs">{version}</span>
                  </div>
                ))}
              </CollapsibleSection>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
