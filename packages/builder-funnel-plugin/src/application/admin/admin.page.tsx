import React, { useCallback, useState } from 'react';
import { observer } from 'mobx-react';
import { PageHeader, Section } from '@goldenhippo/builder-ui';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import { funnelDataStore } from '../../stores/funnel-data.store';
import BuilderApi from '../../services/builder-api';
import { syncFunnelModels } from '../../services/model-sync';
import { openPluginSettings } from '../../plugin-actions';

interface AdminPageProps {
  context: ExtendedApplicationContext;
}

interface SeedLog {
  message: string;
  type: 'info' | 'success' | 'error';
}

const SmallButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({
  children,
  className,
  ...props
}) => (
  <button
    className={`px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ''}`}
    {...props}
  >
    {children}
  </button>
);

const AccentButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({
  children,
  className,
  ...props
}) => (
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

const AdminPage: React.FC<AdminPageProps> = observer(({ context }) => {
  const [logs, setLogs] = useState<SeedLog[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const [deleteSelection, setDeleteSelection] = useState<Record<string, boolean>>({
    funnels: false,
    funnelPages: false,
  });

  const log = useCallback((message: string, type: SeedLog['type'] = 'info') => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  const clearLogs = () => setLogs([]);

  const toggleDeleteModel = (key: string) => {
    setDeleteSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedDeleteCount = Object.values(deleteSelection).filter(Boolean).length;

  const { funnels, funnelPages } = funnelDataStore;

  const handleDeleteSelected = useCallback(async () => {
    const modelLabels: Record<string, string> = {
      funnels: 'funnels',
      funnelPages: 'funnel pages',
    };
    const selected = Object.entries(deleteSelection)
      .filter(([, v]) => v)
      .map(([k]) => modelLabels[k]);
    if (selected.length === 0) return;

    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Delete Selected Model Data',
        text: `This will permanently delete ALL entries for: ${selected.join(', ')}. Type "DELETE" to confirm.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      if (confirmed !== 'DELETE') return;

      setRunning('delete-selected');
      const api = new BuilderApi(context);

      if (deleteSelection.funnelPages) {
        log('Deleting funnel pages...', 'info');
        for (const item of funnelPages) {
          await api.removeContent(item);
          log(`Deleted funnel page "${item.data?.title ?? item.id}"`, 'info');
        }
      }
      if (deleteSelection.funnels) {
        log('Deleting funnels...', 'info');
        for (const item of funnels) {
          await api.removeContent(item);
          log(`Deleted funnel "${item.data?.name ?? item.id}"`, 'info');
        }
      }

      setDeleteSelection({ funnels: false, funnelPages: false });
      await funnelDataStore.refresh(context);
      log(`--- Deleted all ${selected.join(', ')}. ---`, 'success');
    } catch {
      // user canceled prompt
    } finally {
      setRunning(null);
    }
  }, [context, funnels, funnelPages, deleteSelection, log]);

  const handleSyncModels = useCallback(async () => {
    setRunning('sync-models');
    clearLogs();
    try {
      log('Starting model sync...', 'info');
      await syncFunnelModels(context, (progress) => {
        log(`[${progress.current}/${progress.total}] Synced ${progress.phase} model`, 'success');
      });
      log('--- All models synced successfully ---', 'success');
    } catch (err: any) {
      log(`Error syncing models: ${err.message}`, 'error');
    } finally {
      setRunning(null);
    }
  }, [context, log]);

  const counts = {
    funnels: funnels.length,
    funnelPages: funnelPages.length,
  };

  return (
    <div>
      <PageHeader title="Administration" subtitle="Model management, data operations, and plugin configuration" />

      <div className="space-y-6">
        <Section title="Current Data" subtitle="Content entries loaded from Builder.io">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoRow label="Funnels" value={<span className="text-lg font-bold">{counts.funnels}</span>} />
            <InfoRow label="Funnel Pages" value={<span className="text-lg font-bold">{counts.funnelPages}</span>} />
          </div>
        </Section>

        <Section title="Model Management" subtitle="Sync model schemas and manage plugin configuration">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Sync Models</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Push the latest model schemas to Builder.io. Creates missing models and updates existing ones.
                </div>
              </div>
              <AccentButton onClick={handleSyncModels} disabled={!!running}>
                {running === 'sync-models' ? 'Syncing...' : 'Sync Models'}
              </AccentButton>
            </div>
            <div className="h-px bg-[var(--border-glass)]" />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--text-primary)]">Plugin Settings</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Configure URLs, API credentials, and Builder.io keys.
                </div>
              </div>
              <SmallButton onClick={() => openPluginSettings()}>Open Settings</SmallButton>
            </div>
          </div>
        </Section>

        <Section title="Danger Zone" variant="danger">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Select model(s) to delete all their entries. Deletions are permanent.
          </p>
          <div className="space-y-2 mb-4">
            {(
              [
                { key: 'funnelPages', label: 'Funnel Pages', count: counts.funnelPages },
                { key: 'funnels', label: 'Funnels (sync-managed)', count: counts.funnels },
              ] as const
            ).map(({ key, label, count }) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                  deleteSelection[key]
                    ? 'border-[var(--error)] bg-[var(--error)]/10'
                    : 'border-[var(--border-glass)] hover:border-[var(--text-muted)]'
                } ${count === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded accent-[var(--error)] cursor-pointer"
                  checked={deleteSelection[key]}
                  onChange={() => toggleDeleteModel(key)}
                  disabled={count === 0}
                />
                <span className="font-medium text-sm text-[var(--text-primary)]">{label}</span>
                <span className="text-xs text-[var(--text-muted)] ml-auto">{count} entries</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 text-[var(--error)] text-sm font-medium cursor-pointer hover:bg-[var(--error)]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleDeleteSelected}
              disabled={!!running || selectedDeleteCount === 0}
            >
              {running === 'delete-selected' ? 'Deleting...' : `Delete Selected (${selectedDeleteCount})`}
            </button>
          </div>
        </Section>

        {logs.length > 0 && (
          <Section title="Log" actions={<SmallButton onClick={clearLogs}>Clear</SmallButton>}>
            <div className="bg-[var(--bg-glass)] border border-[var(--border-glass)] rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((entry, i) => (
                <div
                  key={i}
                  className={
                    entry.type === 'success'
                      ? 'text-[var(--success)]'
                      : entry.type === 'error'
                        ? 'text-[var(--error)]'
                        : 'text-[var(--text-secondary)]'
                  }
                >
                  {entry.message}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
});

export default AdminPage;
