import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Section, PageHeader, LoadingSection } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import UserManagementService from '@services/user-management';
import { pluginId } from '../../constants';
import { openPluginSettings } from '../../plugin-actions';
import {
  MODEL_DEFINITIONS,
  getModelStatuses,
  syncAllModels,
  syncSingleModel,
  type ModelStatus,
  type SyncResult,
} from './model-sync';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdminPageProps {
  context: ExtendedApplicationContext;
}

interface ConnectionTestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  time?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helper: read plugin settings from context
// ---------------------------------------------------------------------------

function getPluginSettings(context: ExtendedApplicationContext) {
  // @ts-expect-error incomplete types
  const pluginSettings = context.user.organization?.value?.settings?.plugins?.get(pluginId);
  return {
    brand: (pluginSettings?.get('brand') as string) ?? '',
    otherBrand: (pluginSettings?.get('otherBrand') as string) ?? '',
    editUrl: (pluginSettings?.get('editUrl') as string) ?? '',
    apiUrl: (pluginSettings?.get('apiUrl') as string) ?? '',
    apiUser: (pluginSettings?.get('apiUser') as string) ?? '',
    apiPassword: (pluginSettings?.get('apiPassword') as string) ?? '',
    privateApiKey: (pluginSettings?.get('privateApiKey') as string) ?? '',
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const StatusBadge: React.FC<{ variant: 'success' | 'warning' | 'error'; label: string }> = ({ variant, label }) => {
  const cls: Record<string, string> = {
    success: 'bg-[var(--success)]/15 text-[var(--success)]',
    warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
    error: 'bg-[var(--error)]/15 text-[var(--error)]',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cls[variant]}`}>{label}</span>;
};

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 my-7">
    <div className="flex-1 h-px bg-[var(--border-glass)]" />
    <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">{label}</span>
    <div className="flex-1 h-px bg-[var(--border-glass)]" />
  </div>
);

const SmallButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className, ...props }) => (
  <button
    className={`px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ''}`}
    {...props}
  >
    {children}
  </button>
);

const AccentButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }
> = ({ children, className, ...props }) => (
  <button
    className={`px-5 py-2 rounded-lg bg-[var(--accent)] text-[#1a1a2e] font-semibold text-sm cursor-pointer transition-all hover:brightness-110 hover:shadow-[0_0_20px_var(--accent-glow)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none ${className ?? ''}`}
    {...props}
  >
    {children}
  </button>
);

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <div className="text-xs font-semibold text-[var(--text-secondary)] tracking-wide mb-1">{label}</div>
    <div className="text-sm text-[var(--text-primary)]">{value}</div>
  </div>
);

const Spinner: React.FC = () => (
  <svg className="animate-spin h-4 w-4 text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ---------------------------------------------------------------------------
// Connection test card
// ---------------------------------------------------------------------------

const ConnectionCard: React.FC<{
  name: string;
  result: ConnectionTestResult;
  onTest: () => void;
}> = ({ name, result, onTest }) => (
  <div className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-glass)] p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-[var(--text-primary)]">{name}</span>
      {result.status === 'idle' && <StatusBadge variant="warning" label="Not tested" />}
      {result.status === 'testing' && <Spinner />}
      {result.status === 'success' && <StatusBadge variant="success" label="Connected" />}
      {result.status === 'error' && <StatusBadge variant="error" label="Failed" />}
    </div>

    {result.time !== undefined && (
      <div className="text-xs text-[var(--text-muted)]">Response time: {result.time}ms</div>
    )}

    {result.error && (
      <div className="text-xs text-[var(--error)] bg-[var(--error)]/10 rounded-lg px-3 py-2 break-all">{result.error}</div>
    )}

    <SmallButton onClick={onTest} disabled={result.status === 'testing'}>
      {result.status === 'testing' ? 'Testing...' : 'Test Connection'}
    </SmallButton>
  </div>
);

// ---------------------------------------------------------------------------
// Model row
// ---------------------------------------------------------------------------

