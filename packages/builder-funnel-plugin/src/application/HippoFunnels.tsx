import React, { useEffect } from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import { funnelDataStore } from '../stores/funnel-data.store';
import AppShell from './components/AppShell';
import FunnelsPage from './funnels/funnels.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoFunnels = React.memo((props: AppProps) => {
  const { context } = props;

  useEffect(() => {
    funnelDataStore.load(context);
  }, [context]);

  return (
    <AppShell context={context}>
      <FunnelsPage context={context} />
    </AppShell>
  );
});

HippoFunnels.displayName = 'HippoFunnels';

export default HippoFunnels;
