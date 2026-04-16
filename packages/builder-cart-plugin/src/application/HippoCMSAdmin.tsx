import React from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import AppShell from './components/AppShell';
import AdminPage from './admin/admin.page';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoCMSAdmin = React.memo((props: AppProps) => {
  const { context } = props;
  return (
    <AppShell context={context}>
      <AdminPage context={context} />
    </AppShell>
  );
});

HippoCMSAdmin.displayName = 'HippoCMSAdmin';

export default HippoCMSAdmin;
