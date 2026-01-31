import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

const ANIMATION_DURATION = 200;

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 处理打开
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    }
  }, [open]);

  // 处理动画
  useEffect(() => {
    if (!shouldRender) return;

    if (open) {
      // 打开动画
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
      return () => cancelAnimationFrame(rafId);
    } else {
      // 关闭动画
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [open, shouldRender]);

  // 键盘和焦点处理
  useEffect(() => {
    if (open) {
      confirmButtonRef.current?.focus();
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel();
      };
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
      };
    }
  }, [open, onCancel]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Overlay */}
      <div
        className={clsx(
          'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
        onClick={onCancel}
      />

      {/* Dialog */}
      <div
        className={clsx(
          'relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transition-all',
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        style={{ transitionDuration: `${ANIMATION_DURATION}ms`, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {variant === 'destructive' && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div className="flex-1">
              <h3
                id="confirm-title"
                className="text-lg font-semibold text-gray-900 dark:text-gray-100"
              >
                {title}
              </h3>
              {description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              variant === 'destructive'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
