import React, { useCallback, useState } from 'react';
import { BuilderFunnelDestinationContent } from '@goldenhippo/builder-funnel-schemas';
import { DetailHeader, FormField, Section, StatusBadge } from '@goldenhippo/builder-ui';
import { FunnelAppData } from '../../App';
import { ExtendedApplicationContext } from '../../interfaces/application-context.interface';
import BuilderApi from '../../services/builder-api';

interface DestinationDetailProps {
  item: BuilderFunnelDestinationContent;
  data: FunnelAppData;
  context: ExtendedApplicationContext;
  onBack: () => void;
  onRefresh: () => Promise<void>;
}

const DestinationDetailPage: React.FC<DestinationDetailProps> = ({ item, data, context, onBack, onRefresh }) => {
  const d = item.data;
  const [name, setName] = useState<string>(d?.name ?? '');
  const [slug, setSlug] = useState<string>(d?.slug ?? '');
  const [status, setStatus] = useState<string>(d?.status ?? 'active');
  const [deleting, setDeleting] = useState(false);
  const [slugError, setSlugError] = useState('');

  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  const validateSlug = (value: string) => {
    if (!value) {
      setSlugError('');
      return;
    }
    if (!slugPattern.test(value)) {
      setSlugError('Slug must be lowercase letters, numbers, and hyphens only');
      return;
    }
    const existing = data.destinations.find((dest) => dest.data?.slug === value && dest.id !== item.id);
    if (existing) {
      setSlugError('This slug is already in use by another destination');
      return;
    }
    setSlugError('');
  };

  const handleSlugChange = (value: string) => {
    const normalized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(normalized);
    validateSlug(normalized);
  };

  const handleDelete = useCallback(async () => {
    try {
      const confirmed = await context.dialogs.prompt({
        title: 'Delete Destination',
        text: `Type "DELETE" to confirm deleting "${name}".`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      if (confirmed !== 'DELETE') return;
      setDeleting(true);
      const api = new BuilderApi(context);
      await api.removeContent(item);
      onRefresh();
      onBack();
    } catch {
      // user cancelled prompt
    } finally {
      setDeleting(false);
    }
  }, [context, item, name, onBack, onRefresh]);

  return (
    <div className="max-w-4xl mx-auto">
      <DetailHeader
        title={d?.name ?? 'Destination'}
        onBack={onBack}
        actions={
          <>
            <button className="btn btn-error btn-outline" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      />

      {d?.splitTest?.productionId && (
        <Section title="Active Split Test">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium">{d.splitTest.name ?? 'Untitled'}</span>
              <StatusBadge status="active" />
              <span className="text-sm text-base-content/50">{d.splitTest.options.length ?? 0} variant(s)</span>
            </div>
          </div>
        </Section>
      )}

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Destination Name" required>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>
          <FormField label="URL Slug" required error={slugError}>
            <div className="join w-full">
              <span className="join-item btn btn-disabled no-animation">/d/</span>
              <input
                type="text"
                className={`input input-bordered join-item w-full ${slugError ? 'input-error' : ''}`}
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
            </div>
          </FormField>
          <FormField label="Status">
            <select
              className="select select-bordered w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          {/* Follow Control Updates — hidden until feature is ready
          <FormField label="Follow Control Updates">
            <label className="flex items-center gap-3 cursor-pointer mt-1">
              <input type="checkbox" className="checkbox" checked={followControl} onChange={(e) => setFollowControl(e.target.checked)} />
              <span className="text-sm">Auto-swap primary funnel when the offer&apos;s control changes</span>
            </label>
          </FormField>
          */}
        </div>
      </Section>
    </div>
  );
};

export default DestinationDetailPage;
