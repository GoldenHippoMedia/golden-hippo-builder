import React, { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { Section, PageHeader, LoadingSection } from '@goldenhippo/builder-ui';
import { grantLevelForTab, TabAccessGrant, TabAccessLevel } from '@goldenhippo/builder-cart-schemas';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import UserManagementService from '@services/user-management';
import BuilderApi from '@services/builder-api';
import { pluginId, CONTROLLABLE_TABS } from '../../constants';
import { openPluginSettings } from '../../plugin-actions';
import {
  MODEL_DEFINITIONS,
  SCHEMA_VERSION,
  getFieldDiffs,
  getModelStatuses,
  getUnmanagedModels,
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

const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4 text-[var(--accent)]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Chevron: React.FC<{ open: boolean; className?: string }> = ({ open, className }) => (
  <svg
    className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${className ?? ''}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.84a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const CollapsibleBanner: React.FC<{
  variant: 'success' | 'warning' | 'neutral';
  summary: React.ReactNode;
  children: React.ReactNode;
}> = ({ variant, summary, children }) => {
  const [open, setOpen] = useState(false);
  const styles: Record<typeof variant, { container: string; text: string }> = {
    success: { container: 'bg-[var(--success)]/10 border-[var(--success)]/30', text: 'text-[var(--success)]' },
    warning: { container: 'bg-[var(--warning)]/10 border-[var(--warning)]/30', text: 'text-[var(--warning)]' },
    neutral: { container: 'bg-[var(--bg-glass)] border-[var(--border-glass)]', text: 'text-[var(--text-primary)]' },
  };
  const s = styles[variant];
  return (
    <div className={`mb-4 rounded-lg border ${s.container}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer text-left"
      >
        <span className={`text-sm font-semibold ${s.text}`}>{summary}</span>
        <Chevron open={open} className={s.text} />
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
};

const VersionIndicator: React.FC<{ version: string }> = ({ version }) => (
  <div className="mb-4 flex items-center gap-2 text-sm">
    <span className="text-[var(--text-secondary)]">Schema version</span>
    <span className="font-mono font-semibold text-[var(--text-primary)]">{version}</span>
  </div>
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
      <div className="text-xs text-[var(--error)] bg-[var(--error)]/10 rounded-lg px-3 py-2 break-all">
        {result.error}
      </div>
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
        <span className="text-xs text-[var(--text-muted)]">
          Phase {status.phase % 1 === 0 ? status.phase : status.phase.toFixed(1)}
        </span>
      </td>
      <td className="py-3 pr-4">
        {status.exists ? (
          <StatusBadge variant="success" label="Synced" />
        ) : (
          <StatusBadge variant="warning" label="Missing" />
        )}
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
// Tab access control
// ---------------------------------------------------------------------------

interface AccessRow {
  email: string;
  /** Builder user id when known (from the roster or an existing grant); '' for manually added rows. */
  userId: string;
  name?: string;
  /** Builder role name (e.g. 'admin', 'editor') when known from the roster. */
  role?: string;
}

// row key -> tab path -> access level. Tabs absent from a row's map are 'none'.
type TabAccessDraft = Record<string, Record<string, TabAccessLevel>>;

/** Stable key for a row/grant: prefer email (always present for manual adds), fall back to userId. */
const rowKey = (r: { email: string; userId: string }): string => r.email || r.userId;

const ACCESS_LEVELS: { value: TabAccessLevel; label: string }[] = [
  { value: 'none', label: 'No access' },
  { value: 'read', label: 'Read only' },
  { value: 'write', label: 'Read & write' },
];

/** Admins/owners already see every tab, so their per-tab grants are moot. */
const isFullAccessRole = (role?: string): boolean => {
  const r = role?.toLowerCase() ?? '';
  return r === 'admin' || r === 'owner';
};

const TabAccessSection: React.FC<{ context: ExtendedApplicationContext }> = ({ context }) => {
  const [loading, setLoading] = useState(true);
  // Hard failure loading existing grants — without them we can't safely save.
  const [grantsError, setGrantsError] = useState<string | null>(null);
  // Soft failure loading the user roster — grants still work via manual add.
  const [rosterWarning, setRosterWarning] = useState<string | null>(null);
  const [rows, setRows] = useState<AccessRow[]>([]);
  const [draft, setDraft] = useState<TabAccessDraft>({});
  const [entryId, setEntryId] = useState<string | undefined>(undefined);
  const [newEmail, setNewEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setGrantsError(null);
      setRosterWarning(null);
      const api = new BuilderApi(context);

      // Existing grants are the source of truth — load them on their own so a
      // failure here is distinct from the roster failing.
      let grants: TabAccessGrant[] = [];
      try {
        const entry = await api.getTabAccess();
        grants = entry?.data?.grants ?? [];
        if (!cancelled) setEntryId(entry?.id);
      } catch (e) {
        if (!cancelled) setGrantsError(e instanceof Error ? e.message : String(e));
      }

      let roster: AccessRow[] = [];
      try {
        const list = await api.listUsers();
        roster = list.map((u) => ({ email: u.email, userId: u.id, name: u.name, role: u.role }));
      } catch (e) {
        if (!cancelled) setRosterWarning(e instanceof Error ? e.message : String(e));
      }

      if (cancelled) return;

      // Merge roster ∪ users already present in grants, keyed so each appears once.
      const byKey = new Map<string, AccessRow>();
      roster.forEach((r) => byKey.set(rowKey(r), r));
      grants.forEach((g: TabAccessGrant) => {
        const r: AccessRow = { email: g.email ?? '', userId: g.userId ?? '' };
        byKey.set(rowKey(r), { ...byKey.get(rowKey(r)), ...r });
      });

      const nextDraft: TabAccessDraft = {};
      byKey.forEach((r, key) => {
        const grant = grants.find((g: TabAccessGrant) => g.userId === r.userId || g.email === r.email);
        const levels: Record<string, TabAccessLevel> = {};
        CONTROLLABLE_TABS.forEach((t) => {
          levels[t.path] = grantLevelForTab(grant, t.path);
        });
        nextDraft[key] = levels;
      });

      setRows([...byKey.values()].sort((a, b) => a.email.localeCompare(b.email)));
      setDraft(nextDraft);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [context]);

  const setLevel = useCallback((key: string, tabPath: string, level: TabAccessLevel) => {
    setSaveState('idle');
    setDraft((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), [tabPath]: level } }));
  }, []);

  const addUser = useCallback(() => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    setSaveState('idle');
    setRows((prev) => {
      if (prev.some((r) => r.email.toLowerCase() === email)) return prev;
      const next = [...prev, { email, userId: '' }];
      return next.sort((a, b) => a.email.localeCompare(b.email));
    });
    setDraft((prev) => (prev[email] ? prev : { ...prev, [email]: {} }));
    setNewEmail('');
  }, [newEmail]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveState('idle');
    setSaveError(null);
    try {
      const api = new BuilderApi(context);
      const grants: TabAccessGrant[] = rows
        .map((r) => {
          const levels = draft[rowKey(r)] ?? {};
          const readTabs = Object.keys(levels).filter((path) => levels[path] === 'read');
          const writeTabs = Object.keys(levels).filter((path) => levels[path] === 'write');
          return { userId: r.userId, email: r.email, readTabs, writeTabs };
        })
        .filter((g) => g.readTabs.length > 0 || g.writeTabs.length > 0);
      const savedId = await api.saveTabAccess(grants, entryId);
      setEntryId(savedId);
      setSaveState('success');
    } catch (e) {
      setSaveState('error');
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [context, rows, draft, entryId]);

  return (
    <Section
      title="Tab Access"
      subtitle="Grant individual users access to specific plugin tabs"
      actions={
        <AccentButton onClick={handleSave} disabled={saving || loading || !!grantsError}>
          {saving ? 'Saving...' : 'Save Access'}
        </AccentButton>
      }
    >
      <div className="mb-4 text-xs text-[var(--text-secondary)]">
        Admins always have access to every tab. For each non-admin user, choose their access per tab: <em>No access</em>{' '}
        hides the tab, <em>Read only</em> shows it without letting them save changes, and <em>Read &amp; write</em>{' '}
        grants full editing. The Administration tab itself is always restricted to admins.
      </div>

      {saveState === 'success' && (
        <div className="mb-4 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 px-4 py-3 text-sm text-[var(--success)]">
          Tab access saved. Affected users will see the change the next time they reload the editor.
        </div>
      )}
      {saveState === 'error' && (
        <div className="mb-4 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
          Failed to save tab access.{saveError ? ` ${saveError}` : ''}
        </div>
      )}

      {loading ? (
        <LoadingSection />
      ) : grantsError ? (
        <div className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
          Could not load existing grants: {grantsError}. Make sure the <span className="font-mono">gh-tab-access</span>{' '}
          model has been synced (see Model Sync below).
        </div>
      ) : (
        <>
          {rosterWarning && (
            <div className="mb-4 rounded-lg bg-[var(--warning)]/10 border border-[var(--warning)]/20 px-4 py-3 text-xs text-[var(--warning)]">
              Couldn&apos;t load the full user list ({rosterWarning}). You can still grant access by entering a
              user&apos;s email below.
            </div>
          )}

          {/* Add a user by email — fallback for when the roster can't be listed
              or for granting access to a user not yet in the space list. */}
          <div className="mb-4 flex items-center gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addUser();
                }
              }}
              placeholder="user@email.com"
              className="flex-1 max-w-xs px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-glass)] border border-[var(--border-glass)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
            />
            <SmallButton onClick={addUser} disabled={!newEmail.trim()}>
              Add user
            </SmallButton>
          </div>

          {rows.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)]">
              No users yet. Add a user by email above to grant tab access.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-glass)]">
                    <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">User</th>
                    {CONTROLLABLE_TABS.map((t) => (
                      <th
                        key={t.path}
                        className="pb-3 px-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide text-center"
                      >
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const key = rowKey(r);
                    const fullAccess = isFullAccessRole(r.role);
                    return (
                      <tr key={key} className="border-b border-[var(--border-glass)] last:border-b-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-primary)] break-all">
                              {r.name || r.email || '(no email)'}
                            </span>
                            {r.role && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[var(--bg-glass)] text-[var(--text-muted)] capitalize">
                                {r.role}
                              </span>
                            )}
                          </div>
                          {r.name && r.email && (
                            <div className="text-[11px] text-[var(--text-muted)] break-all">{r.email}</div>
                          )}
                        </td>
                        {fullAccess ? (
                          <td colSpan={CONTROLLABLE_TABS.length} className="py-3 px-3 text-center">
                            <StatusBadge variant="success" label="Full access" />
                          </td>
                        ) : (
                          CONTROLLABLE_TABS.map((t) => (
                            <td key={t.path} className="py-3 px-3 text-center">
                              <select
                                value={draft[key]?.[t.path] ?? 'none'}
                                onChange={(e) => setLevel(key, t.path, e.target.value as TabAccessLevel)}
                                aria-label={`${r.email} access to ${t.name}`}
                                className="px-2 py-1 rounded-lg text-xs bg-[var(--bg-glass)] border border-[var(--border-glass)] text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[var(--accent)]"
                              >
                                {ACCESS_LEVELS.map((lvl) => (
                                  <option key={lvl.value} value={lvl.value}>
                                    {lvl.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          ))
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Section>
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
  const [syncingModel, setSyncingModel] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);

  // Space info
  const currentOrg = context.user.organizations.find((org) => org.value.id === context.user.currentOrganization);
  const orgName = currentOrg?.value.name ?? 'Unknown';
  const apiKey = context.user.apiKey;
  const authHeaders = context.user.authHeaders as Record<string, string>;

  const modelStatuses = getModelStatuses(context.models.result);
  const unmanagedModels = getUnmanagedModels(context.models.result);
  const fieldDiffs = getFieldDiffs(context as any);

  // ---- Connection tests ----

  const testCdn = useCallback(async () => {
    setCdnTest({ status: 'testing' });
    const start = Date.now();
    try {
      const resp = await fetch(`https://cdn.builder.io/api/v3/content/gh-brand-config?apiKey=${apiKey}&limit=1`, {
        headers: authHeaders,
      });
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
      const elapsed = Date.now() - start;
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
        setApiTest({
          status: 'error',
          time: elapsed,
          error:
            'CORS blocked — the Commerce API server does not allow requests from this origin. Test from a backend or use the API directly.',
        });
      } else {
        setApiTest({ status: 'error', time: elapsed, error: msg });
      }
    }
  }, [settings.apiUrl, settings.apiUser, settings.apiPassword, brandDisplay]);

  const testWrite = useCallback(async () => {
    setWriteTest({ status: 'testing' });
    const start = Date.now();
    try {
      const resp = await fetch('https://cdn.builder.io/api/v2/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.privateApiKey}`,
        },
        body: JSON.stringify({ query: '{ settings }' }),
      });
      const elapsed = Date.now() - start;
      const json = await resp.json();
      if (resp.ok && !json.errors?.length) {
        setWriteTest({ status: 'success', time: elapsed });
      } else {
        const errMsg = json.errors?.[0]?.message ?? `${resp.status}`;
        setWriteTest({ status: 'error', time: elapsed, error: errMsg });
      }
    } catch (e) {
      setWriteTest({ status: 'error', time: Date.now() - start, error: e instanceof Error ? e.message : String(e) });
    }
  }, [settings.privateApiKey]);

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
    }
  }, [context]);

  const handleSyncSingle = useCallback(
    async (modelName: string) => {
      setSyncingModel(modelName);
      setSyncResults(null);
      try {
        const result = await syncSingleModel(modelName, context as any);
        setSyncResults([result]);
      } finally {
        setSyncingModel(null);
      }
    },
    [context],
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
            <InfoRow label="Private API Key" value={settings.privateApiKey ? 'Configured' : 'Not set'} />
          </div>
        </Section>

        {/* ---- Section 4: Tab Access ---- */}
        <TabAccessSection context={context} />

        {/* ---- Section 5: Model Sync ---- */}
        <Section
          title="Model Sync"
          subtitle={`${modelStatuses.filter((s) => s.exists).length} of ${MODEL_DEFINITIONS.length} models synced`}
          actions={
            <AccentButton onClick={handleSyncAll} disabled={syncingAll}>
              {syncingAll ? 'Syncing...' : 'Sync All Models'}
            </AccentButton>
          }
        >
          <VersionIndicator version={SCHEMA_VERSION} />

          {/* Models this package defines that don't yet exist on the brand —
              these are what the sync will add. */}
          {modelStatuses.some((s) => !s.exists) && (
            <CollapsibleBanner
              variant="success"
              summary={`${modelStatuses.filter((s) => !s.exists).length} model${
                modelStatuses.filter((s) => !s.exists).length === 1 ? '' : 's'
              } will be added by the sync`}
            >
              <div className="text-xs text-[var(--text-secondary)]">
                These models are defined by this package but don&apos;t exist on the brand yet. Running the sync will
                create them.
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {modelStatuses
                  .filter((s) => !s.exists)
                  .map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono bg-[var(--success)]/15 text-[var(--success)]"
                      title={s.displayName}
                    >
                      {s.name}
                    </span>
                  ))}
              </div>
            </CollapsibleBanner>
          )}

          {/* Field-level diff for existing models: fields the sync will add
              (safe) or remove (drops the field and its content). */}
          {fieldDiffs.length > 0 && (
            <CollapsibleBanner
              variant="neutral"
              summary={`Field changes on ${fieldDiffs.length} existing model${fieldDiffs.length === 1 ? '' : 's'}`}
            >
              <div className="text-xs text-[var(--text-secondary)]">
                The sync replaces each model&apos;s shape. Fields shown in green will be added; fields in red will be
                removed along with any content stored in them.
              </div>
              <div className="mt-3 space-y-2.5">
                {fieldDiffs.map((diff) => (
                  <div key={diff.name}>
                    <div className="text-xs font-medium text-[var(--text-primary)]">
                      {diff.displayName} <span className="text-[var(--text-muted)] font-mono">({diff.name})</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {diff.added.map((f) => (
                        <span
                          key={`add-${f}`}
                          className="text-[11px] px-2 py-0.5 rounded font-mono bg-[var(--success)]/15 text-[var(--success)]"
                        >
                          + {f}
                        </span>
                      ))}
                      {diff.removed.map((f) => (
                        <span
                          key={`rm-${f}`}
                          className="text-[11px] px-2 py-0.5 rounded font-mono bg-[var(--error)]/15 text-[var(--error)]"
                        >
                          − {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleBanner>
          )}

          {/* Unmanaged-model warning: models on this brand that this package
              does not define. They are not synced and risk being orphaned. */}
          {unmanagedModels.length > 0 && (
            <CollapsibleBanner
              variant="warning"
              summary={
                <>
                  {unmanagedModels.length} model{unmanagedModels.length === 1 ? '' : 's'} on this brand{' '}
                  {unmanagedModels.length === 1 ? 'is' : 'are'} not part of this package
                </>
              }
            >
              <div className="text-xs text-[var(--text-secondary)]">
                These models exist on the brand but aren&apos;t managed by the sync. They won&apos;t be maintained and
                could be dropped or orphaned — relocate any content you need to keep before re-provisioning.
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {unmanagedModels.map((m) => (
                  <span
                    key={m.modelId}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono bg-[var(--warning)]/15 text-[var(--warning)]"
                    title={m.kind ? `kind: ${m.kind}` : undefined}
                  >
                    {m.name}
                    {m.kind && <span className="opacity-60">· {m.kind}</span>}
                  </span>
                ))}
              </div>
            </CollapsibleBanner>
          )}

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
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide">
                    Dependencies
                  </th>
                  <th className="pb-3 text-xs font-semibold text-[var(--text-secondary)] tracking-wide text-right">
                    Action
                  </th>
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
