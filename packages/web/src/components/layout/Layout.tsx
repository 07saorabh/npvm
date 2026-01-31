import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { Terminal } from '../terminal/Terminal';
import { useAppStore } from '../../stores/app';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

export function Layout() {
  const { sidebarCollapsed } = useAppStore();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.classList.remove('page-enter');
      void mainRef.current.offsetWidth;
      mainRef.current.classList.add('page-enter');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div
        className={clsx(
          'transition-all duration-300 flex flex-col min-h-screen',
          'ml-0 md:ml-16',
          !sidebarCollapsed && 'md:ml-56'
        )}
      >
        <Header />
        <main ref={mainRef} className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
        <div className="px-4 sm:px-6">
          <Footer />
        </div>
        <Terminal />
      </div>
    </div>
  );
}
