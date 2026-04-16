import React from 'react';
import { observer } from 'mobx-react';
import { Section, FormField } from '@goldenhippo/builder-ui';
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
          helper="Topics the brand is knowledgeable about, used in structured data for search engines. Comma-separated."
        >
          <input
            type="text"
            className="hippo-input"
            value={Array.isArray(seo.knowsAbout) ? seo.knowsAbout.join(', ') : ''}
            onChange={(e) => {
              const tags = e.target.value
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean);
              onChange('seo', 'knowsAbout', tags);
            }}
          />
          {Array.isArray(seo.knowsAbout) && seo.knowsAbout.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {seo.knowsAbout.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border border-[var(--border-glass)] text-[var(--text-secondary)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </FormField>
      </div>
    </Section>
  );
});

export default SeoSection;
