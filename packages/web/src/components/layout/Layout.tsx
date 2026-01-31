import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { Terminal } from '../terminal/Terminal';
import { useAppStore } from '../../stores/app';
import { clsx } from 'clsx';

export function Layout() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div
        className={clsx(
          'transition-all duration-300 flex flex-col min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-56'
        )}
      >
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <div className="px-6">
          <Footer />
        </div>
        <Terminal />
      </div>
    </div>
  );
}
