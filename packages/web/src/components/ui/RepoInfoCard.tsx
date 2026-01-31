import { GitBranch, ExternalLink, User } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from './Card';
import { Badge } from './Badge';
import type { RemoteRepoInfo } from '@dext7r/npvm-shared';

export interface RepoInfoCardProps {
  repoInfo: RemoteRepoInfo;
  className?: string;
  compact?: boolean;
  showLink?: boolean;
}

// GitLab 图标组件
function GitLabIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
    </svg>
  );
}

// GitHub 图标组件
function GithubIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// 通用 Git 图标组件
function FolderGitIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      <circle cx="12" cy="13" r="2" />
      <path d="M14 13h3" />
      <path d="M7 13h3" />
    </svg>
  );
}

function getRepoUrl(repoInfo: RemoteRepoInfo): string {
  const base = repoInfo.platform === 'github'
    ? 'https://github.com'
    : 'https://gitlab.com';
  return `${base}/${repoInfo.owner}/${repoInfo.repo}`;
}

export function RepoInfoCard({
  repoInfo,
  className,
  compact = false,
  showLink = true,
}: RepoInfoCardProps) {
  const repoUrl = getRepoUrl(repoInfo);

  // 根据平台渲染对应图标
  const renderPlatformIcon = () => {
    switch (repoInfo.platform) {
      case 'github':
        return <GithubIcon size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />;
      case 'gitlab':
        return <GitLabIcon size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />;
      default:
        return <FolderGitIcon size={20} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />;
    }
  };

  return (
    <Card className={clsx('animate-fade-in', className)}>
      {/* 标题行 */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {renderPlatformIcon()}
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
            {repoInfo.owner}/{repoInfo.repo}
          </h3>
        </div>
        <Badge
          variant={repoInfo.platform === 'github' ? 'default' : 'info'}
          size="sm"
          className="flex-shrink-0 capitalize"
        >
          {repoInfo.platform}
        </Badge>
      </div>

      {/* 详细信息 */}
      <div className={clsx(
        'flex flex-wrap gap-x-4 gap-y-2 text-gray-500',
        compact ? 'text-xs' : 'text-sm'
      )}>
        <span className="inline-flex items-center gap-1.5">
          <User size={14} className="flex-shrink-0" />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {repoInfo.owner}
          </span>
        </span>

        {repoInfo.branch && (
          <span className="inline-flex items-center gap-1.5">
            <GitBranch size={14} className="flex-shrink-0" />
            <Badge variant="outline" size="sm">
              {repoInfo.branch}
            </Badge>
          </span>
        )}

        {showLink && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 hover:underline transition-colors ml-auto"
          >
            View on {repoInfo.platform === 'github' ? 'GitHub' : 'GitLab'}
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </Card>
  );
}
