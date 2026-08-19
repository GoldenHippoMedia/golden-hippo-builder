import React from 'react';
import { observer } from 'mobx-react';
import { FormField, Section } from '@goldenhippo/builder-ui';
import { PreviousPurchaseLookback } from '@goldenhippo/builder-cart-schemas';
import ToggleRow from './toggle-row';
import Select from './select';

interface FlowAudienceProps {
  data: Record<string, any>;
  set: (key: string, value: unknown) => void;
  disabled: boolean;
}

const LOOKBACK_OPTIONS = Object.values(PreviousPurchaseLookback).map((value) => ({ value, label: value }));

const FlowAudience: React.FC<FlowAudienceProps> = observer(({ data, set, disabled }) => (
  <Section title="Audience filters" subtitle="Drop offers that don’t fit the customer">
    <div className="flex flex-col gap-4">
      <ToggleRow
        label="Exclude subscribed products"
        helper="Skip offers whose product the customer already subscribes to."
        checked={!!data.excludeSubscribedProducts}
        onChange={(v) => set('excludeSubscribedProducts', v)}
        disabled={disabled}
      />
      <ToggleRow
        label="Exclude previously purchased"
        helper="Skip offers whose product the customer bought within the lookback window."
        checked={!!data.excludePreviouslyPurchased}
        onChange={(v) => set('excludePreviouslyPurchased', v)}
        disabled={disabled}
      />
      {data.excludePreviouslyPurchased && (
        <div className="ml-12 max-w-xs">
          <FormField label="Lookback window">
            <Select
              fullWidth
              options={LOOKBACK_OPTIONS}
              value={data.previousPurchaseLookback ?? PreviousPurchaseLookback.ThreeMonths}
              disabled={disabled}
              onChange={(value) => set('previousPurchaseLookback', value)}
            />
          </FormField>
        </div>
      )}
    </div>
  </Section>
));

FlowAudience.displayName = 'FlowAudience';

export default FlowAudience;
