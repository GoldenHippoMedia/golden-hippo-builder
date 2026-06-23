import React from 'react';
import { PageHeader, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';

interface ProductConfigPageProps {
  context: ExtendedApplicationContext;
}

const ProductConfigPage: React.FC<ProductConfigPageProps> = () => {
  return (
    <div>
      <PageHeader
        title="Product Configuration"
        subtitle="Bulk-edit tags, categories, ingredients, and use cases across your product catalog"
      />

      <Section title="Coming Soon" subtitle="A streamlined editor for product taxonomy is in progress.">
        <p className="text-sm text-[var(--text-secondary)]">
          This tab will replace Builder.io&rsquo;s default reference picker for assigning product tags, categories,
          ingredients, and use cases — making bulk taxonomy changes fast.
        </p>
      </Section>
    </div>
  );
};

export default ProductConfigPage;
