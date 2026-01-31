import { Moon, Sun, FolderOpen, Languages, Menu, ChevronDown, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../stores/app';
import { usePackageManagers } from '../../hooks/usePackages';
import { fetchApi } from '../../lib/api';
import { Select } from '../ui/Select';
import { Tooltip } from '../ui/Tooltip';
import { useToast } from '../ui/Toast';
import type { PackageManagerType } from '@dext7r/npvm-shared';
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

function truncatePath(path: string, maxLen = 30): string {
  if (path.length <= maxLen) return path;
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 2) return '...' + path.slice(-maxLen + 3);
  return '.../' + parts.slice(-2).join('/');
}

export function Header() {
  const { t, i18n } = useTranslation();
  const {
    isDarkMode,
    toggleDarkMode,
    currentPm,
    setCurrentPm,
    projectPath,
    setProjectPath,
    projectPathHistory,
    removeProjectPathFromHistory,
    isGlobal,
    setIsGlobal,
    setMobileMenuOpen,
  } = useAppStore();
  const { data: managers = [] } = usePackageManagers();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [showPathDropdown, setShowPathDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableManagers = managers.filter((m) => m.available);

  const pmOptions = useMemo(
    () =>
      availableManagers.map((m) => ({
        value: m.type,
        label: `${m.type} (v${m.version})`,
      })),
    [availableManagers]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPathDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchPm = useCallback(async (type: PackageManagerType) => {
    if (type === currentPm) return;

    const prevPm = currentPm;
    setCurrentPm(type);

    try {
      await fetchApi('/pm/current', {
        method: 'PUT',
        body: JSON.stringify({ type }),
      });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      addToast({
        type: 'success',
        title: t('dashboard.pmSwitched'),
        message: t('dashboard.pmSwitchedTo', { pm: type }),
      });
    } catch {
      setCurrentPm(prevPm);
      addToast({
        type: 'error',
        title: t('dashboard.pmSwitchFailed'),
        message: t('dashboard.pmSwitchFailedMsg'),
      });
    }
  }, [currentPm, setCurrentPm, queryClient, addToast, t]);

  const handleSelectPath = (path: string) => {
    setProjectPath(path);
    setShowPathDropdown(false);
    queryClient.invalidateQueries({ queryKey: ['packages'] });
  };

  const handleSwitchToGlobal = () => {
    setIsGlobal(true);
    setShowPathDropdown(false);
    queryClient.invalidateQueries({ queryKey: ['packages'] });
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* 项目路径下拉选择 */}
        <div className="hidden sm:block relative" ref={dropdownRef}>
          <button
            onClick={() => setShowPathDropdown(!showPathDropdown)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
              'text-sm font-mono max-w-[280px]',
              isGlobal
                ? 'border-primary-300 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200',
              'hover:bg-gray-50 dark:hover:bg-gray-600'
            )}
          >
            {isGlobal ? <Globe size={16} /> : <FolderOpen size={16} />}
            <span className="truncate">
              {isGlobal ? t('packages.globalMode') : truncatePath(projectPath)}
            </span>
            <ChevronDown size={14} className={clsx('transition-transform', showPathDropdown && 'rotate-180')} />
          </button>

          {showPathDropdown && (
            <div className="absolute left-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              {/* 全局模式选项 */}
              <button
                onClick={handleSwitchToGlobal}
                className={clsx(
                  'w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  isGlobal && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                )}
              >
                <Globe size={16} />
                <span className="font-medium">{t('packages.globalMode')}</span>
                {isGlobal && <span className="ml-auto text-xs text-primary-500">✓</span>}
              </button>

              {/* 分隔线 */}
              {projectPathHistory.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700" />
              )}

              {/* 历史路径 */}
              {projectPathHistory.length > 0 && (
                <div className="max-h-60 overflow-y-auto">
                  <div className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {t('settings.projectPath')}
                  </div>
                  {projectPathHistory.map((path) => (
                    <div
                      key={path}
                      className={clsx(
                        'group flex items-center gap-2 px-4 py-2 text-sm',
                        'hover:bg-gray-100 dark:hover:bg-gray-700',
                        !isGlobal && projectPath === path && 'bg-primary-50 dark:bg-primary-900/20'
                      )}
                    >
                      <button
                        onClick={() => handleSelectPath(path)}
                        className="flex-1 flex items-center gap-2 text-left min-w-0"
                      >
                        <FolderOpen size={14} className="flex-shrink-0 text-gray-400" />
                        <span
                          className="truncate font-mono text-gray-700 dark:text-gray-200"
                          title={path}
                        >
                          {truncatePath(path, 40)}
                        </span>
                        {!isGlobal && projectPath === path && (
                          <span className="ml-auto text-xs text-primary-500">✓</span>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProjectPathFromHistory(path);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {projectPathHistory.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.projectPathHint')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Select
          value={currentPm}
          onChange={(v) => handleSwitchPm(v as PackageManagerType)}
          options={pmOptions}
          size="sm"
        />

        <Tooltip content={t('settings.language')} position="bottom">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            <Languages size={16} />
            <span className="hidden sm:inline">{i18n.language === 'zh' ? '中文' : 'EN'}</span>
          </button>
        </Tooltip>

        <Tooltip content={isDarkMode ? 'Light mode' : 'Dark mode'} position="bottom">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
