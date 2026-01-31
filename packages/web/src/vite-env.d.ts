/// <reference types="vite/client" />

interface BuildInfo {
  commitHash: string;
  commitShort: string;
  commitTime: string;
  branch: string;
  buildTime: string;
}

declare const __BUILD_INFO__: BuildInfo;
