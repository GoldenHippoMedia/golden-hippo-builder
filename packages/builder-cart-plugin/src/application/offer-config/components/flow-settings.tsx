import React from 'react';
import { observer } from 'mobx-react';
import { FormField, Section } from '@goldenhippo/builder-ui';
import ToggleRow from './toggle-row';

interface FlowSettingsProps {
  data: Record<string, any>;
  set: (key: string, value: unknown) => void;
  disabled: boolean;
}

const FlowSettings: React.FC<FlowSettingsProps> = observer(({ data, set, disabled }) => (
  <Section title="Settings">
    <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
      <FormField label="Name" required className="sm:col-span-2">
        <input
          type="text"
          className="hippo-input"
          value={data.name ?? ''}
          disabled={disabled}
          onChange={(e) => set('name', e.target.value)}
        />
      </FormField>
      <FormField label="Priority" helper="Higher wins among flows matching the same number of the order’s products.">
        <input
          type="number"
          className="hippo-input"
          value={data.priority ?? 0}
          disabled={disabled}
          onChange={(e) => set('priority', e.target.value === '' ? 0 : Number(e.target.value))}
        />
      </FormField>
      <FormField label="Step target" helper="How many surviving steps to present. Blank = show all.">
        <input
          type="number"
          min={1}
          className="hippo-input"
          value={data.stepTarget ?? ''}
          disabled={disabled}
          placeholder="All"
          onChange={(e) => set('stepTarget', e.target.value === '' ? undefined : Number(e.target.value))}
        />
      </FormField>
    </div>

    <div className="mt-5 flex flex-wrap gap-8">
      <ToggleRow
        label="Active"
        helper="Only active flows are ingested and shown."
        checked={data.active !== false}
        onChange={(v) => set('active', v)}
        disabled={disabled}
      />
      <ToggleRow
        label="Default flow"
        helper="The brand’s fallback when no conditional flow matches."
        checked={!!data.isDefault}
        onChange={(v) => set('isDefault', v)}
        disabled={disabled}
      />
    </div>
  </Section>
));

FlowSettings.displayName = 'FlowSettings';

export default FlowSettings;
