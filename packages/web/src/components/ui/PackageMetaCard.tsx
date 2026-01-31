import { Package, ExternalLink, User, Scale, Globe, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from './Card';
import { Badge } from './Badge';
import type { NpmPackageMeta } from '@dext7r/npvm-shared';

export interface PackageMetaCardProps {
  meta: NpmPackageMeta;
  className?: string;
  compact?: boolean;
  showKeywords?: boolean;
  maxKeywords?: number;
}

export function PackageMetaCard({
  meta,
  className,
  compact = false,
  showKeywords = true,
  maxKeywords = 10,
}: PackageMetaCardProps) {

  return (
    <Card className={clsx('animate-fade-in', className)}>
      {/* 标题行 */}
      <div className="flex items-center gap-2 mb-3">
        <Package size={18} className="text-primary-500 flex-shrink-0" />
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
          {meta.name}
        </h3>
        <Badge variant="outline" size="sm" className="flex-shrink-0">
          v{meta.version}
        </Badge>
      </div>

      {/* 描述 */}
      {meta.description && (
        <p className={clsx(
          'text-gray-600 dark:text-gray-400 mb-3',
          compact ? 'text-xs line-clamp-2' : 'text-sm'
        )}>
          {meta.description}
        </p>
      )}

      {/* 元信息 */}
      <div className={clsx(
        'flex flex-wrap gap-x-4 gap-y-2 text-gray-500',
        compact ? 'text-xs' : 'text-xs'
      )}>
        {meta.author && (
          <span className="inline-flex items-center gap-1">
            <User size={12} className="flex-shrink-0" />
            <span className="truncate max-w-[120px]" title={meta.author}>
              {meta.author}
            </span>
          </span>
        )}
        {meta.license && (
          <span className="inline-flex items-center gap-1">
            <Scale size={12} className="flex-shrink-0" />
            {meta.license}
          </span>
        )}
        {meta.homepage && (
          <a
            href={meta.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 hover:underline transition-colors"
          >
            <Globe size={12} className="flex-shrink-0" />
            Homepage
            <ExternalLink size={10} />
          </a>
        )}
        {meta.repository && (
          <a
            href={meta.repository.replace(/^git\+/, '').replace(/\.git$/, '')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 hover:underline transition-colors"
          >
            Repository
            <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* 关键词 */}
      {showKeywords && meta.keywords && meta.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Tag size={12} className="text-gray-400 mt-0.5" />
          {meta.keywords.slice(0, maxKeywords).map((kw) => (
            <Badge key={kw} variant="outline" size="sm">
              {kw}
            </Badge>
          ))}
          {meta.keywords.length > maxKeywords && (
            <span className="text-xs text-gray-400">
              +{meta.keywords.length - maxKeywords}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
