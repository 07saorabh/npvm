import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

// 获取构建时的 git 信息
function getBuildInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD').toString().trim();
    const commitShort = execSync('git rev-parse --short HEAD').toString().trim();
    const commitTime = execSync('git log -1 --format=%cI').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    return { commitHash, commitShort, commitTime, branch, buildTime: new Date().toISOString() };
  } catch {
    return { commitHash: 'unknown', commitShort: 'unknown', commitTime: '', branch: 'unknown', buildTime: new Date().toISOString() };
  }
}

const buildInfo = getBuildInfo();

export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3456',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
