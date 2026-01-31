import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  GitBranch,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  BookOpen,
  History,
  X,
} from 'lucide-react';
import { useAppStore } from '../../stores/app';
import { clsx } from 'clsx';
import { useEffect, useState, useCallback } from 'react';

const MOBILE_BREAKPOINT = 768;

export function Sidebar() {
  const { t } = useTranslation();
  const { sidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useAppStore();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT
  );
  const location = useLocation();

  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(mobile);
    if (!mobile && isMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen, setMobileMenuOpen]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/packages', icon: Package, label: t('nav.packages') },
    { path: '/dependencies', icon: GitBranch, label: t('nav.dependencies') },
    { path: '/security', icon: Shield, label: t('nav.security') },
    { path: '/remote', icon: Globe, label: t('nav.remote') },
    { path: '/guide', icon: BookOpen, label: t('nav.docs') },
    { path: '/changelog', icon: History, label: t('nav.changelog') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const sidebarContent = (
    <nav className="p-2 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
              isActive
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )
          }
        >
          <item.icon size={20} />
          {(isMobile || !sidebarCollapsed) && (
            <span className="font-medium">{item.label}</span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  // 移动端：overlay 模式
  if (isMobile) {
    return (
      <>
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        <aside
          className={clsx(
            'fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50',
            'transition-transform duration-300',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
            <span className="font-bold text-lg text-primary-600">NPVM</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
            >
              <X size={18} />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </>
    );
  }

  // 桌面端：固定侧边栏
  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && (
          <span className="font-bold text-lg text-primary-600">NPVM</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      {sidebarContent}
    </aside>
  );
}
