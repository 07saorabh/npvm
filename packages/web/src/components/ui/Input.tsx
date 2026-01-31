import { forwardRef } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, clearable, id, onChange, value, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasValue = value !== undefined && value !== '';
    const showClearButton = clearable && hasValue && !props.disabled;

    const handleClear = () => {
      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            value={value}
            onChange={onChange}
            className={clsx(
              'w-full rounded-lg border bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              // 尺寸与图标间距
              leftIcon ? 'pl-10' : 'pl-4',
              rightIcon || showClearButton ? 'pr-10' : 'pr-4',
              'py-2',
              // 状态
              error
                ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/20',
              props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className={clsx(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-0.5 rounded-full',
                'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'active:scale-90',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20'
              )}
              aria-label="清空输入"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {rightIcon && !showClearButton && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
