import type { PackageManagerType, OperationProgress, AuditReport } from '@dext7r/npvm-shared';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface AuditHistoryItem {
  id: string;
  report: AuditReport;
  projectPath: string;
  timestamp: number;
}

interface AppState {
  currentPm: PackageManagerType;
  projectPath: string;
  projectPathHistory: string[];
  currentRegistry: string;
  isDarkMode: boolean;
  themeMode: ThemeMode;
  isGlobal: boolean;
  currentOperation: OperationProgress | null;
  terminalLogs: string[];
  sidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  lastAuditReport: AuditReport | null;
  auditHistory: AuditHistoryItem[];

  setCurrentPm: (pm: PackageManagerType) => void;
  setProjectPath: (path: string) => void;
  addProjectPathToHistory: (path: string) => void;
  removeProjectPathFromHistory: (path: string) => void;
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
  addAuditHistory: (report: AuditReport) => void;
  removeAuditHistory: (id: string) => void;
  clearAuditHistory: () => void;
  loadAuditFromHistory: (id: string) => void;
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
    (set, get) => ({
      currentPm: 'npm',
      projectPath: '.',
      projectPathHistory: [],
      currentRegistry: 'https://registry.npmjs.org/',
      isDarkMode: typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches,
      themeMode: 'system',
      isGlobal: true,
      currentOperation: null,
      terminalLogs: [],
      sidebarCollapsed: false,
      isMobileMenuOpen: false,
      lastAuditReport: null,
      auditHistory: [],

      setCurrentPm: (pm) => set({ currentPm: pm }),
      setProjectPath: (path) => {
        const { addProjectPathToHistory } = get();
        addProjectPathToHistory(path);
        set({ projectPath: path, isGlobal: false });
      },
      addProjectPathToHistory: (path) => {
        if (!path || path === '.') return;
        set((state) => {
          const filtered = state.projectPathHistory.filter((p) => p !== path);
          return { projectPathHistory: [path, ...filtered].slice(0, 10) };
        });
      },
      removeProjectPathFromHistory: (path) =>
        set((state) => ({
          projectPathHistory: state.projectPathHistory.filter((p) => p !== path),
        })),
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
      addAuditHistory: (report) =>
        set((state) => {
          const item: AuditHistoryItem = {
            id: `audit-${Date.now()}`,
            report,
            projectPath: report.metadata.projectPath,
            timestamp: report.metadata.scannedAt,
          };
          return { auditHistory: [item, ...state.auditHistory].slice(0, 20) };
        }),
      removeAuditHistory: (id) =>
        set((state) => ({
          auditHistory: state.auditHistory.filter((h) => h.id !== id),
        })),
      clearAuditHistory: () => set({ auditHistory: [] }),
      loadAuditFromHistory: (id) => {
        const { auditHistory } = get();
        const item = auditHistory.find((h) => h.id === id);
        if (item) {
          set({ lastAuditReport: item.report });
        }
      },
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
        projectPath: state.projectPath,
        projectPathHistory: state.projectPathHistory,
        auditHistory: state.auditHistory,
      }),
    }
  )
);
