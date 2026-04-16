import React from 'react';
import { observer } from 'mobx-react';
import { Section, FormField } from '@goldenhippo/builder-ui';
import { FooterType } from '@goldenhippo/builder-cart-schemas';
import { SectionProps } from './section-props';

const FooterSection: React.FC<SectionProps> = observer(({ data, onChange }) => {
  const footer = data.footer || {};

  return (
    <Section title="Footer" subtitle="Footer layout and content settings">
      <FormField label="Footer Type" helper="Choose the footer layout style for the website">
        <select
          className="hippo-input"
          value={footer.footerType ?? 'BASIC'}
          onChange={(e) => onChange('footer', 'footerType', e.target.value)}
        >
          {Object.values(FooterType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </FormField>
    </Section>
  );
});

export default FooterSection;
