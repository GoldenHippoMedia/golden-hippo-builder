import React from 'react';
import { observer } from 'mobx-react';
import { Section, FormField } from '@goldenhippo/builder-ui';
import { ProductGridFilterType, ProductLinkPrefix } from '@goldenhippo/builder-cart-schemas';
import { SectionProps } from './section-props';

const TOGGLE_FIELDS = [
  {
    key: 'productGridHideRestricted',
    label: 'Hide Restricted Products',
    helper: "Hide restricted products from the product grid based on the user's selected country",
  },
  {
    key: 'subscriptionAddOnsEnabled',
    label: 'Subscription Add-Ons',
    helper: 'Enable subscription add-ons for the brand',
  },
  {
    key: 'shippingThresholdNotificationEnabled',
    label: 'Shipping Threshold Notification',
    helper: 'Enable shipping threshold notifications',
  },
  { key: 'bundlingEnabled', label: 'Bundling Experience', helper: 'Enable the bundling experience' },
  { key: 'cartDrawerEnabled', label: 'Cart Drawer', helper: 'Enable the cart drawer experience' },
  {
    key: 'useDefaultFrequencies',
    label: 'Use Default Frequencies',
    helper: 'Calculate selected frequency based on product and quantity',
  },
];

const FeaturesSection: React.FC<SectionProps> = observer(({ data, onChange }) => {
  const features = data.features || {};

  return (
    <Section title="Features" subtitle="Enable or disable site-wide features and behaviors">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Product Grid Filter Type"
            helper="'Dropdown' displays a drop down of categories, ingredients, use cases, and tags. 'Stacked List' allows custom filter groupings."
          >
            <select
              className="hippo-input"
              value={features.productGridFilterType ?? 'Dropdown'}
              onChange={(e) => onChange('features', 'productGridFilterType', e.target.value)}
            >
              {Object.values(ProductGridFilterType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Product Link Prefix"
            helper="Prefix before product slugs. e.g. /p/product-slug or /product/product-slug"
          >
            <select
              className="hippo-input"
              value={features.productLinkPrefix ?? '/p'}
              onChange={(e) => onChange('features', 'productLinkPrefix', e.target.value)}
            >
              {Object.values(ProductLinkPrefix).map((prefix) => (
                <option key={prefix} value={prefix}>
                  {prefix}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          label="Subscription Experience"
          helper="Select the subscription management experience for customers"
        >
          <select
            className="hippo-input"
            value={features.subscriptionExperience ?? 'Classic'}
            onChange={(e) => onChange('features', 'subscriptionExperience', e.target.value)}
          >
            <option value="Classic">Classic</option>
            <option value="Version 2">Version 2</option>
          </select>
        </FormField>

        <div className="flex items-center gap-3 my-7">
          <div className="flex-1 h-px bg-[var(--border-glass)]" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
            Feature Toggles
          </span>
          <div className="flex-1 h-px bg-[var(--border-glass)]" />
        </div>

        <div className="space-y-0 rounded-xl border border-[var(--border-glass)] overflow-hidden">
          {TOGGLE_FIELDS.map(({ key, label, helper }) => (
            <div
              key={key}
              className="flex items-center justify-between py-3.5 px-4 border-b border-[var(--border-glass)] last:border-b-0"
            >
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">{label}</div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{helper}</div>
              </div>
              <input
                type="checkbox"
                className="hippo-toggle"
                checked={!!features[key]}
                onChange={(e) => onChange('features', key, e.target.checked)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 my-7">
          <div className="flex-1 h-px bg-[var(--border-glass)]" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
            Product Grid Filter Groups
          </span>
          <div className="flex-1 h-px bg-[var(--border-glass)]" />
        </div>

        <div className="rounded-xl border border-dashed border-[var(--border-glass)] p-5 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Filter group references are managed through Builder.io's content editor. This will be available here in a
            future update.
          </p>
        </div>
      </div>
    </Section>
  );
});

export default FeaturesSection;
