import React from 'react';
import { observer } from 'mobx-react';
import { Section, FormField } from '@goldenhippo/builder-ui';
import { HeaderType } from '@goldenhippo/builder-cart-schemas';
import { SectionProps } from './section-props';

const HeaderSection: React.FC<SectionProps> = observer(({ data, onChange }) => {
  const header = data.header || {};

  return (
    <Section title="Header" subtitle="Header layout and navigation settings">
      <div className="space-y-4">
        <FormField label="Header Type" helper="Select the type of header to use">
          <select
            className="hippo-input"
            value={header.headerType ?? 'MEDIUM'}
            onChange={(e) => onChange('header', 'headerType', e.target.value)}
          >
            {Object.values(HeaderType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

        {header.headerType === HeaderType.BASIC && (
          <div className="rounded-xl border border-[var(--border-glass)] p-4 space-y-2">
            <h4 className="text-sm font-semibold">Basic Header Configuration</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              The basic header includes: logo image, mobile links, desktop links, CTAs, my account menus (guest &
              authorized), sticky header config, and locale selection.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              These deeply nested list configurations are best managed through Builder.io's native content editor. Full
              support for editing them here is coming in a future update.
            </p>
          </div>
        )}

        {header.headerType === HeaderType.MEDIUM && (
          <div className="rounded-xl border border-[var(--border-glass)] p-4 space-y-2">
            <h4 className="text-sm font-semibold">Medium Header Configuration</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              The medium header includes: wrapper ID/classes, shipping message toggle, mobile menu (logo, nav, dropdown
              content), desktop menu (logo, nav, content sections), banners above header, and contact URL.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              These deeply nested list configurations are best managed through Builder.io's native content editor. Full
              support for editing them here is coming in a future update.
            </p>
          </div>
        )}

        {header.headerType === HeaderType.MEGA && (
          <div className="rounded-xl border border-[var(--border-glass)] p-4 space-y-2">
            <h4 className="text-sm font-semibold">Mega Menu Configuration</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              The mega menu includes: shipping message toggle, mobile links with sub-links, and desktop shop navigation
              with categorized link groups.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              These deeply nested list configurations are best managed through Builder.io's native content editor. Full
              support for editing them here is coming in a future update.
            </p>
          </div>
        )}

        {header.headerType === HeaderType.DMP && (
          <div className="rounded-xl border border-[var(--border-glass)] p-4 space-y-2">
            <h4 className="text-sm font-semibold">DMP Header Configuration</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              The DMP header includes: logo image, mobile links, and desktop links.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              These deeply nested list configurations are best managed through Builder.io's native content editor. Full
              support for editing them here is coming in a future update.
            </p>
          </div>
        )}

        {(header.headerType === HeaderType.LINKLESS || header.headerType === HeaderType.NONE) && (
          <div className="rounded-xl border border-dashed border-[var(--border-glass)] p-5 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No additional configuration needed for the {header.headerType} header type.
            </p>
          </div>
        )}
      </div>
    </Section>
  );
});

export default HeaderSection;
