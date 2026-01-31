import { clsx } from 'clsx';

export type SpinnerVariant = 'spinner' | 'dots' | 'pulse' | 'bars';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: SpinnerVariant;
  text?: string;
  className?: string;
}

const sizeMap = {
  sm: { spinner: 'w-4 h-4', dot: 'w-1.5 h-1.5', bar: 'w-1 h-3', pulse: 'w-4 h-4', text: 'text-xs' },
  md: { spinner: 'w-6 h-6', dot: 'w-2 h-2', bar: 'w-1.5 h-5', pulse: 'w-6 h-6', text: 'text-sm' },
  lg: { spinner: 'w-8 h-8', dot: 'w-2.5 h-2.5', bar: 'w-2 h-6', pulse: 'w-8 h-8', text: 'text-base' },
};

function SpinnerVariantComponent({ size = 'md', className }: { size: SpinnerProps['size']; className?: string }) {
  return (
    <div
      className={clsx(
        'rounded-full border-2 border-current border-t-transparent',
        'animate-[spin_0.8s_linear_infinite]',
        sizeMap[size!].spinner,
        className
      )}
    />
  );
}

function DotsVariant({ size = 'md', className }: { size: SpinnerProps['size']; className?: string }) {
  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={clsx(
            'rounded-full bg-current',
            'animate-[bounce_1s_ease-in-out_infinite]',
            sizeMap[size!].dot
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function PulseVariant({ size = 'md', className }: { size: SpinnerProps['size']; className?: string }) {
  return (
    <div className={clsx('relative', sizeMap[size!].pulse, className)}>
      <div
        className={clsx(
          'absolute inset-0 rounded-full bg-current opacity-75',
          'animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]'
        )}
      />
      <div className={clsx('relative rounded-full bg-current', sizeMap[size!].pulse)} />
    </div>
  );
}

function BarsVariant({ size = 'md', className }: { size: SpinnerProps['size']; className?: string }) {
  return (
    <div className={clsx('flex items-end gap-0.5', className)}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={clsx(
            'rounded-sm bg-current',
            'animate-[barPulse_1s_ease-in-out_infinite]',
            sizeMap[size!].bar
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function Spinner({ size = 'md', variant = 'spinner', text, className }: SpinnerProps) {
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant size={size} className={className} />;
      case 'pulse':
        return <PulseVariant size={size} className={className} />;
      case 'bars':
        return <BarsVariant size={size} className={className} />;
      default:
        return <SpinnerVariantComponent size={size} className={className} />;
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2" role="status" aria-label="Loading">
      {renderVariant()}
      {text && (
        <span className={clsx('text-gray-600 dark:text-gray-400', sizeMap[size].text)}>
          {text}
        </span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  variant?: SpinnerVariant;
}

export function LoadingOverlay({ visible, message, variant = 'spinner' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
      <Spinner size="lg" variant={variant} className="text-primary-500" />
      {message && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}
