import React, { useEffect, useState } from 'react';
import { BuilderContent } from '@builder.io/sdk';
import { observer } from 'mobx-react';
import { Section, FormField, ImagePicker } from '@goldenhippo/builder-ui';
import { SectionProps } from './section-props';

const IMAGE_FIELDS = [
  { key: 'brandLogoSmall', label: 'Logo (Small)' },
  { key: 'brandLogoLarge', label: 'Logo (Large)' },
  { key: 'brandLogoFooter', label: 'Logo (Footer)' },
  { key: 'bbbImage', label: 'BBB Image' },
  { key: 'accesibilityLogo', label: 'Accessibility Logo' },
  { key: 'brandLogoOffWhite', label: 'Logo (Off-White)' },
  { key: 'defaultPetProfileImage', label: 'Default Pet Profile Image' },
  { key: 'defaultCatProfileImage', label: 'Default Cat Profile Image' },
  { key: 'defaultDogProfileImage', label: 'Default Dog Profile Image' },
  { key: 'linklessPageHeaderLogo', label: 'Linkless Header Image' },
];

const LINK_FIELDS = [
  { key: 'termsLink', label: 'Terms of Service Link' },
  { key: 'subscriptionTermsLink', label: 'Subscription Terms of Service Link' },
  { key: 'privacyLink', label: 'Privacy Policy Link' },
  { key: 'ccpaLink', label: 'CCPA Link' },
  { key: 'bbbLink', label: 'BBB Link' },
  { key: 'accessibiltyLink', label: 'Accessibility Link' },
];

const SOCIAL_FIELDS = [
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'pinterest', label: 'Pinterest' },
  { key: 'tiktok', label: 'TikTok' },
];

const GeneralSection: React.FC<SectionProps> = observer(({ data, onChangeRoot, markDirty, api }) => {
  const [bannerEntries, setBannerEntries] = useState<BuilderContent[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  useEffect(() => {
    api
      .getModelEntries('banner')
      .then((entries) => setBannerEntries(entries))
      .catch((err) => console.error('[Hippo Commerce] Failed to fetch banner entries:', err))
      .finally(() => setLoadingBanners(false));
  }, [api]);
  const images = data.images || {};
  const links = data.links || {};
  const socialMedia = links.socialMedia || {};

  const onImageChange = (key: string, value: string) => {
    if (!data.images) data.images = {};
    data.images[key] = value;
    markDirty();
  };

  const onLinkChange = (key: string, value: string) => {
    if (!data.links) data.links = {};
    data.links[key] = value;
    markDirty();
  };

  const onSocialChange = (key: string, value: string) => {
    if (!data.links) data.links = {};
    if (!data.links.socialMedia) data.links.socialMedia = {};
    data.links.socialMedia[key] = value;
    markDirty();
  };

  return (
    <div className="space-y-6">
      <Section title="Brand Display Name">
        <FormField label="Brand Display Name" helper="The brand name displayed across the website" required>
          <input
            type="text"
            className="hippo-input"
            value={data.brandDisplayName ?? ''}
            onChange={(e) => onChangeRoot('brandDisplayName', e.target.value)}
          />
        </FormField>
      </Section>

      <Section title="Brand Images" subtitle="Logo and brand images used throughout the website">
        <div className="flex flex-wrap gap-5">
          {IMAGE_FIELDS.map(({ key, label }) => (
            <ImagePicker
              key={key}
              label={label}
              value={typeof images[key] === 'string' ? images[key] : undefined}
              onChange={(url) => onImageChange(key, url ?? '')}
            />
          ))}
        </div>
      </Section>

      <Section title="General Links" subtitle="Links to legal pages and external profiles">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {LINK_FIELDS.map(({ key, label }) => (
              <FormField key={key} label={label}>
                <input
                  type="text"
                  className="hippo-input"
                  placeholder="https://..."
                  value={links[key] ?? ''}
                  onChange={(e) => onLinkChange(key, e.target.value)}
                />
              </FormField>
            ))}
          </div>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-[var(--border-glass)]" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">
              Social Media
            </span>
            <div className="flex-1 h-px bg-[var(--border-glass)]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            {SOCIAL_FIELDS.map(({ key, label }) => (
              <FormField key={key} label={label}>
                <input
                  type="text"
                  className="hippo-input"
                  placeholder="https://..."
                  value={socialMedia[key] ?? ''}
                  onChange={(e) => onSocialChange(key, e.target.value)}
                />
              </FormField>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Banners" subtitle="Sitewide banners displayed above page-specific announcements">
        {loadingBanners ? (
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        ) : (
          <div className="space-y-4">
            {(data.banners ?? []).map((item: any, index: number) => {
              const selectedId = item.banner?.value?.id ?? item.banner?.id ?? '';
              return (
                <div key={index} className="rounded-lg border border-[var(--border-glass)] p-4 space-y-3">
                  <FormField label="Banner">
                    <select
                      className="hippo-input"
                      value={selectedId}
                      onChange={(e) => {
                        const entry = bannerEntries.find((b) => b.id === e.target.value);
                        if (entry) {
                          item.banner = { '@type': '@builder.io/core:Reference', model: 'banner', id: entry.id };
                        } else {
                          item.banner = undefined;
                        }
                        markDirty();
                      }}
                    >
                      <option value="">Select a banner...</option>
                      {bannerEntries.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <div className="flex items-center justify-between py-3.5 border-b border-[var(--border-glass)] last:border-b-0">
                    <div className="text-sm font-medium text-[var(--text-primary)]">Always Show?</div>
                    <input
                      type="checkbox"
                      className="hippo-toggle"
                      checked={!!item.alwaysShow}
                      onChange={(e) => {
                        item.alwaysShow = e.target.checked;
                        markDirty();
                      }}
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-2 py-1 rounded text-[11px] font-medium text-[var(--error)] cursor-pointer hover:bg-[var(--error)]/10 transition-colors"
                      onClick={() => {
                        data.banners.splice(index, 1);
                        markDirty();
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-glass)] bg-[var(--bg-glass)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-glass-hover)] transition-colors"
              onClick={() => {
                if (!data.banners) data.banners = [];
                data.banners.push({ banner: undefined, alwaysShow: false });
                markDirty();
              }}
            >
              Add Banner
            </button>
          </div>
        )}
      </Section>
    </div>
  );
});

export default GeneralSection;