const ModelRow: React.FC<{
  status: ModelStatus;
  syncing: boolean;
  allStatuses: ModelStatus[];
  onSync: (name: string) => void;
}> = ({ status, syncing, allStatuses, onSync }) => {
  const missingDeps = status.dependencies.filter((dep) => {
    const depStatus = allStatuses.find((s) => s.name === dep);
    return !depStatus?.exists;
  });
  const canSync = missingDeps.length === 0;

  return (
    <tr className="border-b border-[var(--border-glass)] last:border-b-0">
      <td className="py-3 pr-4">
        <div className="text-sm font-medium text-[var(--text-primary)]">{status.displayName}</div>
        <div className="text-[11px] text-[var(--text-muted)] font-mono">{status.name}</div>
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs text-[var(--text-muted)]">Phase {status.phase % 1 === 0 ? status.phase : status.phase.toFixed(1)}</span>
      </td>
      <td className="py-3 pr-4">
        {status.exists ? <StatusBadge variant="success" label="Synced" /> : <StatusBadge variant="warning" label="Missing" />}
      </td>
      <td className="py-3 pr-4">
        {status.dependencies.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {status.dependencies.map((dep) => {
              const depStatus = allStatuses.find((s) => s.name === dep);
              return (
                <span
                  key={dep}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    depStatus?.exists
                      ? 'bg-[var(--success)]/10 text-[var(--success)]'
                      : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                  }`}
                >
                  {dep}
                </span>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">None</span>
        )}
      </td>
      <td className="py-3 text-right">
        {syncing ? (
          <Spinner />
        ) : (
          <SmallButton
            onClick={() => onSync(status.name)}
            disabled={!canSync}
            title={!canSync ? `Missing dependencies: ${missingDeps.join(', ')}` : `Sync ${status.displayName}`}
          >
            Sync
          </SmallButton>
        )}
      </td>
    </tr>
  );
};

// ---------------------------------------------------------------------------
// Main admin page
// ---------------------------------------------------------------------------

const AdminPage: React.FC<AdminPageProps> = observer(({ context }) => {
  const user = UserManagementService.getUserDetails(context);
  const settings = getPluginSettings(context);
  const brandDisplay = settings.brand === 'Other' ? settings.otherBrand : settings.brand;

  // Connection test state
  const [cdnTest, setCdnTest] = useState<ConnectionTestResult>({ status: 'idle' });
  const [apiTest, setApiTest] = useState<ConnectionTestResult>({ status: 'idle' });
  const [writeTest, setWriteTest] = useState<ConnectionTestResult>({ status: 'idle' });

  // Model sync state
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([]);
  const [syncingModel, setSyncingModel] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);

  // Space info
  const currentOrg = context.user.organizations.find(
    (org) => org.value.id === context.user.currentOrganization,
  );
  const orgName = currentOrg?.value.name ?? 'Unknown';
  const apiKey = context.user.apiKey;
  const authHeaders = context.user.authHeaders as Record<string, string>;

  // Load model statuses on mount
  useEffect(() => {
    setModelStatuses(getModelStatuses(context.models.result));
  }, [context.models.result]);

  const refreshStatuses = useCallback(() => {
    setModelStatuses(getModelStatuses(context.models.result));
  }, [context.models.result]);

  // ---- Connection tests ----

  const testCdn = useCallback(async () => {
    setCdnTest({ status: 'testing' });
    const start = Date.now();
    try {
      const resp = await fetch(
        `https://cdn.builder.io/api/v3/content/gh-brand-config?apiKey=${apiKey}&limit=1`,
        { headers: authHeaders },
      );
      const elapsed = Date.now() - start;
      if (resp.ok) {
        setCdnTest({ status: 'success', time: elapsed });
      } else {
        const body = await resp.text();
        setCdnTest({ status: 'error', time: elapsed, error: `${resp.status}: ${body.slice(0, 200)}` });
      }
    } catch (e) {
      setCdnTest({ status: 'error', time: Date.now() - start, error: e instanceof Error ? e.message : String(e) });
    }
  }, [apiKey, authHeaders]);

  const testApi = useCallback(async () => {
    setApiTest({ status: 'testing' });
    const start = Date.now();
    try {
      const resp = await fetch(`${settings.apiUrl}/config`, {
        headers: {
          Authorization: 'Basic ' + btoa(settings.apiUser + ':' + settings.apiPassword),
          'X-Brand': brandDisplay,
        },
      });
      const elapsed = Date.now() - start;
      if (resp.ok) {
        setApiTest({ status: 'success', time: elapsed });
      } else {
        const body = await resp.text();
        setApiTest({ status: 'error', time: elapsed, error: `${resp.status}: ${body.slice(0, 200)}` });
      }
    } catch (e) {
      setApiTest({ status: 'error', time: Date.now() - start, error: e instanceof Error ? e.message : String(e) });
    }
  }, [settings.apiUrl, settings.apiUser, settings.apiPassword, brandDisplay]);

  const testWrite = useCallback(async () => {
    setWriteTest({ status: 'testing' });
    const start = Date.now();
    try {
      const resp = await fetch(
        `https://builder.io/api/v1/write/gh-brand-config?apiKey=${apiKey}&limit=0`,
        { headers: { Authorization: `Bearer ${settings.privateApiKey}` } },
      );
      const elapsed = Date.now() - start;
      if (resp.ok) {
        setWriteTest({ status: 'success', time: elapsed });
      } else {
        const body = await resp.text();
        setWriteTest({ status: 'error', time: elapsed, error: `${resp.status}: ${body.slice(0, 200)}` });
      }
    } catch (e) {
      setWriteTest({ status: 'error', time: Date.now() - start, error: e instanceof Error ? e.message : String(e) });
    }
  }, [apiKey, settings.privateApiKey]);

  // ---- Model sync ----

  const handleSyncAll = useCallback(async () => {
    setSyncingAll(true);
    setSyncResults(null);
    try {
      const results = await syncAllModels(context as any, (modelName) => {
        setSyncingModel(modelName);
      });
      setSyncResults(results);
    } finally {
      setSyncingModel(null);
      setSyncingAll(false);
      refreshStatuses();
    }
  }, [context, refreshStatuses]);

  const handleSyncSingle = useCallback(
    async (modelName: string) => {
      setSyncingModel(modelName);
      setSyncResults(null);
      try {
        const result = await syncSingleModel(modelName, context as any);
        setSyncResults([result]);
      } finally {
        setSyncingModel(null);
        refreshStatuses();
      }
    },
    [context, refreshStatuses],
  );

  return (
    <div>
      <PageHeader title="Administration" subtitle="Space configuration, connectivity, and model management" />

      <div className="space-y-6">
        {/* ---- Section 1: Space Info ---- */}
        <Section title="Space Information" subtitle="Current Builder.io space and plugin context">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow label="Organization" value={orgName} />
            <InfoRow label="User Email" value={user.email} />
            <InfoRow label="Brand" value={brandDisplay || 'Not configured'} />
            <InfoRow
              label="API Key"
              value={
                apiKey ? (
                  <span className="font-mono text-xs">{apiKey.slice(0, 8)}...</span>
                ) : (
                  <span className="text-[var(--text-muted)]">Not available</span>
                )
              }
            />
            <InfoRow
              label="Private API Key"
              value={
                settings.privateApiKey ? (
                  <StatusBadge variant="success" label="Configured" />
                ) : (
                  <StatusBadge variant="error" label="Missing" />
                )
              }
            />
          </div>
        </Section>

        {/* ---- Section 2: API Connection Status ---- */}
        <Section title="API Connection Status" subtitle="Test connectivity to Builder.io and Hippo Commerce services">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ConnectionCard name="Builder.io CDN" result={cdnTest} onTest={testCdn} />
            <ConnectionCard name="Hippo Commerce API" result={apiTest} onTest={testApi} />
            <ConnectionCard name="Builder.io Write API" result={writeTest} onTest={testWrite} />
          </div>
        </Section>

        {/* ---- Section 3: Plugin Settings Overview ---- */}
        <Section
          title="Plugin Settings"
          subtitle="Current plugin configuration (read-only)"
          actions={<SmallButton onClick={openPluginSettings}>Open Settings</SmallButton>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow label="Brand" value={brandDisplay || 'Not configured'} />
            <InfoRow label="Development Site URL" value={settings.editUrl || 'Not set'} />
            <InfoRow label="API URL" value={settings.apiUrl || 'Not set'} />
            <InfoRow label="API User" value={settings.apiUser || 'Not set'} />
            <InfoRow label="API Password" value={settings.apiPassword ? '••••••' : 'Not set'} />
            <InfoRow
              label="Private API Key"
              value={settings.privateApiKey ? 'Configured' : 'Not set'}
            />
          </div>
        </Section>

        {/* ---- Section 4: Model Sync ---- */}
        <Section
          title="Model Sync"
          subtitle={`${modelStatuses.filter((s) => s.exists).length} of ${MODEL_DEFINITIONS.length} models synced`}
          actions={
            <AccentButton onClick={handleSyncAll} disabled={syncingAll}>
              {syncingAll ? 'Syncing...' : 'Sync All Models'}
            </AccentButton>
          }
        >
          {/* Sync result banner */}
          {syncResults && (
            <div className="mb-4">
              {syncResults.every((r) => r.success) ? (
                <div className="rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 px-4 py-3 text-sm text-[var(--success)]">
                  All {syncResults.length} model(s) synced successfully.
                </div>
              ) : (
                <div className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
                  {syncResults.filter((r) => !r.success).length} model(s) failed to sync.
                  {syncResults
                    .filter((r) => !r.success)
                    .map((r) => (
                      <div key={r.modelName} className="mt-1 text-xs">
                        <strong>{r.modelName}:</strong> {r.error}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-glass)]">
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Model</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Phase</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Status</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">Dependencies</th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {modelStatuses.map((status) => (
                  <ModelRow
                    key={status.name}
                    status={status}
                    syncing={syncingModel === status.name}
                    allStatuses={modelStatuses}
                    onSync={handleSyncSingle}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
});

export default AdminPage;
