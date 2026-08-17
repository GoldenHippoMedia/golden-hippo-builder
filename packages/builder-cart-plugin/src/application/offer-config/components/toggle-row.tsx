import React from 'react';

interface ToggleRowProps {
  label: string;
  helper?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, helper, checked, onChange, disabled }) => (
  <div className="flex items-start gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </button>
    <div>
      <div className="text-sm text-[var(--text-primary)]">{label}</div>
      {helper && <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{helper}</div>}
    </div>
  </div>
);

export default ToggleRow;
