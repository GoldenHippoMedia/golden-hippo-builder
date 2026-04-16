import React from 'react';
import { ExtendedApplicationContext } from '../interfaces/application-context.interface';
import { openPluginSettings } from '../plugin-actions';
import AppShell from './components/AppShell';

interface AppProps {
  context: ExtendedApplicationContext;
}

const HippoCMSAdmin = React.memo((props: AppProps) => {
  const { context } = props;
  return (
    <AppShell context={context}>
      <p>Admin Page</p>
      <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[#1a1a2e] font-semibold text-sm cursor-pointer hover:brightness-110 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all mt-4" onClick={openPluginSettings}>
        Plugin Settings
      </button>
    </AppShell>
  );
});

HippoCMSAdmin.displayName = 'HippoCMSAdmin';

export default HippoCMSAdmin;
