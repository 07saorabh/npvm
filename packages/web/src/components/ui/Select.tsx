import { forwardRef, useState, useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onChange, options, placeholder = 'Select...', disabled, className, size = 'md' }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    useImperativeHandle(ref, () => buttonRef.current!, []);

    const selectedOption = options.find((opt) => opt.value === value);

    const updatePosition = useCallback(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }, []);

    useEffect(() => {
      if (isOpen) {
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
          window.removeEventListener('scroll', updatePosition, true);
          window.removeEventListener('resize', updatePosition);
        };
      }
    }, [isOpen, updatePosition]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (
          containerRef.current && !containerRef.current.contains(target) &&
          (!listRef.current || !listRef.current.contains(target))
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const opt = options[highlightedIndex];
            if (!opt.disabled) {
              onChange(opt.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => {
              const next = prev + 1;
              return next >= options.length ? 0 : next;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => {
              const next = prev - 1;
              return next < 0 ? options.length - 1 : next;
            });
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    };

    const sizeClasses = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
    };

    return (
      <div ref={containerRef} className="relative inline-block">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={clsx(
            'flex items-center justify-between gap-2 rounded-lg border transition-colors min-w-[120px]',
            'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700',
            'text-gray-700 dark:text-gray-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'hover:bg-gray-50 dark:hover:bg-gray-600',
            sizeClasses[size],
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            className={clsx('transition-transform flex-shrink-0', isOpen && 'rotate-180')}
          />
        </button>

        {isOpen &&
          createPortal(
            <ul
              ref={listRef}
              role="listbox"
              className="fixed z-50 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto animate-in"
              style={{
                top: position.top,
                left: position.left,
                minWidth: position.width,
              }}
            >
              {options.map((option, index) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value);
                      setIsOpen(false);
                    }
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={clsx(
                    'flex items-center justify-between gap-2 px-3 py-2 cursor-pointer',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    highlightedIndex === index && !option.disabled && 'bg-gray-100 dark:bg-gray-700',
                    option.value === value && 'text-primary-600 dark:text-primary-400'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {option.value === value && <Check size={16} />}
                </li>
              ))}
            </ul>,
            document.body
          )}
      </div>
    );
  }
);

Select.displayName = 'Select';
