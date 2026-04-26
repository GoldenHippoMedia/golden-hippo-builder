import React, { useEffect } from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import { funnelDataStore } from '../stores/funnel-data.store';
import AppShell from './components/AppShell';
import AdminPage from './admin/admin.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoFunnelAdmin = React.memo((props: AppProps) => {
  const { context } = props;

  useEffect(() => {
    funnelDataStore.load(context);
  }, [context]);

  return (
    <AppShell context={context}>
      <AdminPage context={context} />
    </AppShell>
  );
});

HippoFunnelAdmin.displayName = 'HippoFunnelAdmin';

export default HippoFunnelAdmin;
