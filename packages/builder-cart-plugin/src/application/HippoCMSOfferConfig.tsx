import React from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import AppShell from './components/AppShell';
import OfferConfigPage from './offer-config/offer-config.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoCMSOfferConfig = React.memo((props: AppProps) => {
  const { context } = props;
  return (
    <AppShell context={context}>
      <OfferConfigPage context={context} />
    </AppShell>
  );
});

HippoCMSOfferConfig.displayName = 'HippoCMSOfferConfig';

export default HippoCMSOfferConfig;
