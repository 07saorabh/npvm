import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Packages } from './pages/Packages';
import { Dependencies } from './pages/Dependencies';
import { Security } from './pages/Security';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { RemoteAnalysis } from './pages/RemoteAnalysis';
import { Docs } from './pages/Docs';
import { Changelog } from './pages/Changelog';
import { useEffect } from 'react';
import { useAppStore } from './stores/app';
import { ToastProvider } from './components/ui/Toast';
import { useSEO } from './hooks/useSEO';

function AppRoutes() {
  useSEO();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="packages" element={<Packages />} />
        <Route path="dependencies" element={<Dependencies />} />
        <Route path="security" element={<Security />} />
        <Route path="remote" element={<RemoteAnalysis />} />
        <Route path="guide" element={<Docs />} />
        <Route path="changelog" element={<Changelog />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  const { isDarkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}
