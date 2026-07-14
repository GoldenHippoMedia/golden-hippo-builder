import React, { useMemo, useRef, useState } from 'react';

export interface ChipOption {
  id: string;
  label: string;
  color?: string;
  /** Optional badge image (used by some product cards instead of a text pill). */
  image?: string;
}

interface ChipMultiSelectProps {
  label: string;
  helperText?: string;
  options: ChipOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  /** Optional control rendered right-aligned in the label row (e.g. a per-field locale selector). */
  labelAccessory?: React.ReactNode;
}

const ChipMultiSelect: React.FC<ChipMultiSelectProps> = ({
  label,
  helperText,
  options,
  selectedIds,
  onChange,
  placeholder = 'Search to add...',
  labelAccessory,
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const optionsById = useMemo(() => {
    const map = new Map<string, ChipOption>();
    options.forEach((o) => map.set(o.id, o));
    return map;
  }, [options]);

  const selectedChips = useMemo(
    () => selectedIds.map((id) => optionsById.get(id)).filter((o): o is ChipOption => Boolean(o)),
    [selectedIds, optionsById],
  );

  const availableMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedSet = new Set(selectedIds);
    return options
      .filter((o) => !selectedSet.has(o.id))
      .filter((o) => !q || o.label.toLowerCase().includes(q))
      .slice(0, 50);
  }, [options, selectedIds, query]);

  const add = (id: string) => {
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setQuery('');
  };

  const remove = (id: string) => {
    onChange(selectedIds.filter((s) => s !== id));
  };

  return (
    <div ref={containerRef} className="space-y-2">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide">{label}</div>
          {labelAccessory}
        </div>
        {helperText && <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{helperText}</div>}
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {selectedChips.length === 0 && (
          <span className="text-[11px] text-[var(--text-muted)] italic py-1">None selected</span>
        )}
        {selectedChips.map((chip) => (
          <span
            key={chip.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border"
            style={
              chip.color
                ? {
                    background: `${chip.color}22`,
                    color: chip.color,
                    borderColor: `${chip.color}55`,
                  }
                : {
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent)',
                    borderColor: 'rgba(200,169,81,0.3)',
                  }
            }
          >
            {chip.label}
            <button
              type="button"
              onClick={() => remove(chip.id)}
              className="ml-0.5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
              aria-label={`Remove ${chip.label}`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50"
        />
        {open && availableMatches.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-10 max-h-60 overflow-y-auto rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)] shadow-lg">
            {availableMatches.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(opt.id);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-[var(--bg-glass-hover)] cursor-pointer flex items-center gap-2"
              >
                {opt.color && (
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-[var(--border-glass)] flex-shrink-0"
                    style={{ background: opt.color }}
                  />
                )}
                <span className="text-[var(--text-primary)]">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
        {open && availableMatches.length === 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-10 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-primary)] shadow-lg px-3 py-2 text-[11px] text-[var(--text-muted)]">
            {query ? 'No matches' : 'All available options are already selected'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChipMultiSelect;
