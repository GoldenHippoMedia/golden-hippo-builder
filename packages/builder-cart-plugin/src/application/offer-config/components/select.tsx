import React, { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Fill the container instead of sizing to the selected label. */
  fullWidth?: boolean;
  /** Extra classes for the trigger button (e.g. size overrides). */
  className?: string;
  title?: string;
  ariaLabel?: string;
  placeholder?: string;
}

/**
 * A themed dropdown with a JS-rendered popup — a drop-in for native <select> whose option list
 * renders identically on every OS (native popups are drawn by the OS and can't be fully styled).
 */
const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  fullWidth = false,
  className = '',
  title,
  ariaLabel,
  placeholder = 'Select…',
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close when clicking anywhere outside the control.
  useEffect(() => {
    if (!open) return undefined;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  // Highlight the current selection each time the list opens.
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIndex(idx < 0 ? 0 : idx);
  }, [open, options, value]);

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setOpen(false);
  };

  const moveActive = (delta: number) => {
    const n = options.length;
    if (!n) return;
    setActiveIndex((current) => {
      let next = current;
      for (let step = 0; step < n; step++) {
        next = (next + delta + n) % n;
        if (!options[next]?.disabled) break;
      }
      listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
      return next;
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveActive(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = options[activeIndex];
      if (option) choose(option);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : 'inline-block'}`}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={title}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={`hippo-input cursor-pointer pr-9! text-left disabled:cursor-not-allowed disabled:opacity-40 ${
          fullWidth ? 'w-full' : 'w-auto!'
        } ${className}`}
      >
        <span className={`block truncate ${selected ? '' : 'text-[var(--text-muted)]'}`}>
          {selected?.label ?? placeholder}
        </span>
      </button>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-transform ${
          open ? 'rotate-180' : ''
        }`}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute left-0 top-full z-30 mt-1 max-h-60 w-max min-w-full overflow-y-auto rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)] shadow-lg"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(option);
              }}
              className={`flex w-full cursor-pointer items-center whitespace-nowrap px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                index === activeIndex ? 'bg-[var(--bg-glass-hover)]' : ''
              } ${option.value === value ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
