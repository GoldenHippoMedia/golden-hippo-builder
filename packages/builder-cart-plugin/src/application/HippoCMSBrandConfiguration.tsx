import React from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import AppShell from './components/AppShell';
import BrandConfigPage from './brand-config/brand-config.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoCMSBrandConfiguration = React.memo((props: AppProps) => {
  const { context } = props;
  return (
    <AppShell context={context}>
      <BrandConfigPage context={context} />
    </AppShell>
  );
});

HippoCMSBrandConfiguration.displayName = 'HippoCMSBrandConfiguration';

export default HippoCMSBrandConfiguration;
