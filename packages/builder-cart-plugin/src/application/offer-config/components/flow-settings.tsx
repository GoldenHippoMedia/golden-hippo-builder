import React from 'react';
import { observer } from 'mobx-react';

interface FlowSettingsBarProps {
  data: Record<string, any>;
  set: (key: string, value: unknown) => void;
  disabled: boolean;
}

const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; label: string }> = ({
  checked,
  onChange,
  disabled,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
    }`}
  >
    <span
      className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-4' : ''
      }`}
    />
  </button>
);

const numberInputClass =
  'w-16 rounded-lg border border-[var(--border-glass)] bg-[var(--input-bg)] px-2 py-1.5 text-center font-mono text-sm tabular-nums text-[var(--text-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-40';

const labelClass = 'text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]';

// The slim settings bar — its children lay out directly in the editor's flex row.
const FlowSettingsBar: React.FC<FlowSettingsBarProps> = observer(({ data, set, disabled }) => (
  <>
    <input
      type="text"
      className="min-w-[220px] border-0 border-b border-dashed border-transparent bg-transparent px-0.5 py-1 text-[19px] font-bold tracking-tight text-[var(--text-primary)] outline-none hover:border-[var(--border-strong)] focus:border-[var(--accent)] disabled:opacity-60"
      placeholder="Flow name"
      value={data.name ?? ''}
      disabled={disabled}
      onChange={(e) => set('name', e.target.value)}
    />
    <div className="flex items-center gap-2">
      <Switch label="Active" checked={data.active !== false} onChange={(v) => set('active', v)} disabled={disabled} />
      <span className="text-xs text-[var(--text-secondary)]">Active</span>
    </div>
    <div className="flex items-center gap-2">
      <Switch
        label="Default flow"
        checked={!!data.isDefault}
        onChange={(v) => set('isDefault', v)}
        disabled={disabled}
      />
      <span className="text-xs text-[var(--text-secondary)]">Default flow</span>
    </div>
    <div className="flex flex-col gap-1">
      <label className={labelClass}>Priority</label>
      <input
        type="number"
        className={numberInputClass}
        value={data.priority ?? 0}
        disabled={disabled}
        onChange={(e) => set('priority', e.target.value === '' ? 0 : Number(e.target.value))}
      />
    </div>
    <div className="flex flex-col gap-1">
      <label className={labelClass}>Step target</label>
      <input
        type="number"
        min={1}
        placeholder="All"
        className={numberInputClass}
        value={data.stepTarget ?? ''}
        disabled={disabled}
        onChange={(e) => set('stepTarget', e.target.value === '' ? undefined : Number(e.target.value))}
      />
    </div>
  </>
));

FlowSettingsBar.displayName = 'FlowSettingsBar';

export default FlowSettingsBar;
