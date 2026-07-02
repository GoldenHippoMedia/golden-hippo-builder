import React from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import AppShell from './components/AppShell';
import ProductConfigPage from './product-config/product-config.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoCMSProductConfig = React.memo((props: AppProps) => {
  const { context } = props;
  return (
    <AppShell context={context}>
      <ProductConfigPage context={context} />
    </AppShell>
  );
});

HippoCMSProductConfig.displayName = 'HippoCMSProductConfig';

export default HippoCMSProductConfig;
