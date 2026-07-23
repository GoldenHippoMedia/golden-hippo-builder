import React from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import AppShell from './components/AppShell';
import AdaConfigPage from './ada-config/ada-config.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoCMSAdaConfig = React.memo((props: AppProps) => {
  const { context } = props;
  return (
    <AppShell context={context}>
      <AdaConfigPage context={context} />
    </AppShell>
  );
});

HippoCMSAdaConfig.displayName = 'HippoCMSAdaConfig';

export default HippoCMSAdaConfig;
