import React from 'react';
import { observer } from 'mobx-react';
import { Section, FormField, TagInput } from '@goldenhippo/builder-ui';
import { SectionProps } from './section-props';

const SeoSection: React.FC<SectionProps> = observer(({ data, onChange }) => {
  const seo = data.seo || {};

  return (
    <Section title="SEO" subtitle="Search engine optimization settings for the brand">
      <div className="space-y-4">
        <FormField
          label="Site Description"
          helper="Default meta description for the website, used when pages do not provide their own"
        >
          <textarea
            className="hippo-input"
            rows={3}
            value={seo.description ?? ''}
            onChange={(e) => onChange('seo', 'description', e.target.value)}
          />
        </FormField>

        <FormField
          label="Topics"
          helper="Topics the brand is knowledgeable about, used in structured data for search engines"
        >
          <TagInput
            value={Array.isArray(seo.knowsAbout) ? seo.knowsAbout : []}
            onChange={(tags) => onChange('seo', 'knowsAbout', tags)}
          />
        </FormField>
      </div>
    </Section>
  );
});

export default SeoSection;
