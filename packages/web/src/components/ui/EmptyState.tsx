import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

export type EmptyStateVariant = 'default' | 'info' | 'warning' | 'error' | 'success';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: EmptyStateVariant;
}

const variantStyles: Record<EmptyStateVariant, { bg: string; icon: string }> = {
  default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'text-gray-400',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'text-blue-500 dark:text-blue-400',
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'text-amber-500 dark:text-amber-400',
  },
  error: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'text-red-500 dark:text-red-400',
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'text-green-500 dark:text-green-400',
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        'animate-fade-in-up',
        className
      )}
    >
      {Icon && (
        <div
          className={clsx(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4',
            styles.bg
          )}
        >
          <Icon size={32} className={clsx(styles.icon, 'animate-float')} />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
