import React, { useCallback, useState } from 'react';
import { PageHeader, Section } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';
import { syncFunnelModels } from '../../services/model-sync';
import { openPluginSettings } from '../../plugin';

interface AdminPageProps {
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onRefresh: () => Promise<void>;
}

interface SeedLog {
  message: string;
  type: 'info' | 'success' | 'error';
}

const AdminPage: React.FC<AdminPageProps> = ({ data, context, onRefresh }) => {
  const [logs, setLogs] = useState<SeedLog[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const isAdmin = context.user.can('admin');

  const log = useCallback((message: string, type: SeedLog['type'] = 'info') => {
    setLogs((prev) => [...prev, { message, type }]);
  }, []);

  const clearLogs = () => setLogs([]);

  const [deleteSelection, setDeleteSelection] = useState<Record<string, boolean>>({
    funnels: false,
    destinations: false,
    funnelPages: false,
  });

  const toggleDeleteModel = (key: string) => {
    setDeleteSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedDeleteCount = Object.values(deleteSelection).filter(Boolean).length;

  const handleDeleteSelected = useCallback(async () => {
    const modelLabels: Record<string, string> = {
      destinations: 'destinations',
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
        for (const item of data.funnelPages) {
          await api.removeContent(item);
          log(`Deleted funnel page "${item.data?.title ?? item.id}"`, 'info');
        }
      }
      if (deleteSelection.destinations) {
        log('Deleting destinations...', 'info');
        for (const item of data.destinations) {
          await api.removeContent(item);
          log(`Deleted destination "${item.data?.name ?? item.id}"`, 'info');
        }
      }
      if (deleteSelection.funnels) {
        log('Deleting funnels...', 'info');
        for (const item of data.funnels) {
          await api.removeContent(item);
          log(`Deleted funnel "${item.data?.name ?? item.id}"`, 'info');
        }
      }

      setDeleteSelection({ funnels: false, destinations: false, funnelPages: false });
      await onRefresh();
      log(`--- Deleted all ${selected.join(', ')}. ---`, 'success');
    } catch {
      // user canceled prompt
    } finally {
      setRunning(null);
    }
  }, [context, data, deleteSelection, log, onRefresh]);

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

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Admin" />
        <Section>
          <p className="text-base-content/60 text-center py-8">You need admin permissions to access this page.</p>
        </Section>
      </div>
    );
  }

  const counts = {
    funnels: data.funnels.length,
    destinations: data.destinations.length,
    funnelPages: data.funnelPages.length,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Admin" />

      <div className="space-y-6">
        <Section title="Current Data">
          <div className="flex flex-wrap gap-6 text-sm">
            <span>
              <span className="text-2xl font-bold">{counts.funnels}</span>{' '}
              <span className="text-base-content/60">funnels</span>
            </span>
            <span>
              <span className="text-2xl font-bold">{counts.destinations}</span>{' '}
              <span className="text-base-content/60">destinations</span>
            </span>
            <span>
              <span className="text-2xl font-bold">{counts.funnelPages}</span>{' '}
              <span className="text-base-content/60">funnel pages</span>
            </span>
          </div>
        </Section>

        <Section title="Model Management">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sync Models</p>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Push the latest model schemas to Builder.io. Creates missing models and updates existing ones.
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleSyncModels} disabled={!!running}>
                {running === 'sync-models' ? 'Syncing...' : 'Sync Models'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Plugin Settings</p>
                <p className="text-sm text-base-content/50 mt-0.5">
                  Configure URLs, API credentials, and Builder.io keys.
                </p>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() =>
                  openPluginSettings().catch(() => {
                    /* ignore */
                  })
                }
              >
                Open Settings
              </button>
            </div>
          </div>
        </Section>

        <Section title="Danger Zone" variant="danger">
          <p className="text-sm text-base-content/60 mb-4">
            Select model(s) to delete all their entries. Deletions are permanent.
            <br />
            <strong>Note:</strong> Funnels and destinations are managed by the ERP sync job — deleting them here will
            cause them to be re-created on the next sync.
          </p>
          <div className="space-y-2 mb-4">
            {(
              [
                { key: 'funnelPages', label: 'Funnel Pages', count: counts.funnelPages },
                { key: 'destinations', label: 'Destinations (sync-managed)', count: counts.destinations },
                { key: 'funnels', label: 'Funnels (sync-managed)', count: counts.funnels },
              ] as const
            ).map(({ key, label, count }) => (
              <label
                key={key}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors cursor-pointer ${
                  deleteSelection[key] ? 'border-error bg-error/10' : 'border-base-300 hover:border-base-content/30'
                } ${count === 0 ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-error"
                  checked={deleteSelection[key]}
                  onChange={() => toggleDeleteModel(key)}
                  disabled={count === 0}
                />
                <span className="font-medium">{label}</span>
                <span className="text-sm text-base-content/50 ml-auto">{count} entries</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="btn btn-error btn-outline"
              onClick={handleDeleteSelected}
              disabled={!!running || selectedDeleteCount === 0}
            >
              {running === 'delete-selected' ? 'Deleting...' : `Delete Selected (${selectedDeleteCount})`}
            </button>
          </div>
        </Section>

        {logs.length > 0 && (
          <Section
            title="Log"
            actions={
              <button className="btn btn-sm btn-ghost" onClick={clearLogs}>
                Clear
              </button>
            }
          >
            <div className="bg-base-300 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-xs space-y-1">
              {logs.map((entry, i) => (
                <div
                  key={i}
                  className={
                    entry.type === 'success'
                      ? 'text-success'
                      : entry.type === 'error'
                        ? 'text-error'
                        : 'text-base-content/70'
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
};

export default AdminPage;
