import React from 'react';
import { observer } from 'mobx-react';
import { Section, FormField } from '@goldenhippo/builder-ui';
import { SectionProps } from './section-props';

const SupportSection: React.FC<SectionProps> = observer(({ data, onChange, markDirty }) => {
  const support = data.support || {};
  const address = support.address || {};

  const onAddressChange = (key: string, value: string) => {
    if (!data.support) data.support = {};
    if (!data.support.address) data.support.address = {};
    data.support.address[key] = value;
    markDirty();
  };

  return (
    <Section title="Support Information" subtitle="Contact information displayed to customers on the website">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Support Email" helper="Email address for customer support inquiries" required>
            <input
              type="text"
              className="hippo-input"
              value={support.email ?? ''}
              onChange={(e) => onChange('support', 'email', e.target.value)}
            />
          </FormField>

          <FormField label="Support Phone Number" helper="Phone number for customer support inquiries" required>
            <input
              type="text"
              className="hippo-input"
              value={support.phone ?? ''}
              onChange={(e) => onChange('support', 'phone', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Support Phone Display" helper="Formatted phone number for display" required>
          <input
            type="text"
            className="hippo-input"
            value={support.phoneDisplay ?? ''}
            onChange={(e) => onChange('support', 'phoneDisplay', e.target.value)}
          />
        </FormField>

        <div className="flex items-center gap-3 my-7">
          <div className="flex-1 h-px bg-[var(--border-glass)]" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">Address</span>
          <div className="flex-1 h-px bg-[var(--border-glass)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Street" required>
            <input
              type="text"
              className="hippo-input"
              value={address.street ?? ''}
              onChange={(e) => onAddressChange('street', e.target.value)}
            />
          </FormField>
          <FormField label="City" required>
            <input
              type="text"
              className="hippo-input"
              value={address.city ?? ''}
              onChange={(e) => onAddressChange('city', e.target.value)}
            />
          </FormField>
          <FormField label="State Code" helper="e.g. CA" required>
            <input
              type="text"
              className="hippo-input"
              value={address.state ?? ''}
              onChange={(e) => onAddressChange('state', e.target.value)}
            />
          </FormField>
          <FormField label="Zip Code" required>
            <input
              type="text"
              className="hippo-input"
              value={address.zipcode ?? ''}
              onChange={(e) => onAddressChange('zipcode', e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Full Address String" helper="The full support address as a single formatted string">
          <input
            type="text"
            className="hippo-input"
            value={support.addressString ?? ''}
            onChange={(e) => onChange('support', 'addressString', e.target.value)}
          />
        </FormField>
      </div>
    </Section>
  );
});

export default SupportSection;
