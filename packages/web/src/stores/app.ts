import type { PackageManagerType, OperationProgress, AuditReport } from '@dext7r/npvm-shared';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  currentPm: PackageManagerType;
  projectPath: string;
  currentRegistry: string;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  isGlobal: boolean;
  currentOperation: OperationProgress | null;
  terminalLogs: string[];
  sidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  lastAuditReport: AuditReport | null;

  setCurrentPm: (pm: PackageManagerType) => void;
  setProjectPath: (path: string) => void;
  setCurrentRegistry: (url: string) => void;
  toggleDarkMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setIsGlobal: (isGlobal: boolean) => void;
  setCurrentOperation: (op: OperationProgress | null) => void;
  addTerminalLog: (log: string) => void;
  clearTerminalLogs: () => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setLastAuditReport: (report: AuditReport | null) => void;
}

function applyTheme(mode: ThemeMode): boolean {
  if (mode === 'system') {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
    return prefersDark;
  }
  const isDark = mode === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  return isDark;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentPm: 'npm',
      projectPath: '.',
      currentRegistry: 'https://registry.npmjs.org/',
      isDarkMode: typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches,
      themeMode: 'system',
      isGlobal: true,
      currentOperation: null,
      terminalLogs: [],
      sidebarCollapsed: false,
      isMobileMenuOpen: false,
      lastAuditReport: null,

      setCurrentPm: (pm) => set({ currentPm: pm }),
      setProjectPath: (path) => set({ projectPath: path, isGlobal: false }),
      setCurrentRegistry: (url) => set({ currentRegistry: url }),
      toggleDarkMode: () =>
        set((state) => {
          const newMode = !state.isDarkMode;
          document.documentElement.classList.toggle('dark', newMode);
          return { isDarkMode: newMode, themeMode: newMode ? 'dark' : 'light' };
        }),
      setThemeMode: (mode) =>
        set(() => {
          const isDark = applyTheme(mode);
          return { themeMode: mode, isDarkMode: isDark };
        }),
      setIsGlobal: (isGlobal) => set({ isGlobal }),
      setCurrentOperation: (op) => set({ currentOperation: op }),
      addTerminalLog: (log) =>
        set((state) => ({ terminalLogs: [...state.terminalLogs, log] })),
      clearTerminalLogs: () => set({ terminalLogs: [] }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setLastAuditReport: (report) => set({ lastAuditReport: report }),
    }),
    {
      name: 'npvm-app-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentPm: state.currentPm,
        isDarkMode: state.isDarkMode,
        themeMode: state.themeMode,
        isGlobal: state.isGlobal,
        sidebarCollapsed: state.sidebarCollapsed,
        currentRegistry: state.currentRegistry,
      }),
    }
  )
);
