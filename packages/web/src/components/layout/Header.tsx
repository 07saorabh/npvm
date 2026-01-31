import { Moon, Sun, FolderOpen, Languages, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/app';
import { usePackageManagers } from '../../hooks/usePackages';
import { Select } from '../ui/Select';
import { Tooltip } from '../ui/Tooltip';
import type { PackageManagerType } from '@dext7r/npvm-shared';
import { useMemo } from 'react';

export function Header() {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleDarkMode, currentPm, setCurrentPm, projectPath, setMobileMenuOpen } = useAppStore();
  const { data: managers = [] } = usePackageManagers();

  const availableManagers = managers.filter((m) => m.available);

  const pmOptions = useMemo(
    () =>
      availableManagers.map((m) => ({
        value: m.type,
        label: `${m.type} (v${m.version})`,
      })),
    [availableManagers]
  );

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
        <div className="hidden sm:flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <FolderOpen size={18} />
          <span className="text-sm font-mono truncate max-w-xs">{projectPath}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Select
          value={currentPm}
          onChange={(v) => setCurrentPm(v as PackageManagerType)}
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
