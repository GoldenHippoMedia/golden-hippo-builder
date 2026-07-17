import React from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import AppShell from './components/AppShell';
import SeoConfigPage from './seo-config/seo-config.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoCMSSeoConfig = React.memo((props: AppProps) => {
  const { context } = props;
  return (
    <AppShell context={context}>
      <SeoConfigPage context={context} />
    </AppShell>
  );
});

HippoCMSSeoConfig.displayName = 'HippoCMSSeoConfig';

export default HippoCMSSeoConfig;
